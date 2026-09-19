import React, { useEffect, useState } from 'react';
import { MessageSquare, AlertCircle, PlusCircle, CheckCircle2, Clock } from 'lucide-react';
import { Complaint, Booking } from '../../types';
import { complaintService, bookingService } from '../../services';
import { StatusBadge } from '../../components/StatusBadge';
import { useNotification } from '../../context/NotificationContext';

export const CustomerComplaintsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, bookRes] = await Promise.all([
        complaintService.getMyComplaints(),
        bookingService.getCustomerBookings(),
      ]);
      if (compRes.success) setComplaints(compRes.complaints);
      if (bookRes.success) setBookings(bookRes.bookings);
    } catch {
      showToast('Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await complaintService.submitComplaint({
        title,
        description,
        bookingId: selectedBookingId || undefined,
      });
      if (res.success) {
        showToast('Complaint submitted. Support desk will review it shortly.', 'success');
        setTitle('');
        setDescription('');
        setSelectedBookingId('');
        setShowForm(false);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit complaint', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Support & Complaints</h1>
          <p className="text-xs text-slate-500 mt-0.5">Report service disputes, quality issues, or billing queries</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'File a Complaint'}</span>
        </button>
      </div>

      {/* New Complaint Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900">Submit Grievance to Platform Administrators</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Subject</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Technician arrived 2 hours late / Workmanship issue"
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Related Booking (Optional)</label>
              <select
                value={selectedBookingId}
                onChange={(e) => setSelectedBookingId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 bg-white"
              >
                <option value="">None / General Inquiry</option>
                {bookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.bookingNumber} - {b.service} ({b.date})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Explanation</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened and how we can assist you..."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complaints List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading tickets...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No active complaints or tickets</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't filed any complaints. If you ever face an issue with a booking, submit a ticket above.
            </p>
          </div>
        ) : (
          complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                <StatusBadge status={c.status} />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>
              <p className="text-[10px] text-slate-400">
                Logged on {new Date(c.createdAt).toLocaleDateString()}
              </p>

              {/* Admin response if available */}
              {c.adminResponse && (
                <div className="mt-3 p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Administrator Resolution</span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">{c.adminResponse}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
