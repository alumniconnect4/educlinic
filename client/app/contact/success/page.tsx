'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowLeft, Mail } from 'lucide-react';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const ticketId = searchParams.get('ticketId') || 'N/A';

  return (
    <div className="bg-[#002147] text-white p-8 md:p-12 rounded-sm shadow-lg max-w-lg w-full text-center border border-slate-700/50 flex flex-col items-center">
      <div className="w-16 h-16 bg-emerald-550/10 border border-emerald-500/25 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <CheckCircle2 className="w-10 h-10 text-emerald-450" />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold tracking-wide mb-3">
        Thank You!
      </h1>

      <p className="text-gray-300 text-sm mb-6 max-w-sm leading-relaxed">
        Your support request has been logged successfully. Our team will review
        your inquiry and get back to you shortly.
      </p>

      {/* Ticket Badge */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-sm py-4 px-6 mb-8 w-full max-w-xs">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block mb-1">
          Support Reference ID
        </span>
        <span className="text-2xl font-bold text-[#f0a500] font-mono">
          #{ticketId}
        </span>
      </div>

      {/* Informative message */}
      <div className="flex items-start gap-2.5 bg-slate-900/30 border border-slate-800/40 p-4 rounded-sm text-left text-xs text-gray-350 max-w-sm mb-8">
        <Mail className="w-4 h-4 text-[#f0a500] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          An administrator will respond directly to the email address you
          provided. Please keep this ticket ID for your records.
        </p>
      </div>

      {/* Return Button */}
      <Link
        href="/"
        className="bg-[#f0a500] hover:bg-[#d99500] text-white text-xs font-bold uppercase tracking-wider py-3 px-8 rounded-sm shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}

export default function ContactSuccessPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="bg-[#002147] text-white p-12 rounded-sm shadow-lg max-w-lg w-full text-center flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-slate-350 border-t-[#f0a500] rounded-full animate-spin mb-4"></div>
            <span className="text-sm font-semibold text-gray-300">
              Processing confirmation...
            </span>
          </div>
        }
      >
        <SuccessPageContent />
      </Suspense>
    </div>
  );
}
