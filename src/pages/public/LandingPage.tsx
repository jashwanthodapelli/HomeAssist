import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, ShieldCheck, Star, MapPin, Clock, 
  Sparkles, CheckCircle2, ArrowRight, Wrench, 
  Award, Users, HeartHandshake, PlusCircle, HelpCircle, ChevronRight
} from 'lucide-react';
import { Category, Worker } from '../../types';
import { categoryService, workerService } from '../../services';
import { CategoryCard } from '../../components/CategoryCard';
import { WorkerCard } from '../../components/WorkerCard';
import { WorkerSkeletonCard } from '../../components/SkeletonLoader';
import { DigitalVisitingCardModal } from '../../components/DigitalVisitingCardModal';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, continueAsGuest, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredWorkers, setFeaturedWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVisitingWorker, setSelectedVisitingWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, wrkRes] = await Promise.all([
          categoryService.getCategories(),
          workerService.getFeaturedWorkers(),
        ]);
        if (catRes.success) setCategories(catRes.categories);
        if (wrkRes.success) setFeaturedWorkers(wrkRes.workers);
      } catch (err) {
        console.error('Landing page data fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleQuickDemoLogin = async (email: string, pass: string) => {
    try {
      await login({ email, password: pass });
      if (email.includes('admin')) navigate('/admin/dashboard');
      else if (email.includes('worker')) navigate('/worker/dashboard');
      else navigate('/search');
    } catch {
      // handled in context
    }
  };

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:py-20 bg-linear-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-100/80 border border-blue-200 text-blue-800 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>THE TRUSTED LOCAL WORKER NETWORK</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Find. Trust. <span className="text-blue-600">Book.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Find reliable local workers for your home services in just a few simple steps. Background-verified plumbers, electricians, AC technicians & painters near you.
            </p>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
              <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl border border-slate-200/90 flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-2.5 px-3 w-full flex-1">
                  <Search className="w-5 h-5 text-blue-600 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by service (e.g. AC Repair, Tap Leakage, MCB Tripping)..."
                    className="w-full bg-transparent text-sm font-medium text-slate-900 focus:outline-hidden placeholder:text-slate-400 py-1.5"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Search Workers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Primary Entry CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Get Started / Sign Up
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      continueAsGuest();
                      navigate('/services');
                    }}
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-sm font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-2"
                  >
                    <span>Continue as Guest</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/search"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Browse Workers</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/services"
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-sm font-bold rounded-xl transition-colors shadow-2xs"
                  >
                    Explore Categories
                  </Link>
                </>
              )}
            </div>

            {/* Quick Demo Test Pills */}
            <div className="pt-6 border-t border-slate-200/80 mt-6 max-w-xl mx-auto text-xs text-slate-500">
              <span className="font-semibold text-slate-700 block mb-2">Quick Login:</span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handleQuickDemoLogin('admin@homeassist.demo', 'Admin@123')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-amber-300 rounded-lg font-medium transition-colors"
                >
                  ★ Login as Admin
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('worker@homeassist.demo', 'Worker@123')}
                  className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium transition-colors"
                >
                  ⚡ Login as Worker
                </button>
                <button
                  onClick={() => handleQuickDemoLogin('user@homeassist.demo', 'User@123')}
                  className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-medium transition-colors"
                >
                  ✓ Login as Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 15 SERVICE CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Complete Home Solutions</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Explore 15+ Service Categories
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select any specialized category to view rated, verified local technicians.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
            {categories.slice(0, 15).map((cat) => (
              <CategoryCard
                key={cat._id}
                category={cat}
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. POPULAR & FEATURED WORKERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Top Rated Experts</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Featured Local Professionals
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Certified experts with high ratings, verified documents, and verified customer reviews.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>Browse All Workers</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <WorkerSkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredWorkers.map((worker) => (
              <WorkerCard
                key={worker._id}
                worker={worker}
                onVisitingCardClick={(w) => setSelectedVisitingWorker(w)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW IT WORKS (3 Simple Steps) */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Streamlined Process</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">How HomeAssist Works</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              From doorstep diagnosis to completion warranty in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg">
                1
              </div>
              <h3 className="font-bold text-lg text-white">Find & Choose</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Browse verified local plumbers, electricians, or technicians. Check real customer reviews, ratings, and service areas.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg">
                2
              </div>
              <h3 className="font-bold text-lg text-white">Schedule Booking</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Select your preferred date, time slot, and problem description. Choose convenient Cash on Delivery or Mock UPI payment.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg">
                3
              </div>
              <h3 className="font-bold text-lg text-white">Service & Warranty</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Worker arrives promptly at your doorstep. Upon completion, rate the service and enjoy genuine peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY HOMEASSIST & BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Trust & Quality</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Why Customers & Workers Choose HomeAssist
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Unlike generic classifieds where anyone can post a fake number, every HomeAssist professional is vetted by platform administrators with background checks and skills certification.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Admin-Approved Professionals</h4>
                  <p className="text-xs text-slate-500">Every worker must be reviewed and approved by admin before receiving jobs.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Digital Visiting Cards with QR Codes</h4>
                  <p className="text-xs text-slate-500">Each worker gets a verifiable digital ID card with instantaneous QR scan.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Verified Reviews Only</h4>
                  <p className="text-xs text-slate-500">Only customers with completed bookings can review workers, preventing fake ratings.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Platform Performance at a Glance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <p className="text-2xl font-black text-blue-600">15+</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Service Categories</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <p className="text-2xl font-black text-emerald-600">100%</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Vetted Professionals</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <p className="text-2xl font-black text-amber-500">4.9 ★</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Customer Satisfaction</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <p className="text-2xl font-black text-purple-600">&lt; 30m</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Avg. Worker Response</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/register?role=worker"
                className="block w-full py-3 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Are you a technician? Register & Grow Your Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ & TESTIMONIALS ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Have Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {[
            { q: 'How does HomeAssist verify workers?', a: 'Every technician submits their ID, experience details, and certifications. Our admin team manually reviews and approves each worker before they can receive bookings.' },
            { q: 'Can guest users book workers?', a: 'Guests can freely explore services, search workers, and see ratings. To place a booking or save favorites, guests simply create a free account or login.' },
            { q: 'What if my required service is not listed?', a: 'You can submit a custom "Other Service" request! Our admin team evaluates custom requests and assigns an experienced technician.' },
            { q: 'How does payment work?', a: 'You can choose between Cash on Delivery (COD) or instant Mock UPI payment during checkout.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                {item.q}
              </h4>
              <p className="text-xs text-slate-600 mt-2 pl-6 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Digital Visiting Card Modal */}
      <DigitalVisitingCardModal
        worker={selectedVisitingWorker}
        isOpen={!!selectedVisitingWorker}
        onClose={() => setSelectedVisitingWorker(null)}
      />
    </div>
  );
};
