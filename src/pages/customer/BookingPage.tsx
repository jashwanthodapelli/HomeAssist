import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, Upload, CheckCircle2, 
  ArrowLeft, CreditCard, Banknote, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { Worker } from '../../types';
import { workerService, bookingService, uploadService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LeafletMap } from '../../components/LeafletMap';

export const BookingPage: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM - 12:00 PM');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Bangalore');
  const [area, setArea] = useState(user?.area || 'Indiranagar');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Mock UPI'>('COD');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946,
  });

  useEffect(() => {
    if (!workerId) return;
    workerService.getWorkerById(workerId).then((res) => {
      if (res.success) {
        setWorker(res.worker);
        if (res.worker.services && res.worker.services.length > 0) {
          setService(res.worker.services[0]);
        }
      }
      setLoading(false);
    });
  }, [workerId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !date || !time || !description || !address) {
      showToast('Please fill all required booking fields.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      let uploadedUrl = '';
      if (imageFile) {
        const uploadRes = await uploadService.uploadImage(imageFile);
        if (uploadRes.success) {
          uploadedUrl = uploadRes.url;
        }
      }

      const bookingPayload = {
        workerId: worker?._id,
        service,
        date,
        time,
        description,
        image: uploadedUrl || undefined,
        location: {
          address,
          city,
          area,
          lat: selectedCoords.lat,
          lng: selectedCoords.lng,
        },
        paymentMethod,
      };

      const res = await bookingService.createBooking(bookingPayload);
      if (res.success) {
        showToast('Booking submitted successfully! Worker has been notified.', 'success');
        navigate(`/booking-success/${res.booking._id}`, { state: { booking: res.booking } });
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create booking.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <p className="text-sm font-bold text-slate-700">Worker not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Worker Profile</span>
      </button>

      {/* Booking Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={worker.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(worker.name)}`}
            alt={worker.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Booking Appointment
            </span>
            <h1 className="text-lg font-extrabold text-slate-900 mt-0.5">{worker.name}</h1>
            <p className="text-xs text-slate-500">{worker.profession} • Base Rate: ₹{worker.hourlyRate || 350}</p>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Booking Inputs */}
        <div className="md:col-span-2 space-y-6">
          {/* Step 1: Select Service */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
              Select Required Service
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {worker.services?.map((srv, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setService(srv)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                    service === srv
                      ? 'bg-blue-50 border-blue-600 text-blue-800 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {srv}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Date & Time */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
              Preferred Date & Time Slot
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500 bg-white"
                  >
                    <option value="09:00 AM - 11:00 AM">Morning: 09:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 01:00 PM">Noon: 11:00 AM - 01:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">Afternoon: 02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">Evening: 04:00 PM - 06:00 PM</option>
                    <option value="06:00 PM - 08:00 PM">Night: 06:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Description & Image */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
              Problem Description & Photos
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Describe the Issue</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. The bathroom kitchen sink is leaking heavily under the counter, needs quick pipe replacement."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Attach Photo (Optional)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Choose Image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Step 4: Location */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">4</span>
              Service Location / Address
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address / House No.</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat 402, Sunshine Heights, 12th Cross..."
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Locality / Area</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Indiranagar"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bangalore"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            {/* Interactive map for location confirmation */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Pin Location on Map (Click on map to mark address)
              </label>
              <LeafletMap
                height="180px"
                allowLocationPicker={true}
                onLocationSelected={(lat, lng) => setSelectedCoords({ lat, lng })}
              />
            </div>
          </div>
        </div>

        {/* Right Col: Summary & Payment */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 md:sticky md:top-20">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">
              Booking Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Selected Service:</span>
                <strong className="text-slate-900">{service || 'None selected'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Scheduled Date:</span>
                <strong className="text-slate-900">{date || 'Select date'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Time Window:</span>
                <strong className="text-slate-900">{time}</strong>
              </div>
              <div className="flex justify-between">
                <span>Visiting Charge:</span>
                <strong className="text-slate-900">₹{worker.hourlyRate || 350}</strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-900">Payment Option</label>
              <div className="space-y-2">
                <label
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-slate-500">Pay directly after service is done</p>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod('Mock UPI')}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    paymentMethod === 'Mock UPI'
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">Mock UPI / Instant</p>
                    <p className="text-[10px] text-slate-500">Simulate instant cashless payment</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Book Appointment</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400">
              Worker will review and accept your booking request promptly.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
