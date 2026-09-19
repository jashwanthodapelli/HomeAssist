import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, HardHat, Calendar, MessageSquare, AlertCircle, 
  ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, Layers 
} from 'lucide-react';
import { adminService } from '../../services';
import { StatusBadge } from '../../components/StatusBadge';
import { StatsCardSkeleton } from '../../components/SkeletonLoader';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [pendingWorkers, setPendingWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAdminStats().then((res) => {
      if (res.success) {
        setStats(res.stats);
        setRecentBookings(res.recentBookings || []);
        setPendingWorkers(res.pendingWorkers || []);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
          Executive Platform Control
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">
          HomeAssist Administrator Center
        </h1>
        <p className="text-xs text-slate-500">
          Monitor marketplace operations, verify incoming technician registrations, and manage support tickets
        </p>
      </div>

      {/* KPI Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Customers</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
            <p className="text-[10px] text-slate-400">Registered users</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Active Workers</span>
              <HardHat className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats?.totalWorkers || 0}</p>
            <p className="text-[10px] text-slate-400">Approved specialists</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Pending Review</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">{stats?.pendingWorkers || 0}</p>
            <p className="text-[10px] text-slate-400">Technicians to verify</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Total Bookings</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats?.totalBookings || 0}</p>
            <p className="text-[10px] text-slate-400">Platform dispatches</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-semibold text-slate-500">Open Tickets</span>
              <MessageSquare className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-rose-600">{stats?.pendingComplaints || 0}</p>
            <p className="text-[10px] text-slate-400">Complaints pending</p>
          </div>
        </div>
      )}

      {/* 2 Column Section: Pending Worker Approvals & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Worker Applications */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Pending Worker Approvals ({pendingWorkers.length})</span>
            </h3>
            <Link
              to="/admin/workers?status=Pending"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingWorkers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              All worker applications have been audited and verified.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingWorkers.slice(0, 4).map((w) => (
                <div
                  key={w._id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        w.profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(w.name)}`
                      }
                      alt={w.name}
                      className="w-10 h-10 rounded-xl object-cover border"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{w.name}</h4>
                      <p className="text-[11px] text-slate-500">{w.profession} • {w.city}</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/workers"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Platform Bookings */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Latest Service Bookings</span>
            </h3>
            <Link
              to="/admin/bookings"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Audit All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              No recent bookings registered yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.slice(0, 4).map((b) => (
                <div
                  key={b._id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-blue-600">{b.bookingNumber}</span>
                      <StatusBadge status={b.bookingStatus} />
                    </div>
                    <p className="text-xs font-bold text-slate-900">{b.service}</p>
                    <p className="text-[10px] text-slate-500">{b.date} • {b.location?.area}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {b.paymentStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
