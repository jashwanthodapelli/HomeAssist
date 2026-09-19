import React, { useEffect, useState } from 'react';
import { 
  Sparkles, Upload, Calendar, Clock, MapPin, CheckCircle2, 
  ArrowRight, ShieldCheck, AlertCircle, Wrench, Package, 
  Zap, ChevronRight, X, Image as ImageIcon, Send
} from 'lucide-react';
import { CustomServiceRequest } from '../../types';
import { customService, uploadService } from '../../services';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const EXAMPLE_SUGGESTIONS = [
  {
    title: 'Balcony Anti-Bird Netting & Cable Rigging',
    description: 'Require high-density UV resistant safety net installation across a 12x6 ft balcony with stainless steel hook anchors.',
  },
  {
    title: 'Solar Inverter & Battery Descaling',
    description: 'Check rooftop 3kW solar hybrid inverter connections, test battery acid levels, and clean dust buildup from exterior heat sinks.',
  },
  {
    title: 'Smart Touch Door Lock & Gateway Setup',
    description: 'Mortise lock installation on main teakwood wooden door, configure fingerprint scanner and sync with home Wi-Fi gateway.',
  },
  {
    title: 'Aquarium Canister Filter & CO2 Tuning',
    description: 'Set up high-flow external canister filter pipes, calibrate bubble counter valve, and inspect water pump impeller noise.',
  },
];

export const CustomServiceRequestPage: React.FC = () => {
  const { user, promptAuth } = useAuth();
  const { showToast } = useNotification();

  const [myRequests, setMyRequests] = useState<CustomServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Morning: 09:00 AM - 12:00 PM');
  const [urgency, setUrgency] = useState<'Standard' | 'Urgent' | 'Flexible'>('Standard');
  const [materialsCondition, setMaterialsCondition] = useState<'Need Pro to Procure' | 'Already Available' | 'Inspection Required'>('Need Pro to Procure');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Bangalore');
  const [area, setArea] = useState(user?.area || 'Indiranagar');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await customService.getMyCustomServices();
      const list = res?.customServices || res?.requests || [];
      setMyRequests(Array.isArray(list) ? list : []);
    } catch {
      setMyRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRequests();
    else setLoading(false);
  }, [user]);

  const handleApplySuggestion = (s: typeof EXAMPLE_SUGGESTIONS[0]) => {
    setTitle(s.title);
    setDescription(s.description);
    showToast(`Loaded "${s.title}" template!`, 'info');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      promptAuth('/request-custom', 'Please login or create an account to continue.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      showToast('Please provide a title and detailed description', 'error');
      return;
    }

    try {
      setSubmitting(true);
      let uploadedUrl = '';
      if (imageFile) {
        const upRes = await uploadService.uploadImage(imageFile);
        if (upRes?.success) uploadedUrl = upRes.url;
      }

      const payload = {
        title,
        description: `[Urgency: ${urgency}] [Materials: ${materialsCondition}]\n\n${description}`,
        image: uploadedUrl || undefined,
        preferredDate: preferredDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        preferredTime,
        location: { address, city, area },
      };

      const res = await customService.submitCustomService(payload);
      if (res.success) {
        showToast('Custom service inquiry lodged! Operations team notified.', 'success');
        setTitle('');
        setDescription('');
        setPreferredDate('');
        setImageFile(null);
        setImagePreview('');
        fetchRequests();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit custom request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Specialized & Bespoke Assistance</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Custom Home Service Request
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Need specialized equipment, rare home maintenance, or a combination job outside our standard catalog? 
            Describe your problem and our operations team will match you with a vetted, background-checked professional.
          </p>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Popular Custom Requests (Click to auto-fill)</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {EXAMPLE_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySuggestion(item)}
              className="text-left p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 hover:shadow-xs transition-all group"
            >
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                {item.title}
              </p>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Custom Work Specification</h2>
              <p className="text-xs text-slate-500">Provide clear details for the most accurate quote and technician match</p>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              Bangalore Metro
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Job Title / Service Objective *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Balcony pigeon safety net fixing, Antique teak dining table restoration..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium"
              />
            </div>

            {/* Urgency and Materials Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Schedule Priority</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Standard', 'Urgent', 'Flexible'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUrgency(u)}
                      className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition-all ${
                        urgency === u
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Parts & Materials Status</label>
                <select
                  value={materialsCondition}
                  onChange={(e: any) => setMaterialsCondition(e.target.value)}
                  className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium"
                >
                  <option value="Need Pro to Procure">Technician should bring / buy materials</option>
                  <option value="Already Available">I already have the required materials/parts</option>
                  <option value="Inspection Required">Need inspection first to decide parts</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Scope, Dimensions & Requirements *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe exact dimensions, electrical voltages, height, specific material preferences, brand models, or any safety precautions..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 leading-relaxed font-normal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time Window *</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium"
                >
                  <option value="Morning: 09:00 AM - 12:00 PM">Morning: 09:00 AM - 12:00 PM</option>
                  <option value="Afternoon: 01:00 PM - 04:00 PM">Afternoon: 01:00 PM - 04:00 PM</option>
                  <option value="Evening: 04:00 PM - 07:00 PM">Evening: 04:00 PM - 07:00 PM</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Address / Apartment *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat/House number, Building name, Street..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Area / Locality *</label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Indiranagar"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bangalore"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Photo Attachment */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Blueprint, Appliance Photo, or Space Image (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors border border-slate-200">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>{imageFile ? 'Change Photo' : 'Upload Reference Photo'}</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {imagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-xs"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Custom Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Custom Service Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Info & Past Requests */}
        <div className="space-y-6">
          {/* Trust Guarantees */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">HomeAssist Custom Guarantee</h3>
            </div>

            <ul className="text-xs text-slate-300 space-y-3">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Admin Vetting:</strong> Custom tasks are pre-reviewed to calculate fair market rates and scope.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Digital Verification:</strong> Assigned pros arrive with verified digital visiting cards and QR verification.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Category Expansion:</strong> Popular custom tasks get converted into standard bookable services!</span>
              </li>
            </ul>
          </div>

          {/* User's Previous Requests */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                My Custom Inquiries ({myRequests.length})
              </h4>
              {user && (
                <button
                  onClick={fetchRequests}
                  className="text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  Refresh
                </button>
              )}
            </div>

            {!user ? (
              <div className="text-center py-6 text-xs text-slate-500 space-y-2">
                <p>Sign in to track your submitted custom requests and technician matches.</p>
                <button
                  onClick={() => promptAuth('/request-custom')}
                  className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs"
                >
                  Sign In
                </button>
              </div>
            ) : myRequests.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No custom inquiries submitted yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {myRequests.map((req) => (
                  <div key={req._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900 truncate">{req.title}</span>
                      <StatusBadge status={req.status || 'Pending'} />
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{req.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                      <span>Date: {req.preferredDate || 'Flexible'}</span>
                      <span>{req.preferredTime?.split(':')[0] || 'Day slot'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
