import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldCheck, Star, MapPin, Briefcase, Phone, Check, Copy, Sparkles } from 'lucide-react';
import { Worker } from '../types';

interface DigitalVisitingCardModalProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalVisitingCardModal: React.FC<DigitalVisitingCardModalProps> = ({
  worker,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !worker) return null;

  const cardUrl = `${window.location.origin}/worker/${worker._id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              H
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">HOMEASSIST</h3>
              <p className="text-[10px] text-blue-400 font-medium tracking-wider">DIGITAL VERIFIED ID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 bg-linear-to-b from-slate-50 to-white">
          {/* Card Top Info */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={worker.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.name)}`}
                alt={worker.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-extrabold text-lg text-slate-900 truncate">{worker.name}</h4>
              </div>
              <p className="text-sm font-semibold text-blue-600 truncate">{worker.profession}</p>
              
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-amber-700 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {worker.rating > 0 ? worker.rating.toFixed(1) : '5.0'}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {worker.experience} yrs exp
                </span>
              </div>
            </div>
          </div>

          {/* Location & Service Area */}
          <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-medium text-slate-700">Service Coverage:</span>
              <span className="text-slate-900 font-semibold truncate">{worker.serviceArea || worker.city}</span>
            </div>
            {worker.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-700">Verified Contact:</span>
                <span className="text-slate-900 font-semibold">{worker.phone}</span>
              </div>
            )}
          </div>

          {/* Services list */}
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Specializations</p>
            <div className="flex flex-wrap gap-1.5">
              {worker.services?.map((s, idx) => (
                <span key={idx} className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-lg border border-blue-100">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-6 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="p-2 bg-white rounded-xl shadow-xs">
              <QRCodeSVG
                value={cardUrl}
                size={130}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Scan QR to view & book on HomeAssist
            </p>
          </div>

          {/* Share / Copy Buttons */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Profile Link</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
