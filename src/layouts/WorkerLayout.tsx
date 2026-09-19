import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, QrCode, Star, User, 
  CheckCircle2, LogOut, Wrench, ShieldCheck, Power, Phone
} from 'lucide-react';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { workerService } from '../services';
import { useNotification } from '../context/NotificationContext';

export const WorkerLayout: React.FC = () => {
  const { worker, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/worker/dashboard', icon: LayoutDashboard },
    { label: 'Booking Requests', path: '/worker/bookings', icon: Calendar },
    { label: 'Digital ID Card', path: '/worker/visiting-card', icon: QrCode },
    { label: 'Reviews & Ratings', path: '/worker/reviews', icon: Star },
    { label: 'Worker Profile', path: '/worker/profile', icon: User },
  ];

  const handleToggleAvailability = async () => {
    if (!worker) return;
    try {
      setIsUpdatingAvailability(true);
      const newStatus = worker.availability === 'Available' ? 'Busy' : 'Available';
      const res = await workerService.toggleAvailability(newStatus);
      if (res.success) {
        worker.availability = newStatus;
        showToast(`Status updated to ${newStatus}`, 'success');
      }
    } catch {
      showToast('Could not update status', 'error');
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Dedicated Worker Portal Header (NO customer links) */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">HomeAssist</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md">
                  Worker Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Professional Service Control Desk</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Availability Status Pill */}
            {worker && (
              <button
                type="button"
                onClick={handleToggleAvailability}
                disabled={isUpdatingAvailability}
                title="Click to toggle availability"
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  worker.availability === 'Available'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{worker.availability === 'Available' ? 'Online • Available' : 'Busy / On-Job'}</span>
              </button>
            )}

            {/* Worker Profile Avatar & Name */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <img
                src={worker?.profileImage || user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Worker')}`}
                alt={user?.name}
                className="w-8 h-8 rounded-lg object-cover border border-slate-700"
              />
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-white leading-tight">{worker?.name || user?.name}</p>
                <p className="text-[10px] text-blue-400 font-medium">{worker?.profession || 'Pro Technician'}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-red-950/40 hover:text-red-300 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
              title="Sign out of worker portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Worker Banner Info */}
      <div className="bg-slate-900/95 text-white border-b border-slate-800 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={worker?.profileImage || user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Worker')}`}
              alt={user?.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-white">{worker?.name || user?.name}</h1>
                {worker?.verificationStatus === 'Verified' && (
                  <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-semibold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified Pro
                  </span>
                )}
                {worker?.status && <StatusBadge status={worker.status} />}
              </div>
              <p className="text-xs text-blue-400 font-medium mt-0.5">{worker?.profession || 'Service Professional'} • {worker?.city || 'Indiranagar, Bangalore'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            {worker?.phone && (
              <span className="hidden sm:flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <Phone className="w-3.5 h-3.5 text-blue-400" /> {worker.phone}
              </span>
            )}
            <span className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Certified Partner
            </span>
          </div>
        </div>
      </div>

      {/* Worker Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-2xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
