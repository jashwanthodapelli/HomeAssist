import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import { Worker } from '../../types';
import { favoriteService } from '../../services';
import { WorkerCard } from '../../components/WorkerCard';
import { WorkerSkeletonCard } from '../../components/SkeletonLoader';
import { DigitalVisitingCardModal } from '../../components/DigitalVisitingCardModal';

export const FavoritesPage: React.FC = () => {
  const [favoriteWorkers, setFavoriteWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitingWorker, setSelectedVisitingWorker] = useState<Worker | null>(null);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await favoriteService.getFavorites();
      if (res.success) {
        setFavoriteWorkers(res.favorites.map((w: any) => ({ ...w, isFavorite: true })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Workers</h1>
        <p className="text-xs text-slate-500 mt-0.5">Quickly access and book your trusted favorite technicians</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <WorkerSkeletonCard key={i} />
          ))}
        </div>
      ) : favoriteWorkers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No favorite workers saved yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any worker card while searching to save them here for quick future bookings.
          </p>
          <Link
            to="/search"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Find Workers
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteWorkers.map((worker) => (
            <WorkerCard
              key={worker._id}
              worker={worker}
              onVisitingCardClick={(w) => setSelectedVisitingWorker(w)}
              onFavoriteChanged={fetchFavorites}
            />
          ))}
        </div>
      )}

      {/* Digital Visiting Card Modal */}
      <DigitalVisitingCardModal
        worker={selectedVisitingWorker}
        isOpen={!!selectedVisitingWorker}
        onClose={() => setSelectedVisitingWorker(null)}
      />
    </div>
  );
};
