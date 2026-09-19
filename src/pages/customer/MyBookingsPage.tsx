import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Star, AlertCircle, 
  CheckCircle2, XCircle, ArrowRight, MessageSquare 
} from 'lucide-react';
import { Booking } from '../../types';
import { bookingService, reviewService } from '../../services';
import { StatusBadge } from '../../components/StatusBadge';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { useNotification } from '../../context/NotificationContext';

export const MyBookingsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getCustomerBookings();
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch (err) {
      showToast('Failed to load your bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking appointment?')) return;
    try {
      const res = await bookingService.updateBookingStatus(bookingId, { status: 'Cancelled' });
      if (res.success) {
        showToast('Booking cancelled successfully.', 'info');
        fetchBookings();
      }
    } catch {
      showToast('Could not cancel booking.', 'error');
    }
  };

  const openReviewModal = (booking: Booking) => {
    setSelectedBookingForReview(booking);
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;
    try {
      setSubmittingReview(true);
      const res = await reviewService.submitReview({
        bookingId: selectedBookingForReview._id,
        rating,
        comment,
      });
      if (res.success) {
        showToast('Thank you! Your verified review has been published.', 'success');
        setReviewModalOpen(false);
        fetchBookings();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'All') return true;
    return b.bookingStatus.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track your past and active service appointments</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No bookings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any bookings under the "{filter}" filter. Book a technician today for any home repair.
          </p>
          <Link
            to="/search"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Find a Worker
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const workerObj = typeof booking.worker === 'object' ? booking.worker : null;
            return (
              <div
                key={booking._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      workerObj?.profileImage ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(workerObj?.name || 'Worker')}`
                    }
                    alt="Worker"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-2xs shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-blue-600">
                        {booking.bookingNumber}
                      </span>
                      <StatusBadge status={booking.bookingStatus} />
                      <StatusBadge status={booking.paymentStatus} />
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{booking.service}</h3>
                    <p className="text-xs text-slate-600">
                      Assigned Professional: <strong>{workerObj?.name || 'Assigned Worker'}</strong>
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {booking.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {booking.location?.area || booking.location?.city}
                      </span>
                    </div>

                    {booking.description && (
                      <p className="text-xs text-slate-500 pt-1 italic line-clamp-1">
                        "{booking.description}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {booking.bookingStatus === 'Completed' && (
                    <button
                      onClick={() => openReviewModal(booking)}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Write Review</span>
                    </button>
                  )}

                  {(booking.bookingStatus === 'Pending' || booking.bookingStatus === 'Accepted') && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  )}

                  {workerObj && (
                    <Link
                      to={`/worker/${workerObj._id}`}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Worker Profile
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write Review Modal */}
      {reviewModalOpen && selectedBookingForReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              Review Service Experience
            </h3>
            <p className="text-xs text-slate-500">
              Only verified customers with completed appointments can rate this worker.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1.5 focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating}.0 / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Detailed Feedback</label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about punctuality, quality of repair, polite behavior, etc..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
