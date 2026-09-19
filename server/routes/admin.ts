import { Router, Response } from 'express';
import { db } from '../datastore';
import { AuthRequest, authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Middleware: all admin routes require authenticated admin
router.use(authenticateUser, requireAdmin);

// GET /api/admin/stats
router.get('/stats', (req: AuthRequest, res: Response) => {
  try {
    const users = db.getUsers();
    const workers = db.getWorkers();
    const bookings = db.getBookings();
    const services = db.getServices();
    const categories = db.getCategories();
    const reviews = db.getReviews();
    const complaints = db.getComplaints();
    const customServices = db.getCustomServices();

    const stats = {
      totalUsers: users.length,
      customersCount: users.filter(u => u.role === 'user').length,
      totalWorkers: workers.length,
      pendingWorkers: workers.filter(w => w.status === 'Pending').length,
      approvedWorkers: workers.filter(w => w.status === 'Approved').length,
      rejectedWorkers: workers.filter(w => w.status === 'Rejected').length,
      suspendedWorkers: workers.filter(w => w.status === 'Suspended').length,
      
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.bookingStatus === 'Pending').length,
      acceptedBookings: bookings.filter(b => b.bookingStatus === 'Accepted').length,
      completedBookings: bookings.filter(b => b.bookingStatus === 'Completed').length,
      cancelledBookings: bookings.filter(b => b.bookingStatus === 'Cancelled').length,

      totalServices: services.length,
      activeServices: services.filter(s => s.status === 'Active').length,
      totalCategories: categories.length,
      pendingCustomServices: customServices.filter(cs => cs.status === 'Pending').length,

      totalReviews: reviews.length,
      averagePlatformRating: reviews.length > 0 
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)) 
        : 4.8,
      totalComplaints: complaints.length,
      openComplaints: complaints.filter(c => c.status === 'Open' || c.status === 'Under Review').length,

      // Total estimated booking transaction value
      totalTransactionValue: bookings
        .filter(b => b.bookingStatus === 'Completed')
        .reduce((sum, b) => sum + (b.amount || 350), 0),
    };

    // Chart aggregations
    const bookingStatusChart = [
      { name: 'Completed', count: stats.completedBookings, color: '#10B981' },
      { name: 'Accepted', count: stats.acceptedBookings, color: '#3B82F6' },
      { name: 'Pending', count: stats.pendingBookings, color: '#F59E0B' },
      { name: 'Cancelled', count: stats.cancelledBookings, color: '#EF4444' },
    ];

    const categoryBreakdown = categories.map(cat => {
      const workerCount = workers.filter(w => 
        w.services.some(s => s.toLowerCase() === cat.name.toLowerCase())
      ).length;
      return {
        name: cat.name,
        workers: workerCount,
      };
    }).slice(0, 8);

    const monthlyGrowth = [
      { month: 'Oct', users: 4, workers: 2, bookings: 12 },
      { month: 'Nov', users: 6, workers: 4, bookings: 25 },
      { month: 'Dec', users: 8, workers: 7, bookings: 42 },
      { month: 'Jan', users: 10, workers: 9, bookings: 68 },
      { month: 'Feb', users: 12, workers: 12, bookings: 94 },
    ];

    return res.json({
      success: true,
      stats,
      charts: {
        bookingStatus: bookingStatusChart,
        categoryBreakdown,
        monthlyGrowth,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate statistics.' });
  }
});

// --- USER MANAGEMENT ---

// GET /api/admin/users
router.get('/users', (req: AuthRequest, res: Response) => {
  try {
    const { search, role, status } = req.query;
    let users = db.getUsers().map(u => {
      const safe = { ...u };
      delete safe.password;
      return safe;
    });

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
    }

    if (role && role !== 'All') {
      users = users.filter(u => u.role === role);
    }

    if (status && status !== 'All') {
      users = users.filter(u => u.status === status);
    }

    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// PUT /api/admin/users/:id - Edit user or toggle active/disabled status
router.put('/users/:id', (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, city, area, bio, status, role } = req.body;
    const updated = db.updateUser(req.params.id, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(area !== undefined && { area }),
      ...(bio !== undefined && { bio }),
      ...(status && { status }),
      ...(role && { role }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const safe = { ...updated };
    delete safe.password;
    return res.json({ success: true, message: 'User updated successfully.', user: safe });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', (req: AuthRequest, res: Response) => {
  try {
    if (req.params.id === req.user?.id) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete their own account.' });
    }

    const deleted = db.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

// --- WORKER MANAGEMENT & APPROVAL ---

// GET /api/admin/workers
router.get('/workers', (req: AuthRequest, res: Response) => {
  try {
    const { status, search, profession } = req.query;
    let workers = db.getWorkers();

    if (status && status !== 'All') {
      workers = workers.filter(w => w.status === status);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      workers = workers.filter(w => 
        w.name?.toLowerCase().includes(q) || 
        w.profession.toLowerCase().includes(q) ||
        w.email?.toLowerCase().includes(q)
      );
    }

    if (profession && profession !== 'All') {
      workers = workers.filter(w => w.profession.toLowerCase().includes((profession as string).toLowerCase()));
    }

    return res.json({ success: true, count: workers.length, workers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch workers.' });
  }
});

// PUT /api/admin/workers/:id/approve - Approve Worker
router.put('/workers/:id/approve', (req: AuthRequest, res: Response) => {
  try {
    const worker = db.getWorkerById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    const updated = db.updateWorker(worker._id, {
      status: 'Approved',
      verificationStatus: 'Verified',
    });

    return res.json({
      success: true,
      message: `Worker ${worker.name} has been approved and is now active for customer bookings!`,
      worker: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to approve worker.' });
  }
});

// PUT /api/admin/workers/:id/reject - Reject Worker
router.put('/workers/:id/reject', (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const worker = db.getWorkerById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    const updated = db.updateWorker(worker._id, {
      status: 'Rejected',
      verificationStatus: 'Unverified',
      rejectionReason: reason || 'Application did not meet verification criteria.',
    });

    return res.json({
      success: true,
      message: `Worker application for ${worker.name} has been rejected.`,
      worker: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reject worker.' });
  }
});

// PUT /api/admin/workers/:id/suspend - Suspend Worker
router.put('/workers/:id/suspend', (req: AuthRequest, res: Response) => {
  try {
    const worker = db.getWorkerById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    const updated = db.updateWorker(worker._id, {
      status: 'Suspended',
      availability: 'Offline',
    });

    return res.json({
      success: true,
      message: `Worker ${worker.name} has been suspended.`,
      worker: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to suspend worker.' });
  }
});

// PUT /api/admin/workers/:id/activate - Re-activate Worker
router.put('/workers/:id/activate', (req: AuthRequest, res: Response) => {
  try {
    const worker = db.getWorkerById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    const updated = db.updateWorker(worker._id, {
      status: 'Approved',
      availability: 'Available',
    });

    return res.json({
      success: true,
      message: `Worker ${worker.name} has been re-activated.`,
      worker: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to activate worker.' });
  }
});

// PUT /api/admin/workers/:id - Edit Worker details
router.put('/workers/:id', (req: AuthRequest, res: Response) => {
  try {
    const worker = db.getWorkerById(req.params.id);
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

    const { profession, services, experience, skills, about, serviceArea, city, address, hourlyRate, status, verificationStatus } = req.body;
    const updated = db.updateWorker(worker._id, {
      ...(profession && { profession }),
      ...(Array.isArray(services) && { services }),
      ...(experience !== undefined && { experience: Number(experience) }),
      ...(Array.isArray(skills) && { skills }),
      ...(about !== undefined && { about }),
      ...(serviceArea && { serviceArea }),
      ...(city && { city }),
      ...(address !== undefined && { address }),
      ...(hourlyRate !== undefined && { hourlyRate: Number(hourlyRate) }),
      ...(status && { status }),
      ...(verificationStatus && { verificationStatus }),
    });

    return res.json({ success: true, message: 'Worker profile updated.', worker: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to edit worker.' });
  }
});

// DELETE /api/admin/workers/:id
router.delete('/workers/:id', (req: AuthRequest, res: Response) => {
  try {
    const deleted = db.deleteWorker(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Worker not found.' });
    return res.json({ success: true, message: 'Worker record deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete worker.' });
  }
});

// --- BOOKING MANAGEMENT ---

// GET /api/admin/bookings
router.get('/bookings', (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    let bookings = db.getBookings().map(b => db.populateBooking(b));

    if (status && status !== 'All') {
      bookings = bookings.filter(b => b.bookingStatus === status);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      bookings = bookings.filter(b => 
        b.bookingNumber?.toLowerCase().includes(q) ||
        (b.customer as any)?.name?.toLowerCase().includes(q) ||
        (b.worker as any)?.name?.toLowerCase().includes(q) ||
        b.service.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
});

// PUT /api/admin/bookings/:id - Admin update booking status / details
router.put('/bookings/:id', (req: AuthRequest, res: Response) => {
  try {
    const { bookingStatus, paymentStatus, date, time } = req.body;
    const updated = db.updateBooking(req.params.id, {
      ...(bookingStatus && { bookingStatus }),
      ...(paymentStatus && { paymentStatus }),
      ...(date && { date }),
      ...(time && { time }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    return res.json({
      success: true,
      message: 'Booking updated by admin.',
      booking: db.populateBooking(updated),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update booking.' });
  }
});

export default router;
