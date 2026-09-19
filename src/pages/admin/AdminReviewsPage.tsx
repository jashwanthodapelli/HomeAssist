import React, { useEffect, useState } from 'react';
import { 
  Star, Trash2, Search, Filter, RefreshCw, MessageSquare, 
  User, HardHat, ShieldCheck, AlertTriangle 
} from 'lucide-react';
import { adminService } from '../../services';
import { Review } from '../../types';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { useNotification } from '../../context/NotificationContext';

export const AdminReviewsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState<string>('All');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllReviews();
      if (res.success) {
        setReviews(res.reviews || []);
      }
    } catch {
      showToast('Failed to load reviews list', 'error');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this review from the public record?')) {
      return;
    }
    try {
      const res = await adminService.deleteReview(id);
      if (res.success) {
        showToast('Review removed by moderator', 'info');
        fetchReviews();
      }
    } catch {
      showToast('Failed to delete review', 'error');
    }
  };

  const filteredReviews = reviews.filter((rev) => {
    const matchesStar = 
      starFilter === 'All' 
        ? true 
        : starFilter === 'Low'
        ? rev.rating <= 2
        : rev.rating === Number(starFilter);

    const q = search.toLowerCase();
    const commentMatch = rev.comment?.toLowerCase().includes(q) || false;
    const customerObj: any = typeof rev.customer === 'object' ? rev.customer : null;
    const workerObj: any = typeof rev.worker === 'object' ? rev.worker : null;
    const customerMatch = customerObj?.name?.toLowerCase().includes(q) || false;
    const workerMatch = workerObj?.name?.toLowerCase().includes(q) || false;

    return matchesStar && (q === '' || commentMatch || customerMatch || workerMatch);
  });

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const fiveStarPct = reviews.length > 0
    ? Math.round((reviews.filter((r) => r.rating === 5).length / reviews.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Reviews & Ratings Moderation
            </h1>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {reviews.length} Verified Reviews
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor customer feedback, oversee service quality benchmarks, and moderate inappropriate or abusive content
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Average Platform Rating</p>
            <p className="text-xl font-extrabold text-slate-900">{avgRating} / 5.0</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">5-Star Satisfaction Rate</p>
            <p className="text-xl font-extrabold text-slate-900">{fiveStarPct}%</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Customer Reviews</p>
            <p className="text-xl font-extrabold text-slate-900">{reviews.length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', '5', '4', '3', 'Low'].map((st) => (
            <button
              key={st}
              onClick={() => setStarFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                starFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'All' ? 'All Ratings' : st === 'Low' ? '1-2 Stars ⚠️' : `${st} Stars ★`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by worker, customer, text..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">No reviews matching criteria</p>
          <p className="text-slate-400">All customer ratings are recorded directly upon job completion.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((rev) => {
            const customerObj: any = typeof rev.customer === 'object' ? rev.customer : null;
            const workerObj: any = typeof rev.worker === 'object' ? rev.worker : null;

            return (
              <div
                key={rev._id || (rev as any).id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-extrabold text-amber-900 ml-1.5">{rev.rating}.0</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">
                        {customerObj?.name || 'Verified Customer'}
                      </span>
                      <span>reviewed</span>
                      <span className="font-bold text-blue-700 flex items-center gap-1">
                        <HardHat className="w-3.5 h-3.5" />
                        {workerObj?.name || 'Assigned Worker'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                    <button
                      onClick={() => handleDeleteReview(rev._id || (rev as any).id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Moderate / Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold">Moderate</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  "{rev.comment}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Booking ID: <strong className="font-mono text-slate-600">{typeof rev.booking === 'string' ? rev.booking : (rev.booking as any)?._id || 'Verified'}</strong></span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Customer Completion
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
