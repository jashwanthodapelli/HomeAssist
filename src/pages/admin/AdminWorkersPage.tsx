import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  HardHat, ShieldCheck, CheckCircle2, XCircle, Trash2, 
  Search, ExternalLink, QrCode, Star 
} from 'lucide-react';
import { adminService } from '../../services';
import { Worker } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { useNotification } from '../../context/NotificationContext';
import { DigitalVisitingCardModal } from '../../components/DigitalVisitingCardModal';

export const AdminWorkersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useNotification();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'All');
  const [search, setSearch] = useState('');
  const [selectedVisitingWorker, setSelectedVisitingWorker] = useState<Worker | null>(null);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;
      const res = await adminService.getAllWorkers(params);
      if (res.success) setWorkers(res.workers);
    } catch {
      showToast('Failed to fetch workers list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [statusFilter, search]);

  const handleStatusChange = async (id: string, status: 'Approved' | 'Rejected', verificationStatus?: 'Verified' | 'Unverified') => {
    try {
      const res = await adminService.updateWorkerStatus(id, {
        status,
        verificationStatus: verificationStatus || (status === 'Approved' ? 'Verified' : 'Unverified'),
      });
      if (res.success) {
        showToast(`Worker application ${status.toLowerCase()}!`, 'success');
        fetchWorkers();
      }
    } catch {
      showToast('Failed to update worker status', 'error');
    }
  };

  const handleToggleVerification = async (worker: Worker) => {
    const nextStatus = worker.verificationStatus === 'Verified' ? 'Unverified' : 'Verified';
    try {
      const res = await adminService.updateWorkerStatus(worker._id, {
        verificationStatus: nextStatus,
      });
      if (res.success) {
        showToast(`Verification status set to ${nextStatus}`, 'success');
        fetchWorkers();
      }
    } catch {
      showToast('Update failed', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}?`)) return;
    try {
      const res = await adminService.deleteWorker(id);
      if (res.success) {
        showToast('Worker profile deleted', 'info');
        fetchWorkers();
      }
    } catch {
      showToast('Could not delete worker', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Worker Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit technician documents, approve registrations, and manage verified badges
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name, profession, city..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
        />
      </div>

      {/* Workers Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : workers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No technicians found under "{statusFilter}".
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Profession & Area</th>
                  <th className="py-3 px-4">Rating / Jobs</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {workers.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            w.profileImage ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(w.name)}`
                          }
                          alt={w.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{w.name}</p>
                          <p className="text-[11px] text-slate-400">{w.phone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{w.profession}</p>
                      <p className="text-[11px] text-slate-500">{w.serviceArea || w.city}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{w.rating ? w.rating.toFixed(1) : '5.0'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{w.completedJobs} completed</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={w.status} />
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleVerification(w)}
                        title="Click to toggle verification badge"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          w.verificationStatus === 'Verified'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{w.verificationStatus}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {w.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(w._id, 'Approved', 'Verified')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-2xs"
                              title="Approve worker application"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(w._id, 'Rejected', 'Unverified')}
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-semibold border border-rose-200 transition-colors"
                              title="Reject application"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => setSelectedVisitingWorker(w)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Digital Visiting Card"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(w._id, w.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Worker Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
