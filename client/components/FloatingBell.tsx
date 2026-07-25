'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, X } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'react-toastify';

export default function FloatingBell() {
  const [isOpen, setIsOpen] = useState(true);
  const { isAuthenticated } = useUserStore();

  const handleIsLoggined = () => {
    if (isAuthenticated) {
      window.location.href = "http://localhost:5173/"
    } else {
      toast.error("Login is required..")
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-4">
      <div
        className={`flex flex-col gap-2 mb-2 w-64 transition-all duration-500 origin-bottom-left ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-12 scale-50 pointer-events-none'
          }`}
      >

        <div className="relative bg-[#f1edc5]/80 backdrop-blur-sm border border-gray-400 p-3 shadow-lg shadow-black/20">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute cursor-pointer -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors shadow-md"
          >
            <X size={12} />
          </button>
          <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">Connect with Alumni</h3>
          <p className="text-gray-700 text-xs mb-2 leading-relaxed">
            You can also connect with alumni and chat directly.
          </p>
          <button
            onClick={handleIsLoggined}
            className="inline-block bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer border-none"
          >
            Click Here
          </button>
        </div>

        <div className="relative bg-[#f1edc5]/80 backdrop-blur-sm border border-gray-400 p-3 shadow-lg shadow-black/20">
          <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">Upcoming Events</h3>
          <p className="text-gray-700 text-xs mb-2 leading-relaxed">
            Check out all the exciting events happening around campus!
          </p>
          <Link
            href="/events"
            onClick={() => setIsOpen(false)}
            className="inline-block bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold px-3 py-1 rounded-full transition-colors"
          >
            Click Here
          </Link>
        </div>

      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer hover:scale-110 transition-transform drop-shadow-md"
        aria-label="Notifications"
      >
        <Bell className="text-white fill-[#fb4a1e] w-12 h-12" strokeWidth={1.5} />
        <span className="absolute top-0.5 right-1.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
      </button>
    </div>
  );
}
