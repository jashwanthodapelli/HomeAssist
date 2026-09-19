import React, { useEffect, useState } from 'react';
import { 
  HardHat, ShieldCheck, CheckCircle2, XCircle, Search, 
  ExternalLink, QrCode, Phone, Mail, Clock, RefreshCw,
  AlertCircle, Briefcase, Award, MapPin
} from 'lucide-react';
import { adminService } from '../../services';
import { Worker } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { useNotification } from '../../context/NotificationContext';
import { DigitalVisitingCardModal } from '../../components/DigitalVisitingCardModal';

export const AdminWorkerApprovalsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [selectedVisitingWorker, setSelectedVisitingWorker] = useState<Worker | null>(null);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllWorkers({ status: activeTab });
      if (res.success) {
        setWorkers(res.workers || []);
      }
    } catch {
      showToast('Failed to fetch worker applications', 'error');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [activeTab]);

  const handleApprove = async (id: string, name: string) => {
    try {
      const res = await adminService.updateWorkerStatus(id, {
        status: 'Approved',
        verificationStatus: 'Verified',
      });
      if (res.success) {
        showToast(`Worker "${name}" approved & verified!`, 'success');
        fetchWorkers();
      }
    } catch {
      showToast('Failed to approve worker', 'error');
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      const res = await adminService.updateWorkerStatus(id, {
        status: 'Rejected',
        verificationStatus: 'Unverified',
      });
      if (res.success) {
        showToast(`Worker application for "${name}" rejected.`, 'info');
        fetchWorkers();
      }
    } catch {
      showToast('Failed to reject worker', 'error');
    }
  };

  const filteredWorkers = workers.filter((w) => {
    const q = search.toLowerCase();
    return (
      w.name.toLowerCase().includes(q) ||
      w.profession.toLowerCase().includes(q) ||
      (w.city && w.city.toLowerCase().includes(q)) ||
      w.services.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Worker Approvals Queue
            </h1>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              activeTab === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {filteredWorkers.length} {activeTab}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review submitted technician credentials, verify licenses & work history, and grant platform access
          </p>
        </div>

        <button
          onClick={fetchWorkers}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1">
          {(['Pending', 'Approved', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab === 'Pending' ? 'Pending Review' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search technician by name or skill..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredWorkers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
          <HardHat className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">
            No {activeTab.toLowerCase()} worker applications found
          </p>
          <p className="text-slate-400">
            {activeTab === 'Pending'
              ? 'Great work! The technician review backlog is completely clear.'
              : `No worker accounts with status "${activeTab}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkers.map((worker) => (
            <div
              key={worker._id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={worker.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.name)}`}
                      alt={worker.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">{worker.name}</h3>
                        <StatusBadge status={worker.status} />
                      </div>
                      <p className="text-xs font-semibold text-blue-600">{worker.profession}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {worker.city || 'Bangalore'} • {worker.serviceArea || 'Metro Area'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedVisitingWorker(worker)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-blue-600 transition-colors shrink-0"
                    title="View Digital Visiting Card"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Experience</span>
                    <span className="font-bold text-slate-800">{worker.experience} yrs</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Base Rate</span>
                    <span className="font-bold text-slate-800">₹{worker.hourlyRate || 399}/hr</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Completed</span>
                    <span className="font-bold text-slate-800">{worker.completedJobs || 0} jobs</span>
                  </div>
                </div>

                {worker.about && (
                  <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    "{worker.about}"
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {worker.services?.map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-lg border border-blue-100"
                    >
                      {srv}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 truncate font-mono text-[11px]">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    {worker.phone || 'Phone on file'}
                  </span>
                  <span className="flex items-center gap-1 truncate font-mono text-[11px]">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    {worker.email || 'Email on file'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                {worker.status !== 'Approved' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(worker._id, worker.name)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                )}

                {worker.status !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => handleReject(worker._id, worker.name)}
                    className="py-2 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                )}

                {worker.status === 'Approved' && (
                  <div className="w-full flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200/60">
                    <span className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Active Verified Worker
                    </span>
                    <button
                      onClick={() => handleReject(worker._id, worker.name)}
                      className="text-xs text-slate-500 hover:text-rose-600 font-semibold underline"
                    >
                      Suspend Access
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVisitingWorker && (
        <DigitalVisitingCardModal
          worker={selectedVisitingWorker}
          isOpen={!!selectedVisitingWorker}
          onClose={() => setSelectedVisitingWorker(null)}
        />
      )}
    </div>
  );
};
