import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, Map, List, Star, ShieldCheck, 
  MapPin, X, SlidersHorizontal, RefreshCw 
} from 'lucide-react';
import { Worker, Category } from '../../types';
import { workerService, categoryService } from '../../services';
import { WorkerCard } from '../../components/WorkerCard';
import { WorkerSkeletonCard } from '../../components/SkeletonLoader';
import { LeafletMap } from '../../components/LeafletMap';
import { DigitalVisitingCardModal } from '../../components/DigitalVisitingCardModal';

export const SearchWorkersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [minRating, setMinRating] = useState<number>(Number(searchParams.get('minRating')) || 0);
  const [minExp, setMinExp] = useState<number>(Number(searchParams.get('minExp')) || 0);
  const [availability, setAvailability] = useState<string>(searchParams.get('availability') || '');
  const [city, setCity] = useState<string>(searchParams.get('city') || '');
  const [sortBy, setSortBy] = useState<string>('rating');

  // View Mode: 'list' or 'map'
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedVisitingWorker, setSelectedVisitingWorker] = useState<Worker | null>(null);
  const [selectedMapWorker, setSelectedMapWorker] = useState<Worker | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.success) setCategories(res.categories);
    });
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (minRating > 0) params.minRating = minRating;
      if (minExp > 0) params.experience = minExp;
      if (availability) params.availability = availability;
      if (city) params.city = city;

      const res = await workerService.getWorkers(params);
      if (res.success) {
        let sorted = [...res.workers];
        if (sortBy === 'rating') {
          sorted.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'experience') {
          sorted.sort((a, b) => b.experience - a.experience);
        } else if (sortBy === 'jobs') {
          sorted.sort((a, b) => b.completedJobs - a.completedJobs);
        }
        setWorkers(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch workers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [search, selectedCategory, minRating, minExp, availability, city, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setMinRating(0);
    setMinExp(0);
    setAvailability('');
    setCity('');
    setSortBy('rating');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Find Trusted Local Workers
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing verified professionals with genuine ratings and live availability
            </p>
          </div>

          {/* View Toggle: Grid vs Map */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Input and Quick Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by worker name, specialty, or service keyword..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="rating">Sort: Highest Rated</option>
              <option value="experience">Sort: Most Experience</option>
              <option value="jobs">Sort: Most Jobs Completed</option>
            </select>

            {(selectedCategory || minRating > 0 || minExp > 0 || availability || search || city) && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                title="Reset all filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout (Sidebar Filters + Results / Map) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`md:block ${
            mobileFiltersOpen ? 'block' : 'hidden'
          } bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-6 h-fit md:sticky md:top-20`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Filter className="w-4 h-4 text-blue-600" />
              <span>Filters</span>
            </div>
            <button
              onClick={resetFilters}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
            >
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Service Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="">All 15 Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rating</label>
            <div className="space-y-1.5">
              {[
                { label: 'Any Rating', val: 0 },
                { label: '4.5 ★ & above', val: 4.5 },
                { label: '4.0 ★ & above', val: 4.0 },
                { label: '3.5 ★ & above', val: 3.5 },
              ].map((opt) => (
                <label key={opt.val} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === opt.val}
                    onChange={() => setMinRating(opt.val)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Experience */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Experience</label>
            <select
              value={minExp}
              onChange={(e) => setMinExp(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value={0}>Any Experience</option>
              <option value={1}>1+ Years</option>
              <option value={3}>3+ Years</option>
              <option value={5}>5+ Years</option>
              <option value={8}>8+ Years</option>
            </select>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Availability</label>
            <div className="flex gap-2">
              {['', 'Available', 'Busy'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setAvailability(st)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    availability === st
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Base City */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bangalore"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
            />
          </div>
        </aside>

        {/* Results Area */}
        <main className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Found <strong className="text-slate-900">{workers.length}</strong> verified workers
            </span>
            {selectedCategory && (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold">
                Category: {selectedCategory}
              </span>
            )}
          </div>

          {/* MAP VIEW */}
          {viewMode === 'map' && (
            <div className="space-y-4">
              <LeafletMap
                workers={workers}
                selectedWorker={selectedMapWorker}
                onWorkerSelect={(w) => setSelectedMapWorker(w)}
                height="450px"
              />
              {selectedMapWorker && (
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedMapWorker.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedMapWorker.name)}`}
                      alt={selectedMapWorker.name}
                      className="w-12 h-12 rounded-xl object-cover border border-blue-200"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{selectedMapWorker.name}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{selectedMapWorker.profession}</p>
                      <p className="text-[11px] text-slate-500">📍 {selectedMapWorker.serviceArea || selectedMapWorker.city}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedVisitingWorker(selectedMapWorker)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    View Card
                  </button>
                </div>
              )}
            </div>
          )}

          {/* LIST / CARDS VIEW */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <WorkerSkeletonCard key={i} />
              ))}
            </div>
          ) : workers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching workers found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search criteria, clearing rating filters, or submit a custom "Other Service" request.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workers.map((worker) => (
                <WorkerCard
                  key={worker._id}
                  worker={worker}
                  onVisitingCardClick={(w) => setSelectedVisitingWorker(w)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Digital Visiting Card Modal */}
      <DigitalVisitingCardModal
        worker={selectedVisitingWorker}
        isOpen={!!selectedVisitingWorker}
        onClose={() => setSelectedVisitingWorker(null)}
      />
    </div>
  );
};
