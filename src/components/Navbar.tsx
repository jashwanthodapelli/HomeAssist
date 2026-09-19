import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Wrench, User, LogOut, Menu, X, Shield, Calendar, 
  Heart, PlusCircle, Search, Home, LayoutDashboard, QrCode, 
  MessageSquare, Briefcase 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, role, logout, promptAuth, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleRestrictedNav = (e: React.MouseEvent, path: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      promptAuth(path, 'Please login or create an account to continue.');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold text-slate-900 tracking-tight">HomeAssist</span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 leading-none">Find. Trust. Book.</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link
                to="/"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                Home
              </Link>
              <Link
                to="/services"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/services') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                Services
              </Link>
              <Link
                to="/search"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/search') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                Find Workers
              </Link>
              <Link
                to="/about"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/about') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                About
              </Link>
              <Link
                to="/faq"
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive('/faq') ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                FAQs
              </Link>
            </nav>

            {/* Right Side: Auth / Roles / Profile */}
            <div className="hidden md:flex items-center gap-3">
              {/* Quick Admin or Worker Shortcut if logged in */}
              {role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Admin Panel
                </Link>
              )}

              {role === 'worker' && (
                <Link
                  to="/worker/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Worker Dashboard
                </Link>
              )}

              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div
                      onMouseLeave={() => setUserDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1 text-xs text-slate-700">
                        {role === 'user' && (
                          <>
                            <Link
                              to="/bookings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-medium"
                            >
                              <Calendar className="w-4 h-4 text-slate-400" /> My Bookings
                            </Link>
                            <Link
                              to="/favorites"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-medium"
                            >
                              <Heart className="w-4 h-4 text-slate-400" /> Saved Workers
                            </Link>
                            <Link
                              to="/complaints"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-medium"
                            >
                              <MessageSquare className="w-4 h-4 text-slate-400" /> Complaints
                            </Link>
                          </>
                        )}

                        {role === 'worker' && (
                          <>
                            <Link
                              to="/worker/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-medium"
                            >
                              <LayoutDashboard className="w-4 h-4 text-slate-400" /> Dashboard
                            </Link>
                            <Link
                              to="/worker/bookings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-medium"
                            >
                              <Calendar className="w-4 h-4 text-slate-400" /> Booking Requests
                            </Link>
                            <Link
                              to="/worker/visiting-card"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-medium"
                            >
                              <QrCode className="w-4 h-4 text-slate-400" /> Digital ID Card
                            </Link>
                          </>
                        )}

                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 font-medium"
                        >
                          <User className="w-4 h-4 text-slate-400" /> My Profile
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isGuest && (
                    <span className="hidden sm:inline-block text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg">
                      Guest Mode
                    </span>
                  )}
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-sm transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Services (15 Categories)
            </Link>
            <Link
              to="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Find Workers & Map
            </Link>
            <Link
              to="/custom-service"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-blue-600 hover:bg-blue-50"
            >
              + Other / Custom Service
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              About HomeAssist
            </Link>
            <Link
              to="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              FAQs
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
            >
              Contact Us
            </Link>

            {isAuthenticated ? (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                {role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-bold bg-slate-900 text-white"
                  >
                    Go to Admin Dashboard
                  </Link>
                )}
                {role === 'worker' && (
                  <Link
                    to="/worker/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white"
                  >
                    Go to Worker Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  My Profile ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 text-center text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 text-center text-sm font-semibold text-white bg-blue-600 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Customer Bottom Navigation Bar */}
      {/* Spec: Customer mobile navigation: Home | Services | Bookings | Favorites | Profile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            isActive('/') ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          Home
        </Link>
        <Link
          to="/services"
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            isActive('/services') ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          Services
        </Link>
        <Link
          to="/bookings"
          onClick={(e) => handleRestrictedNav(e, '/bookings')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            isActive('/bookings') ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          Bookings
        </Link>
        <Link
          to="/favorites"
          onClick={(e) => handleRestrictedNav(e, '/favorites')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            isActive('/favorites') ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Heart className="w-5 h-5 mb-0.5" />
          Favorites
        </Link>
        <Link
          to="/profile"
          onClick={(e) => handleRestrictedNav(e, '/profile')}
          className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            isActive('/profile') ? 'text-blue-600 font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          Profile
        </Link>
      </div>
    </>
  );
};
