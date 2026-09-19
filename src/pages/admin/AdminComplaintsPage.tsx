import React, { useEffect, useState } from 'react';
import { MessageSquare, CheckCircle2, Clock, X, AlertCircle } from 'lucide-react';
import { adminService } from '../../services';
import { Complaint } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { useNotification } from '../../context/NotificationContext';

export const AdminComplaintsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Response Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [status, setStatus] = useState<string>('Resolved');
  const [adminResponse, setAdminResponse] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllComplaints();
      if (res.success) setComplaints(res.complaints);
    } catch {
      showToast('Failed to load platform complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openResolutionModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setStatus(c.status === 'Open' ? 'Resolved' : c.status);
    setAdminResponse(c.adminResponse || '');
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      setUpdating(true);
      const res = await adminService.updateComplaintStatus(selectedComplaint._id, {
        status,
        adminResponse,
      });
      if (res.success) {
        showToast('Complaint ticket updated and customer notified.', 'success');
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch {
      showToast('Failed to update complaint status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = complaints.filter((c) => {
    if (statusFilter === 'All') return true;
    return c.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Support Desk & Complaints</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve consumer grievances, review technician disputes, and post official resolutions
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Open', 'Under Review', 'Resolved', 'Rejected'].map((st) => (
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

      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No complaints found under "{statusFilter}".
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => {
            const userObj = typeof c.user === 'object' ? c.user : null;
            return (
              <div
                key={c._id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Received: {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {c.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <div>
                    Submitted by: <strong className="text-slate-900">{userObj?.name || 'Customer'}</strong> ({userObj?.email})
                  </div>

                  <button
                    onClick={() => openResolutionModal(c)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors self-end sm:self-auto"
                  >
                    {c.adminResponse ? 'Update Resolution' : 'Respond & Resolve'}
                  </button>
                </div>

                {c.adminResponse && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Administrator Official Resolution
                    </span>
                    <p className="text-xs text-emerald-800">{c.adminResponse}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Resolve Complaint Ticket</h3>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Administrator Response
                </label>
                <textarea
                  required
                  rows={4}
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Explain resolution, compensation granted, or technician disciplinary action..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {updating ? 'Saving...' : 'Save Resolution'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
