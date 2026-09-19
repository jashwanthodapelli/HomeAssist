import { Router, Request, Response } from 'express';
import { db } from '../datastore';
import { AuthRequest, authenticateUser, optionalAuth } from '../middleware/auth';
import { IWorker } from '../types';

const router = Router();

// Helper to sanitize worker for public/guest browsing vs full profile
const sanitizeWorkerForPublic = (worker: IWorker) => {
  return {
    _id: worker._id,
    id: worker._id,
    name: worker.name,
    profession: worker.profession,
    services: worker.services,
    experience: worker.experience,
    rating: worker.rating,
    totalReviews: worker.totalReviews,
    completedJobs: worker.completedJobs,
    availability: worker.availability,
    verificationStatus: worker.verificationStatus,
    status: worker.status,
    city: worker.city,
    serviceArea: worker.serviceArea,
    profileImage: worker.profileImage,
    hourlyRate: worker.hourlyRate,
    location: worker.location ? {
      lat: worker.location.lat,
      lng: worker.location.lng,
      addressText: worker.location.addressText || worker.city,
    } : undefined,
  };
};

// GET /api/workers - Public worker search & listing
router.get('/', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const { category, search, rating, experience, availability, sort, city } = req.query;

    // Only approved and active workers are visible to normal customers/guests
    let workers = db.getWorkers().filter(w => w.status === 'Approved');

    // Filter by category
    if (category && category !== 'All' && typeof category === 'string') {
      workers = workers.filter(w => 
        w.services.some(s => s.toLowerCase() === category.toLowerCase()) ||
        w.profession.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Filter by search query (name, profession, skills, service area)
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      workers = workers.filter(w => 
        w.name?.toLowerCase().includes(q) ||
        w.profession.toLowerCase().includes(q) ||
        w.services.some(s => s.toLowerCase().includes(q)) ||
        w.skills.some(sk => sk.toLowerCase().includes(q)) ||
        w.serviceArea.toLowerCase().includes(q) ||
        w.city.toLowerCase().includes(q)
      );
    }

    // Filter by city
    if (city && typeof city === 'string' && city !== 'All') {
      workers = workers.filter(w => w.city.toLowerCase() === city.toLowerCase());
    }

    // Filter by min rating
    if (rating && !isNaN(Number(rating))) {
      workers = workers.filter(w => w.rating >= Number(rating));
    }

    // Filter by min experience
    if (experience && !isNaN(Number(experience))) {
      workers = workers.filter(w => w.experience >= Number(experience));
    }

    // Filter by availability
    if (availability && typeof availability === 'string' && availability !== 'All') {
      workers = workers.filter(w => w.availability.toLowerCase() === availability.toLowerCase());
    }

    // Sort workers
    if (sort === 'rating') {
      workers.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'experience') {
      workers.sort((a, b) => b.experience - a.experience);
    } else if (sort === 'jobs') {
      workers.sort((a, b) => b.completedJobs - a.completedJobs);
    } else {
      // Default: best rating & completed jobs
      workers.sort((a, b) => (b.rating * 10 + b.completedJobs) - (a.rating * 10 + a.completedJobs));
    }

    const publicList = workers.map(sanitizeWorkerForPublic);
    return res.json({ success: true, count: publicList.length, workers: publicList });
  } catch (error: any) {
    console.error('Fetch workers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch workers.' });
  }
});

// GET /api/workers/featured - Top rated approved workers for home page
router.get('/featured', (req: Request, res: Response) => {
  try {
    const featured = db.getWorkers()
      .filter(w => w.status === 'Approved')
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6)
      .map(sanitizeWorkerForPublic);

    return res.json({ success: true, workers: featured });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching featured workers' });
  }
});

