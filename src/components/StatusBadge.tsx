import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'worker' | 'booking' | 'payment' | 'complaint' | 'verification';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'Approved':
      case 'Completed':
      case 'Paid':
      case 'Resolved':
      case 'Active':
      case 'Verified':
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'Pending':
      case 'Under Review':
      case 'Busy':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'Accepted':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'Rejected':
      case 'Cancelled':
      case 'Suspended':
      case 'Disabled':
      case 'Offline':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      case 'COD':
        return 'bg-purple-50 text-purple-700 border-purple-200';

      case 'Open':
        return 'bg-orange-50 text-orange-700 border-orange-200';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {status}
    </span>
  );
};
