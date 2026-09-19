import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Heart, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white tracking-tight">HomeAssist</span>
                <p className="text-xs text-blue-400 font-medium">Find. Trust. Book.</p>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              HomeAssist is a trusted on-demand local worker finder and home services platform. We connect homeowners with certified plumbers, electricians, AC mechanics, carpenters, painters, and domestic technicians.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Background Verified
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400" /> Citywide Coverage
              </span>
            </div>
          </div>

          {/* Popular Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Popular Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/search?category=Plumbing" className="hover:text-white transition-colors">Plumbing Repair</Link></li>
              <li><Link to="/search?category=Electrical" className="hover:text-white transition-colors">Electrical Wiring & MCB</Link></li>
              <li><Link to="/search?category=AC+Repair" className="hover:text-white transition-colors">AC Gas Refill & Service</Link></li>
              <li><Link to="/search?category=Carpentry" className="hover:text-white transition-colors">Carpentry & Lock Fitting</Link></li>
              <li><Link to="/search?category=Painting" className="hover:text-white transition-colors">House Painting & Seepage</Link></li>
              <li><Link to="/search?category=Cleaning+Services" className="hover:text-white transition-colors">Deep Home Cleaning</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/search" className="hover:text-white transition-colors">Find Local Workers</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">All 15 Categories</Link></li>
              <li><Link to="/custom-service" className="hover:text-white transition-colors">Request Other Service</Link></li>
              <li><Link to="/register?role=worker" className="hover:text-white transition-colors">Join as a Worker</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQs & Support</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Support & Help</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>+91 (800) 456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>support@homeassist.demo</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Indiranagar Tech Corridor, Bangalore 560038</span>
              </li>
              <li className="pt-2">
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {new Date().getFullYear()} HomeAssist Inc. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span>Crafted by</span>
              <strong className="text-white font-bold tracking-wide">JASHWANTH ODAPELLI</strong>
              <span className="text-slate-600">(</span>
              <a
                href="mailto:jashwanthodapelli@gmail.com"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                jashwanthodapelli@gmail.com
              </a>
              <span className="text-slate-600">)</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/about" className="hover:text-slate-400">Terms of Service</Link>
            <Link to="/contact" className="hover:text-slate-400">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
