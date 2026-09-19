import React from 'react';

export const WorkerSkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded-md w-3/4" />
          <div className="h-3 bg-slate-200 rounded-md w-1/2" />
          <div className="h-3 bg-slate-100 rounded-md w-1/3" />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
        <div className="h-6 bg-slate-100 rounded-full w-20" />
        <div className="h-6 bg-slate-100 rounded-full w-24" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-9 bg-slate-200 rounded-xl flex-1" />
        <div className="h-9 bg-slate-200 rounded-xl flex-1" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 animate-pulse space-y-3">
      <div className="h-8 bg-slate-200 rounded-md w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-100 rounded-md w-full" />
      ))}
    </div>
  );
};

export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-7 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-3/4" />
    </div>
  );
};
