import React, { useEffect, useState } from 'react';
import { 
  Calendar, Clock, MapPin, Phone, User, CheckCircle2, 
  XCircle, CheckSquare, MessageSquare 
} from 'lucide-react';
import { bookingService } from '../../services';
import { Booking } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { useNotification } from '../../context/NotificationContext';

export const WorkerBookingsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getWorkerBookings();
      if (res.success) {
        setBookings(res.bookings);
      }
    } catch {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    try {
      const res = await bookingService.updateBookingStatus(id, {
        status,
        notes,
        paymentStatus: status === 'Completed' ? 'Paid' : undefined,
      });
      if (res.success) {
        showToast(`Booking marked as ${status}`, 'success');
        fetchBookings();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleCompleteWithNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;
    handleUpdateStatus(selectedBookingId, 'Completed', completionNotes);
    setNotesModalOpen(false);
    setCompletionNotes('');
    setSelectedBookingId(null);
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'All') return true;
    return b.bookingStatus.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Booking Requests & Jobs</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage customer dispatch requests and track completion</p>
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
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No bookings in this category</h3>
          <p className="text-xs text-slate-500">No jobs match the current filter "{filter}".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const cust = typeof b.customer === 'object' ? b.customer : null;
            return (
              <div
                key={b._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-blue-600">{b.bookingNumber}</span>
                    <StatusBadge status={b.bookingStatus} />
                    <StatusBadge status={b.paymentStatus} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{b.service}</h3>

                  <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {cust?.name || 'Customer'}
                    </span>
                    {cust?.phone && (
                      <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                        <Phone className="w-3.5 h-3.5" />
                        <a href={`tel:${cust.phone}`}>{cust.phone}</a>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {b.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {b.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {b.location?.address}, {b.location?.area}
                    </span>
                  </div>

                  {b.description && (
                    <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600">
                      <strong>Customer Problem:</strong> {b.description}
                    </div>
                  )}

                  {b.image && (
                    <div className="pt-1">
                      <img src={b.image} alt="Attachment" className="w-20 h-20 rounded-xl object-cover border" />
                    </div>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {b.bookingStatus === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'Accepted')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        Accept Job
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'Rejected')}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {b.bookingStatus === 'Accepted' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedBookingId(b._id);
                          setNotesModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckSquare className="w-4 h-4" />
                        <span>Mark as Completed</span>
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'Cancelled')}
                        className="px-3 py-2 text-slate-500 hover:text-rose-600 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {b.bookingStatus === 'Completed' && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Job Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Notes Modal */}
      {notesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900">Mark Service as Completed</h3>
            <p className="text-xs text-slate-500">
              Confirm that you have finished the work at customer location. You can enter any optional notes or parts replaced.
            </p>

            <form onSubmit={handleCompleteWithNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Worker Notes / Replaced Parts</label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Replaced 1/2 inch brass ball valve and tested for leakage."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Confirm Completion
                </button>
                <button
                  type="button"
                  onClick={() => setNotesModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
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
