import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, MapPin, CreditCard, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { bookingService } from '../../services';
import { Booking } from '../../types';

export const BookingSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [booking, setBooking] = useState<Booking | null>(
    (location.state as any)?.booking || null
  );

  useEffect(() => {
    if (!booking && id) {
      bookingService.getBookingById(id).then((res) => {
        if (res.success) setBooking(res.booking);
      });
    }
  }, [id, booking]);

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm text-center space-y-5">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Booking Confirmed
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
            Appointment Requested!
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your booking request has been sent to the professional. You will receive real-time updates as they accept and arrive.
          </p>
        </div>

        {/* Unique Booking ID Badge */}
        {booking && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Booking Reference</span>
              <strong className="text-blue-600 font-mono text-sm tracking-wider">
                {booking.bookingNumber}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">Service:</span>
              <strong className="text-slate-900">{booking.service}</strong>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">Scheduled:</span>
              <strong className="text-slate-900">{booking.date} ({booking.time})</strong>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">Location:</span>
              <strong className="text-slate-900 truncate">{booking.location?.address}, {booking.location?.area}</strong>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">Payment:</span>
              <strong className="text-slate-900">{booking.paymentMethod}</strong>
            </div>
          </div>
        )}

        {/* Navigation CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/bookings"
            className="w-full sm:flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>View in My Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/search"
            className="w-full sm:flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Find Another Worker
          </Link>
        </div>
      </div>
    </div>
  );
};
