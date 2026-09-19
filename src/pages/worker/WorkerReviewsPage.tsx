import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services';
import { Review } from '../../types';

export const WorkerReviewsPage: React.FC = () => {
  const { worker } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!worker?._id) return;
    reviewService.getWorkerReviews(worker._id).then((res) => {
      if (res.success) setReviews(res.reviews);
      setLoading(false);
    });
  }, [worker]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Customer Reviews</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified ratings and feedback from customers after completed appointments
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl flex items-center gap-2">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="text-base font-black text-amber-900">
            {worker?.rating ? worker.rating.toFixed(1) : '5.0'} / 5.0
          </span>
          <span className="text-xs text-amber-700">({worker?.totalReviews || 0} reviews)</span>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No customer reviews yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Once you complete booking appointments, customers will be prompted to leave verified ratings here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const cust = typeof r.customer === 'object' ? r.customer : null;
            return (
              <div
                key={r._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        cust?.profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cust?.name || 'Customer')}`
                      }
                      alt="Customer"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{cust?.name || 'Verified Customer'}</h4>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Completed Service
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl text-amber-800 text-xs font-bold border border-amber-100">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{r.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                <p className="text-[10px] text-slate-400">
                  Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
