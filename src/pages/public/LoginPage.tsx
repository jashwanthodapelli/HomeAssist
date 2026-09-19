import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Mail, Lock, LogIn, Shield, HardHat, UserCheck, ArrowRight, UserX, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, continueAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const stateMessage = (location.state as any)?.message;
  const returnUrl = (location.state as any)?.from?.pathname || (location.state as any)?.returnUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await login({ email, password });
      
      // Strict role-based navigation:
      // 1. Admin always goes directly to the Admin Dashboard
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.user.role === 'worker') {
        navigate('/worker/dashboard', { replace: true });
      } else {
        // Normal registered customer
        if (returnUrl && !returnUrl.startsWith('/admin')) {
          navigate(returnUrl, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch {
      // Error notification handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate('/services');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">HomeAssist</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-xs text-slate-500">Sign in to manage your bookings or service dashboard</p>
        </div>

        {/* Guest Restriction Notice Banner if redirected */}
        {stateMessage && (
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{stateMessage}</span>
          </div>
        )}

        {/* Hackathon Demo Credentials Box */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                Hackathon Demo Credentials
              </span>
            </div>
            <p className="text-xs text-slate-300">Quick sign-in credentials for testing all 4 roles:</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@homeassist.demo', 'Admin@123')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </div>
              <p className="text-[10px] text-slate-300 truncate font-mono">admin@homeassist.demo</p>
              <p className="text-[10px] text-slate-400 font-mono">Admin@123</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('worker@homeassist.demo', 'Worker@123')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                <HardHat className="w-3.5 h-3.5" />
                <span>Worker</span>
              </div>
              <p className="text-[10px] text-slate-300 truncate font-mono">worker@homeassist.demo</p>
              <p className="text-[10px] text-slate-400 font-mono">Worker@123</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('user@homeassist.demo', 'User@123')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Customer</span>
              </div>
              <p className="text-[10px] text-slate-300 truncate font-mono">user@homeassist.demo</p>
              <p className="text-[10px] text-slate-400 font-mono">User@123</p>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center">Click any card to auto-fill email & password</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              or
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Continue as Guest Button */}
          <button
            type="button"
            onClick={handleGuestAccess}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <UserX className="w-4 h-4 text-slate-500" />
            <span>Continue as Guest (Explore Only)</span>
          </button>

          <div className="pt-2 text-center text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
