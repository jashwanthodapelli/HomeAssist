import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, MapPin, Briefcase, CheckCircle2, Heart, QrCode } from 'lucide-react';
import { Worker } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { favoriteService } from '../services';
import { StatusBadge } from './StatusBadge';

interface WorkerCardProps {
  worker: Worker;
  onVisitingCardClick?: (worker: Worker) => void;
  onFavoriteChanged?: () => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onVisitingCardClick,
  onFavoriteChanged,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, promptAuth } = useAuth();
  const { showToast } = useNotification();
  const [isFav, setIsFav] = useState<boolean>(worker.isFavorite || false);
  const [isTogglingFav, setIsTogglingFav] = useState<boolean>(false);

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      promptAuth(`/book/${worker._id}`, 'Please login or create an account to continue.');
      return;
    }
    navigate(`/book/${worker._id}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      promptAuth(undefined, 'Please login or create an account to continue.');
      return;
    }

    try {
      setIsTogglingFav(true);
      const res = await favoriteService.toggleFavorite(worker._id);
      setIsFav(res.isFavorite);
      showToast(res.message, 'success');
      if (onFavoriteChanged) onFavoriteChanged();
    } catch (err) {
      showToast('Failed to update favorites', 'error');
    } finally {
      setIsTogglingFav(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={worker.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.name)}`}
              alt={worker.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
            />
            {worker.verificationStatus === 'Verified' && (
              <span
                title="Verified Professional"
                className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-xs border-2 border-white"
              >
                <ShieldCheck className="w-3 h-3" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {worker.name}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                {onVisitingCardClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVisitingCardClick(worker);
                    }}
                    title="View Digital Visiting Card"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleToggleFavorite}
                  disabled={isTogglingFav}
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  className="p-1.5 rounded-lg transition-colors hover:bg-rose-50"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'
                    }`}
                  />
                </button>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-600 truncate mt-0.5">{worker.profession}</p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-700 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{worker.rating > 0 ? worker.rating.toFixed(1) : 'New'}</span>
                {worker.totalReviews > 0 && (
                  <span className="text-amber-500 font-normal">({worker.totalReviews})</span>
                )}
              </div>
              <StatusBadge status={worker.availability} />
            </div>
          </div>
        </div>

        {/* Worker Details / Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 py-3 border-y border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800">{worker.experience} yrs</span> exp
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800">{worker.completedJobs}</span> jobs done
          </div>
          <div className="flex items-center gap-1.5 col-span-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{worker.serviceArea || worker.city}</span>
          </div>
        </div>

        {/* Services / Skills pills */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {worker.services?.slice(0, 3).map((srv, i) => (
            <span
              key={i}
              className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md truncate max-w-[140px]"
            >
              {srv}
            </span>
          ))}
          {(worker.services?.length || 0) > 3 && (
            <span className="text-xs text-slate-400 font-medium px-1 py-0.5">
              +{worker.services.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 flex items-center gap-2">
        <button
          onClick={() => navigate(`/worker/${worker._id}`)}
          className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
        >
          View Profile
        </button>
        <button
          onClick={handleBookNow}
          className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-sm transition-all text-center"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};
