import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, ShieldCheck, MapPin, Briefcase, CheckCircle2, 
  Calendar, QrCode, Heart, ArrowLeft, Clock, Phone, Mail, Sparkles 
} from 'lucide-react';
import { Worker, Review } from '../../types';
import { workerService, favoriteService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { StatusBadge } from '../../components/StatusBadge';
import { DigitalVisitingCardModal } from '../../components/DigitalVisitingCardModal';
import { LeafletMap } from '../../components/LeafletMap';

export const WorkerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, promptAuth } = useAuth();
  const { showToast } = useNotification();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [visitingCardOpen, setVisitingCardOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await workerService.getWorkerById(id);
        if (res.success) {
          setWorker(res.worker);
          setReviews(res.reviews || []);
          setIsFav(res.worker.isFavorite || false);
        }
      } catch (err) {
        showToast('Failed to load worker profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleBookClick = () => {
    if (!isAuthenticated) {
      promptAuth(`/book/${id}`, 'Please login or create an account to continue.');
      return;
    }
    navigate(`/book/${id}`);
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      promptAuth(undefined, 'Please login or create an account to continue.');
      return;
    }
    if (!worker) return;
    try {
      const res = await favoriteService.toggleFavorite(worker._id);
      setIsFav(res.isFavorite);
      showToast(res.message, 'success');
    } catch {
      showToast('Failed to update favorites', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Worker not found</h2>
        <p className="text-xs text-slate-500">The profile you are looking for does not exist or has been removed.</p>
        <Link to="/search" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back navigation */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={worker.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.name)}`}
                alt={worker.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-100 shadow-md"
              />
              {worker.verificationStatus === 'Verified' && (
                <span
                  title="Verified Professional"
                  className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full shadow-xs border-2 border-white"
                >
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{worker.name}</h1>
                <StatusBadge status={worker.availability} />
              </div>
              <p className="text-sm font-semibold text-blue-600">{worker.profession}</p>

              <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-1">
                <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-700 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {worker.rating > 0 ? worker.rating.toFixed(1) : '5.0'} ({worker.totalReviews} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <strong>{worker.experience} yrs</strong> exp
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <strong>{worker.completedJobs}</strong> jobs done
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-row md:flex-col items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleBookClick}
              className="flex-1 md:w-48 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all text-center flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Service</span>
            </button>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setVisitingCardOpen(true)}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Visiting Card</span>
              </button>
              <button
                onClick={handleToggleFavorite}
                title={isFav ? 'Saved to favorites' : 'Save to favorites'}
                className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition-colors shrink-0"
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Location strip */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>Service Coverage: <strong>{worker.serviceArea || worker.city}</strong></span>
          </div>
          {worker.hourlyRate && (
            <div className="font-semibold text-slate-900">
              Standard Visit Rate: ₹{worker.hourlyRate}
            </div>
          )}
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 cols: About & Skills */}
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">About the Professional</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {worker.about || `${worker.name} is an experienced ${worker.profession} with over ${worker.experience} years of expertise serving households and commercial spaces. Certified, equipped with modern tools, and verified by HomeAssist.`}
            </p>
          </div>

          {/* Services & Skills */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Services & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {worker.services?.map((srv, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  {srv}
                </span>
              ))}
            </div>

            {worker.skills && worker.skills.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Technical Skills & Equipment</h4>
                <div className="flex flex-wrap gap-1.5">
                  {worker.skills.map((skill, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Verified Customer Reviews */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Verified Customer Reviews ({reviews.length})
              </h3>
              <span className="text-xs text-slate-500">Only verified bookings can review</span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No reviews yet for this professional.</p>
            ) : (
              <div className="space-y-4 pt-2">
                {reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {typeof rev.customer === 'object' ? rev.customer.name : 'Verified Customer'}
                        </span>
                        <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {rev.rating}.0
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col: Service Map & Safety Badges */}
        <div className="space-y-6">
          {/* Location / Area Map */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" /> Service Location
            </h3>
            <LeafletMap
              workers={[worker]}
              center={worker.location?.lat ? [worker.location.lat, worker.location.lng] : undefined}
              height="200px"
              zoom={13}
            />
            <p className="text-[11px] text-slate-500 leading-tight">
              Operating around <strong>{worker.serviceArea || worker.city}</strong>. Arrives with professional toolkits.
            </p>
          </div>

          {/* HomeAssist Protection Badge */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm">HomeAssist Guarantee</h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center gap-2">✓ Verified background & national ID</li>
              <li className="flex items-center gap-2">✓ Cash on delivery or secure Mock UPI</li>
              <li className="flex items-center gap-2">✓ Direct support & complaint desk</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Digital Visiting Card Modal */}
      <DigitalVisitingCardModal
        worker={worker}
        isOpen={visitingCardOpen}
        onClose={() => setVisitingCardOpen(false)}
      />
    </div>
  );
};
