import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, CheckCircle2, Clock, XCircle, Star, 
  HardHat, QrCode, ArrowRight, User, Phone, MapPin, AlertCircle 
} from 'lucide-react';
import { workerService, bookingService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Booking } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { StatsCardSkeleton } from '../../components/SkeletonLoader';

export const WorkerDashboardPage: React.FC = () => {
  const { worker, setWorkerProfile } = useAuth();
  const { showToast } = useNotification();

  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvail, setTogglingAvail] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await workerService.getWorkerDashboard();
      if (res.success) {
        setStats(res.stats);
        setRecentBookings(res.recentBookings || []);
        if (res.worker) setWorkerProfile(res.worker);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleAvailability = async (newStatus: 'Available' | 'Busy' | 'Offline') => {
    try {
      setTogglingAvail(true);
      const res = await workerService.toggleAvailability(newStatus);
      if (res.success) {
        showToast(`Availability status updated to ${newStatus}`, 'success');
        if (worker) {
          setWorkerProfile({ ...worker, availability: newStatus });
        }
      }
    } catch {
      showToast('Failed to update availability status', 'error');
    } finally {
      setTogglingAvail(false);
    }
  };

  const handleBookingAction = async (bookingId: string, status: 'Accepted' | 'Rejected') => {
    try {
      const res = await bookingService.updateBookingStatus(bookingId, { status });
      if (res.success) {
        showToast(`Booking ${status.toLowerCase()} successfully!`, 'success');
        fetchDashboard();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Could not update booking.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Verification Alert if pending or approved */}
      {worker?.status === 'Pending' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <strong className="font-bold">Account Under Verification:</strong> Your worker profile is currently in the admin review queue. You will be able to receive public bookings once approved.
          </div>
        </div>
      )}

      {/* Header with Live Availability Switcher */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Professional Control Desk</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            Welcome back, {worker?.name?.split(' ')[0] || 'Worker'}!
          </h1>
          <p className="text-xs text-slate-500">Manage client requests, update your live availability, and track jobs</p>
        </div>

        {/* Live Availability Toggle Switch */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-600 px-2">Status:</span>
          {(['Available', 'Busy', 'Offline'] as const).map((st) => (
            <button
              key={st}
              disabled={togglingAvail}
              onClick={() => handleToggleAvailability(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                worker?.availability === st
                  ? st === 'Available'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : st === 'Busy'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Total Bookings</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats?.totalBookings || 0}</p>
            <p className="text-[11px] text-slate-400">All customer requests</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Pending Requests</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">{stats?.pendingBookings || 0}</p>
            <p className="text-[11px] text-slate-400">Awaiting your response</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Completed Jobs</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-600">{stats?.completedJobs || 0}</p>
            <p className="text-[11px] text-slate-400">Successfully delivered</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Avg. Rating</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats?.rating ? stats.rating.toFixed(1) : '5.0'} ★</p>
            <p className="text-[11px] text-slate-400">From {stats?.totalReviews || 0} reviews</p>
          </div>
        </div>
      )}

      {/* Recent Booking Requests */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Service Requests</h3>
            <p className="text-xs text-slate-500">Respond quickly to confirm job appointments</p>
          </div>
          <Link
            to="/worker/bookings"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-2xl">
            No booking requests yet. They will appear here when customers schedule appointments.
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((b) => {
              const cust = typeof b.customer === 'object' ? b.customer : null;
              return (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">{b.bookingNumber}</span>
                      <StatusBadge status={b.bookingStatus} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{b.service}</h4>
                    <p className="text-xs text-slate-600">
                      Customer: <strong>{cust?.name || 'Customer'}</strong> • {cust?.phone}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      📍 {b.location?.address}, {b.location?.area} | 🗓️ {b.date} ({b.time})
                    </p>
                  </div>

                  {b.bookingStatus === 'Pending' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleBookingAction(b._id, 'Accepted')}
                        className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleBookingAction(b._id, 'Rejected')}
                        className="flex-1 sm:flex-initial px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Visiting Card Link Banner */}
      <div className="bg-linear-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base">Your Verified Digital Visiting Card is Ready</h4>
            <p className="text-xs text-slate-300">
              Share your personal QR code and profile link with direct clients to book you seamlessly.
            </p>
          </div>
        </div>
        <Link
          to="/worker/visiting-card"
          className="shrink-0 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-xs transition-colors"
        >
          View Visiting Card
        </Link>
      </div>
    </div>
  );
};
