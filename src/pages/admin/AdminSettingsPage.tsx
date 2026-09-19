import React, { useState } from 'react';
import { 
  Settings, ShieldCheck, Bell, DollarSign, Phone, Mail, 
  Save, RefreshCw, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [platformCommission, setPlatformCommission] = useState(10);
  const [minHourlyRate, setMinHourlyRate] = useState(299);
  const [supportPhone, setSupportPhone] = useState('+91 (800) 456-7890');
  const [supportEmail, setSupportEmail] = useState('support@homeassist.demo');
  const [autoVerifyWorkers, setAutoVerifyWorkers] = useState(false);
  const [requireIdCardOnArrival, setRequireIdCardOnArrival] = useState(true);
  const [otpVerificationEnabled, setOtpVerificationEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Platform settings saved successfully!', 'success');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Platform Governance & System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure marketplace commission rates, emergency support dispatch numbers, and trust & verification policies
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Fee and Marketplace Economics */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Marketplace Economics & Rates</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Platform Service Commission (%)
              </label>
              <input
                type="number"
                min={0}
                max={40}
                value={platformCommission}
                onChange={(e) => setPlatformCommission(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Platform deduction from completed job invoices</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Minimum Guaranteed Rate (₹)
              </label>
              <input
                type="number"
                min={99}
                step={50}
                value={minHourlyRate}
                onChange={(e) => setMinHourlyRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Floor price preventing unfair technician undercutting</p>
            </div>
          </div>
        </div>

        {/* Verification & Trust Rules */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Safety, Trust & Verification Policies</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Require Digital ID Card & QR at Customer Doorstep</span>
                <span className="text-slate-500 text-[11px]">Customers can scan worker QR code to verify identity before allowing entry</span>
              </div>
              <input
                type="checkbox"
                checked={requireIdCardOnArrival}
                onChange={(e) => setRequireIdCardOnArrival(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">OTP Verification on Service Start & Finish</span>
                <span className="text-slate-500 text-[11px]">Worker must collect one-time security PIN from customer to confirm job start</span>
              </div>
              <input
                type="checkbox"
                checked={otpVerificationEnabled}
                onChange={(e) => setOtpVerificationEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Automatic Document Pre-Check</span>
                <span className="text-slate-500 text-[11px]">Pre-scan government IDs and criminal background before admin queue</span>
              </div>
              <input
                type="checkbox"
                checked={autoVerifyWorkers}
                onChange={(e) => setAutoVerifyWorkers(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Support & Hotline Configuration */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Phone className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Support & Emergency Hotline</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer & Worker Toll-Free Number</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Escalation & Grievance Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Platform Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
