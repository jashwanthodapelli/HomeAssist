import React from 'react';
import { ShieldCheck, Users, HeartHandshake, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Our Mission</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Reinventing Local Home Services with Trust & Transparency
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          HomeAssist was built to solve a critical real-world problem: finding dependable, skilled, and background-checked technicians for home repairs without unpredictable rates or safety worries.
        </p>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Admin-Vetted Quality</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every technician undergoes identity verification, past experience checks, and skill assessments before being approved on the platform.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Worker Dignity & Growth</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Workers receive digital verified ID cards, direct customer connections, transparent earnings, and the dignity of building their independent brand.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Verified Reviews</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ratings can only be posted by verified customers who completed an actual booked job, eliminating fake promotional reviews.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <h2 className="text-2xl font-extrabold">The HomeAssist Pledge</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              For Homeowners
            </div>
            <p>
              Complete peace of mind knowing that verified professionals will handle your plumbing, electrical, and appliance repairs safely and honestly.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              For Skilled Technicians
            </div>
            <p>
              A digital identity to showcase your craftsmanship, generate repeat customer loyalty, and expand your service reach across the city.
            </p>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <Link
            to="/search"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            Find a Worker
          </Link>
          <Link
            to="/register?role=worker"
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Join as a Worker
          </Link>
        </div>
      </div>
    </div>
  );
};
