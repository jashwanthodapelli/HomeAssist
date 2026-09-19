import React, { useEffect, useState } from 'react';
import { Calendar, Search, Clock, MapPin, User, HardHat, CheckCircle2 } from 'lucide-react';
import { adminService, bookingService } from '../../services';
import { Booking } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { useNotification } from '../../context/NotificationContext';

export const AdminBookingsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllBookings();
      if (res.success) setBookings(res.bookings);
    } catch {
      showToast('Failed to load bookings audit list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await bookingService.updateBookingStatus(id, {
        status: newStatus,
        paymentStatus: newStatus === 'Completed' ? 'Paid' : undefined,
      });
      if (res.success) {
        showToast(`Booking updated to ${newStatus}`, 'success');
        fetchBookings();
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const filtered = bookings.filter((b) => {
    const matchStatus = statusFilter === 'All' || b.bookingStatus.toLowerCase() === statusFilter.toLowerCase();
    const q = search.toLowerCase();
    const custName = typeof b.customer === 'object' ? b.customer?.name || '' : '';
    const workerName = typeof b.worker === 'object' ? b.worker?.name || '' : '';
    const matchSearch =
      b.bookingNumber.toLowerCase().includes(q) ||
      b.service.toLowerCase().includes(q) ||
      custName.toLowerCase().includes(q) ||
      workerName.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Bookings Audit</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor dispatch events, customer addresses, worker assignments, and fulfillment rates
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'].map((st) => (
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

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by ID, customer, service..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
        />
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No bookings match the filter criteria.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Assigned Worker</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filtered.map((b) => {
                  const cust = typeof b.customer === 'object' ? b.customer : null;
                  const wrk = typeof b.worker === 'object' ? b.worker : null;
                  return (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {b.bookingNumber}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {b.service}
                        <p className="text-[10px] text-slate-400 font-normal">
                          Method: {b.paymentMethod}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{cust?.name || 'Customer'}</p>
                        <p className="text-[11px] text-slate-500">{cust?.phone}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{wrk?.name || 'Assigned Worker'}</p>
                        <p className="text-[11px] text-slate-500">{wrk?.profession}</p>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <p>{b.date}</p>
                        <p className="text-[11px] text-slate-400">{b.time}</p>
                      </td>

                      <td className="py-3.5 px-4 space-y-1">
                        <StatusBadge status={b.bookingStatus} />
                        <div>
                          <StatusBadge status={b.paymentStatus} />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={b.bookingStatus}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 focus:outline-hidden"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
