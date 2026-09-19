import { Router, Response } from 'express';
import { db } from '../datastore';
import { AuthRequest, authenticateUser } from '../middleware/auth';
import { IBooking } from '../types';

const router = Router();

// POST /api/bookings - Create booking (Protected: Customers/Users)
router.post('/', authenticateUser, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Please login to book a service.' });
    }

    const { workerId, service, date, time, description, image, location, paymentMethod, amount } = req.body;

    if (!workerId || !service || !date || !time || !location || !location.address) {
      return res.status(400).json({ success: false, message: 'Please fill in all booking details (worker, service, date, time, address).' });
    }

    const worker = db.getWorkerById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Selected worker does not exist.' });
    }

    if (worker.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'This worker is currently not available for booking.' });
    }

    const bookingId = 'bkg-' + Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `HA-${new Date().getFullYear()}-${randomSuffix}`;

    const newBooking: IBooking = {
      _id: bookingId,
      id: bookingId,
      bookingNumber,
      customer: req.user.id,
      worker: workerId,
      service,
      date,
      time,
      description: description || '',
      image: image || '',
      location: {
        address: location.address,
        city: location.city || worker.city || 'Bangalore',
        area: location.area || 'City Area',
        lat: location.lat || worker.location?.lat,
        lng: location.lng || worker.location?.lng,
      },
      bookingStatus: 'Pending',
      paymentStatus: paymentMethod === 'Mock UPI' ? 'Paid' : 'COD',
      paymentMethod: paymentMethod === 'Mock UPI' ? 'Mock UPI' : 'COD',
      amount: Number(amount) || worker.hourlyRate || 350,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = db.createBooking(newBooking);
    const populated = db.populateBooking(created);

    return res.status(201).json({
      success: true,
      message: 'Booking request placed successfully! The worker has been notified.',
      booking: populated,
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create booking.' });
  }
});

// GET /api/bookings/my - Customer's bookings
router.get('/my', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  const bookings = db.getBookings()
    .filter(b => {
      const cId = typeof b.customer === 'string' ? b.customer : (b.customer as any)._id;
      return cId === req.user!.id;
    })
    .map(b => db.populateBooking(b));

  return res.json({ success: true, count: bookings.length, bookings });
});

// GET /api/bookings/worker - Worker's bookings
router.get('/worker', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  const worker = db.getWorkerByUserId(req.user.id);
  if (!worker && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Worker profile required.' });
  }

  const workerId = worker ? worker._id : req.query.workerId as string;
  const bookings = db.getBookings()
    .filter(b => {
      const wId = typeof b.worker === 'string' ? b.worker : (b.worker as any)._id;
      return wId === workerId;
    })
    .map(b => db.populateBooking(b));

  return res.json({ success: true, count: bookings.length, bookings });
});

// GET /api/bookings/:id - Single booking
router.get('/:id', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  // Security check: customer, worker, or admin only
  const cId = typeof booking.customer === 'string' ? booking.customer : (booking.customer as any)._id;
  const workerObj = typeof booking.worker === 'string' ? db.getWorkerById(booking.worker) : booking.worker;
  const isWorkerOwner = workerObj && ((workerObj as any).user === req.user.id || (workerObj as any)._id === req.user.id);

  if (cId !== req.user.id && !isWorkerOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied to this booking.' });
  }

  return res.json({ success: true, booking: db.populateBooking(booking) });
});

// PUT /api/bookings/:id/status - Update booking status
router.put('/:id/status', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });

  const { status, notes, paymentStatus } = req.body;
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  const cId = typeof booking.customer === 'string' ? booking.customer : (booking.customer as any)._id;
  const workerObj = typeof booking.worker === 'string' ? db.getWorkerById(booking.worker) : booking.worker;
  const isWorkerOwner = workerObj && ((workerObj as any).user === req.user.id || (workerObj as any)._id === req.user.id);
  const isAdmin = req.user.role === 'admin';

  // Customer can cancel if pending or accepted
  if (cId === req.user.id && !isAdmin && !isWorkerOwner) {
    if (status !== 'Cancelled') {
      return res.status(403).json({ success: false, message: 'Customers can only cancel bookings.' });
    }
    if (booking.bookingStatus === 'Completed') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot be cancelled.' });
    }
  }

  // Worker can Accept, Reject, Complete
  if (isWorkerOwner && !isAdmin) {
    if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update for worker.' });
    }
  }

  // Update booking
  const updateData: Partial<IBooking> = {
    ...(status && { bookingStatus: status }),
    ...(paymentStatus && { paymentStatus }),
    ...(notes && (isWorkerOwner ? { workerNotes: notes } : { customerNotes: notes })),
  };

  // If completed, increment worker's completedJobs count and mark COD as Paid
  if (status === 'Completed') {
    updateData.paymentStatus = 'Paid';
    const wId = typeof booking.worker === 'string' ? booking.worker : (booking.worker as any)._id;
    const w = db.getWorkerById(wId);
    if (w) {
      db.updateWorker(w._id, { completedJobs: (w.completedJobs || 0) + 1 });
    }
  }

  const updated = db.updateBooking(booking._id, updateData);

  return res.json({
    success: true,
    message: `Booking has been marked as ${status}.`,
    booking: db.populateBooking(updated!),
  });
});

export default router;
