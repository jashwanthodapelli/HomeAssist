import { Router, Request, Response } from 'express';
import { db } from '../datastore';
import { AuthRequest, authenticateUser, requireAdmin } from '../middleware/auth';
import { IReview } from '../types';

const router = Router();

// GET /api/reviews/worker/:workerId - Worker reviews (Public)
router.get('/worker/:workerId', (req: Request, res: Response) => {
  try {
    const reviews = db.getReviewsByWorkerId(req.params.workerId).map(r => db.populateReview(r));
    return res.json({ success: true, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// POST /api/reviews - Customer submits a review
router.post('/', authenticateUser, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Please login to submit a review.' });

    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Booking ID, rating (1-5), and review comment are required.' });
    }

    const booking = db.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Associated booking not found.' });
    }

    // Must be the customer who booked it
    const cId = typeof booking.customer === 'string' ? booking.customer : (booking.customer as any)._id;
    if (cId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only review your own bookings.' });
    }

    // Booking must be completed!
    if (booking.bookingStatus !== 'Completed') {
      return res.status(400).json({ success: false, message: 'You can only review after the service is completed.' });
    }

    // Prevent duplicate reviews for the same booking
    const existingReviews = db.getReviews();
    const alreadyReviewed = existingReviews.some(r => {
      const bId = typeof r.booking === 'string' ? r.booking : (r.booking as any)._id;
      return bId === bookingId;
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this booking.' });
    }

    const wId = typeof booking.worker === 'string' ? booking.worker : (booking.worker as any)._id;

    const newReview: IReview = {
      _id: 'rev-' + Date.now(),
      id: 'rev-' + Date.now(),
      customer: req.user.id,
      worker: wId,
      booking: bookingId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment,
      createdAt: new Date().toISOString(),
    };

    const created = db.createReview(newReview);
    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      review: db.populateReview(created),
    });
  } catch (error: any) {
    console.error('Review submit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
});

// GET /api/reviews - Admin list all reviews
router.get('/', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const reviews = db.getReviews().map(r => db.populateReview(r));
    return res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
});

// DELETE /api/reviews/:id - Admin moderate review
router.delete('/:id', authenticateUser, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const deleted = db.deleteReview(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    return res.json({ success: true, message: 'Review has been removed by moderator.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
});

export default router;