// GET /api/workers/me/dashboard - Authenticated Worker Dashboard
router.get('/me/dashboard', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'worker' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Worker access required.' });
  }

  const worker = db.getWorkerByUserId(req.user.id);
  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker profile not found.' });
  }

  const allBookings = db.getBookings().filter(b => {
    const wId = typeof b.worker === 'string' ? b.worker : (b.worker as any)._id;
    return wId === worker._id;
  });

  const populatedBookings = allBookings.map(b => db.populateBooking(b));
  const reviews = db.getReviewsByWorkerId(worker._id).map(r => db.populateReview(r));

  const stats = {
    totalBookings: allBookings.length,
    pendingBookings: allBookings.filter(b => b.bookingStatus === 'Pending').length,
    acceptedBookings: allBookings.filter(b => b.bookingStatus === 'Accepted').length,
    completedJobs: allBookings.filter(b => b.bookingStatus === 'Completed').length,
    cancelledBookings: allBookings.filter(b => b.bookingStatus === 'Cancelled').length,
    averageRating: worker.rating,
    totalReviews: worker.totalReviews,
    availability: worker.availability,
    verificationStatus: worker.verificationStatus,
    status: worker.status,
  };

  return res.json({
    success: true,
    worker,
    stats,
    recentBookings: populatedBookings.slice(0, 10),
    reviews: reviews.slice(0, 5),
  });
});

// PUT /api/workers/me/profile - Update worker skills, services, bio, etc.
router.put('/me/profile', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'worker' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Worker privileges required.' });
  }

  const worker = db.getWorkerByUserId(req.user.id);
  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker profile not found.' });
  }

  const { profession, services, experience, skills, about, serviceArea, city, address, hourlyRate, availability, location } = req.body;

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
    ...(availability && { availability }),
    ...(location && { location }),
  });

  return res.json({
    success: true,
    message: 'Worker profile updated successfully.',
    worker: updated,
  });
});

// PUT /api/workers/me/availability - Quick toggle
router.put('/me/availability', authenticateUser, (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'worker') {
    return res.status(403).json({ success: false, message: 'Worker access required.' });
  }

  const worker = db.getWorkerByUserId(req.user.id);
  if (!worker) return res.status(404).json({ success: false, message: 'Worker not found.' });

  const { availability } = req.body;
  if (!['Available', 'Busy', 'Offline'].includes(availability)) {
    return res.status(400).json({ success: false, message: 'Invalid availability status.' });
  }

  const updated = db.updateWorker(worker._id, { availability });
  return res.json({ success: true, availability: updated?.availability });
});

// GET /api/workers/:id - View worker profile
// CRITICAL REQUIREMENT: Guests CANNOT view full worker profile! They must be logged in.
router.get('/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const worker = db.getWorkerById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found.' });
    }

    // If request is from unauthenticated guest, return 401 with strict message
    if (!req.user) {
      return res.status(401).json({
        success: false,
        requireLogin: true,
        message: 'Please login to view full worker profile and book services.',
      });
    }

    // Authenticated user can see complete details
    const reviews = db.getReviewsByWorkerId(worker._id).map(r => db.populateReview(r));

    // Check if favorited by current user
    let isFavorite = false;
    if (req.user) {
      const favs = db.getFavorites(req.user.id);
      isFavorite = favs.some(f => f.worker === worker._id);
    }

    return res.json({
      success: true,
      worker: {
        ...worker,
        isFavorite,
        reviews,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Error retrieving worker profile.' });
  }
});

// GET /api/workers/:id/card - Digital Visiting Card Payload
router.get('/:id/card', (req: Request, res: Response) => {
  const worker = db.getWorkerById(req.params.id);
  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker not found.' });
  }

  const visitingCardData = {
    platform: 'HomeAssist',
    tagline: 'Find. Trust. Book.',
    workerId: worker._id,
    name: worker.name,
    profession: worker.profession,
    services: worker.services,
    experienceYears: worker.experience,
    rating: worker.rating,
    totalReviews: worker.totalReviews,
    completedJobs: worker.completedJobs,
    serviceArea: worker.serviceArea,
    city: worker.city,
    verificationStatus: worker.verificationStatus,
    profileImage: worker.profileImage,
    profileUrl: `/worker/${worker._id}`,
    verifiedBadgeUrl: 'https://cdn-icons-png.flaticon.com/512/7595/7595571.png',
  };

  return res.json({ success: true, card: visitingCardData });
});

export default router;
