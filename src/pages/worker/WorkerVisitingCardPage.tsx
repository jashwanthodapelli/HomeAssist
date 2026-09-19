import React from 'react';
import { 
  QrCode, Copy, Share2, ShieldCheck, Star, 
  MapPin, Phone, Mail, Printer, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const WorkerVisitingCardPage: React.FC = () => {
  const { worker, user } = useAuth();
  const { showToast } = useNotification();

  const profileUrl = `${window.location.origin}/worker/${worker?._id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    profileUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    showToast('Direct booking link copied to clipboard!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Digital Visiting Card</h1>
        <p className="text-xs text-slate-500">
          Share your verified QR code with customers for direct bookings and contact sharing
        </p>
      </div>

      {/* The Printable Visiting Card Layout */}
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-700/50 print:border print:shadow-none">
        {/* Subtle decorative mesh background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <img
              src={
                worker?.profileImage ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker?.name || 'Worker')}`
              }
              alt={worker?.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                <h2 className="text-xl font-black tracking-tight">{worker?.name}</h2>
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-xs font-semibold text-blue-300">{worker?.profession}</p>

              <div className="flex items-center gap-3 text-xs text-slate-300 pt-1 justify-center sm:justify-start">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {worker?.rating ? worker.rating.toFixed(1) : '5.0'} ({worker?.totalReviews || 0})
                </span>
                <span>•</span>
                <span>{worker?.experience || 3} Yrs Exp.</span>
                <span>•</span>
                <span>{worker?.completedJobs || 0} Jobs</span>
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-2.5 rounded-2xl shadow-md shrink-0 text-center">
            <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28 mx-auto" />
            <span className="text-[10px] font-bold text-slate-700 block mt-1 tracking-wider uppercase">
              Scan to Book
            </span>
          </div>
        </div>

        {/* Services Badges */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Services Offered</p>
          <div className="flex flex-wrap gap-1.5">
            {worker?.services?.map((s, idx) => (
              <span
                key={idx}
                className="bg-white/10 backdrop-blur-xs text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-white/5"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-blue-400" />
            <span>{worker?.phone || user?.phone || 'Direct line available'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>Coverage: {worker?.serviceArea || worker?.city}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
          <span>HomeAssist Platform Verified Professional</span>
          <span className="font-mono">{worker?.phone}</span>
        </div>
      </div>

      {/* Sharing & Printing Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleCopyLink}
          className="w-full sm:flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Copy className="w-4 h-4" />
          <span>Copy Booking URL</span>
        </button>

        <button
          onClick={handlePrint}
          className="w-full sm:flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Card</span>
        </button>
      </div>
    </div>
  );
};
