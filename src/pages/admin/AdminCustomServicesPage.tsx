import React, { useEffect, useState } from 'react';
import { 
  Sparkles, CheckCircle2, XCircle, Clock, MapPin, 
  Calendar, User, Phone, Layers, AlertCircle, RefreshCw,
  Search, Filter
} from 'lucide-react';
import { adminService } from '../../services';
import { CustomServiceRequest } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { useNotification } from '../../context/NotificationContext';

export const AdminCustomServicesPage: React.FC = () => {
  const { showToast } = useNotification();
  const [requests, setRequests] = useState<CustomServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllCustomServices();
      const list = res?.customServices || res?.requests || [];
      setRequests(Array.isArray(list) ? list : []);
    } catch {
      showToast('Failed to load custom service requests', 'error');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await adminService.updateCustomServiceStatus(id, { status });
      if (res.success) {
        showToast(`Request updated to ${status}`, 'success');
        fetchRequests();
      }
    } catch {
      showToast('Status update failed', 'error');
    }
  };

  const handleConvertToService = async (request: CustomServiceRequest) => {
    try {
      const res = await adminService.updateCustomServiceStatus(request._id, {
        status: 'Converted to Category',
        convertToCategory: true,
        categoryName: request.title,
        basePrice: 499,
      });
      if (res.success) {
        showToast(`Service "${request.title}" added to platform catalog!`, 'success');
        fetchRequests();
      }
    } catch {
      showToast('Failed to convert service', 'error');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = 
      activeFilter === 'All' 
        ? true 
        : activeFilter === 'Pending' 
        ? r.status === 'Pending' || (r.status as string) === 'In Review'
        : r.status === activeFilter;

    const query = searchQuery.toLowerCase();
    const titleMatch = r.title?.toLowerCase().includes(query) || false;
    const descMatch = r.description?.toLowerCase().includes(query) || false;
    const userMatch = (
      typeof r.customer === 'object' && r.customer?.name?.toLowerCase().includes(query)
    ) || (
      typeof r.user === 'object' && r.user?.name?.toLowerCase().includes(query)
    ) || false;

    return matchesFilter && (query === '' || titleMatch || descMatch || userMatch);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Custom / "Other Service" Inquiries
            </h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {requests.length} Requests
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review customer requests submitted outside standard categories and evaluate potential service catalog additions
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['All', 'Pending', 'Approved', 'Converted to Category', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === status
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search custom requests..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">No custom service inquiries found</p>
          <p className="text-slate-400">
            {activeFilter === 'All' 
              ? 'Customers have not submitted any custom service requests yet.' 
              : `No requests with status "${activeFilter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((r) => {
            const customerObj: any = (typeof r.customer === 'object' && r.customer) ? r.customer : (typeof r.user === 'object' ? r.user : null);
            const customerName = customerObj?.name || 'Registered Customer';
            const customerPhone = customerObj?.phone || customerObj?.email || 'Contact on file';
            const locationStr = typeof r.location === 'object' 
              ? [r.location.address, r.location.area, r.location.city].filter(Boolean).join(', ')
              : (r.location || 'Location details in request');

            return (
              <div
                key={r._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">{r.title}</h3>
                    <StatusBadge status={r.status || 'Pending'} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {r._id} • {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Request Description</span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {r.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate">{customerName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{customerPhone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">{r.preferredDate || 'Flexible Date'}</p>
                      <p className="text-[10px] text-slate-500">{r.preferredTime || 'Any Time Slot'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate">{locationStr}</p>
                      <p className="text-[10px] text-slate-500">Bangalore City</p>
                    </div>
                  </div>
                </div>

                {r.image && (
                  <div className="pt-1">
                    <p className="text-[10px] font-semibold text-slate-400 mb-1">Attached Photo / Blueprint:</p>
                    <img src={r.image} alt="Custom Attachment" className="w-24 h-24 rounded-2xl object-cover border border-slate-200 shadow-2xs" />
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleConvertToService(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors border border-blue-200/60"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Convert to Standard Category</span>
                  </button>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 mr-1">Admin Action:</span>
                    {['In Review', 'Approved', 'Rejected'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(r._id, st)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                          r.status === st
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
