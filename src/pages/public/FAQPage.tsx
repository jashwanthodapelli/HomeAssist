import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does HomeAssist verify workers before listing them?',
      a: 'Technicians must complete an onboarding review where our admin team verifies their national ID, mobile number, past work portfolio or trade experience, and police background clearance. Only admin-approved profiles go live on the platform.'
    },
    {
      q: 'Do I need an account to search for workers?',
      a: 'No! Anyone can browse our 15+ service categories, view worker profiles, check ratings, review counts, and explore the interactive Leaflet map. When you are ready to book a service, you will be prompted to login or quickly register.'
    },
    {
      q: 'How does the digital visiting card with QR code work?',
      a: 'Every approved worker is issued a verified digital visiting card featuring their profile photo, official HomeAssist verification badge, contact details, experience level, and a scannable QR code. When scanned with any mobile camera, it opens their live booking profile instantly.'
    },
    {
      q: 'What should I do if my exact required repair is not in the 15 categories?',
      a: 'Use our "Other Service" / Custom Service feature! You can describe your specific problem, upload an optional photo, set your preferred date/time, and our admin team will review and match an appropriate specialist.'
    },
    {
      q: 'What payment methods are supported?',
      a: 'We support Cash on Delivery (COD) directly to the worker upon satisfactory job completion, as well as instant Mock UPI payment for seamless contactless transactions.'
    },
    {
      q: 'Can anyone submit a review for a worker?',
      a: 'No. To ensure 100% genuine and fair feedback, reviews and 1-5 star ratings can ONLY be submitted by customers who have completed an actual verified booking with that specific worker.'
    },
    {
      q: 'What if I am unhappy with the service delivered?',
      a: 'You can submit a formal complaint from your Customer Dashboard. Platform administrators investigate the booking details and provide a resolution with worker accountability.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Help Center</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-600">
          Everything you need to know about booking workers, verified visiting cards, and platform safety.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 hover:bg-slate-50 transition-colors"
              >
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  {faq.q}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Still have questions?</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Our friendly customer support and dispatch desk is available 7 days a week to help with your requirements.
        </p>
        <Link
          to="/contact"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          Contact Our Team
        </Link>
      </div>
    </div>
  );
};
