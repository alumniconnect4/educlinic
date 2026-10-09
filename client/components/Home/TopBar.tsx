import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import Link from 'next/link';

const TopBar = () => {
  return (
    <div className="bg-[#222222] w-full py-2 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 border-b border-black text-white text-sm">
      <div className="w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-2 lg:gap-4">
        <div className="flex items-center justify-between w-full lg:w-auto shrink-0">
          <h1 className="font-bold tracking-wide text-base sm:text-lg text-white mr-3">
            Alumni Portal
          </h1>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="hidden text-gray-500 lg:inline">|</span>
            <Link
              href="/auth"
              className="bg-[#e31e24] px-2.5 py-1 text-white font-semibold hover:bg-red-700 transition rounded-sm text-[11px] sm:text-xs whitespace-nowrap shadow-xs"
            >
              Apply Now
            </Link>
            <Link
              href="https://virtual-tour-bfgi-livid.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#e31e24] px-2.5 py-1 text-white font-semibold hover:bg-red-700 transition rounded-sm text-[11px] sm:text-xs whitespace-nowrap shadow-xs"
            >
              Virtual Tours
            </Link>
          </div>
        </div>

        <div className="hidden md:flex flex-wrap items-center justify-end gap-x-4 lg:gap-x-6 gap-y-1 text-xs md:text-sm font-medium text-gray-300">
          <div className="flex items-center space-x-1.5 shrink-0">
            <MapPin size={15} className="text-[#e31e24] shrink-0" />
            <span>Muktsar Road, Bathinda, Punjab</span>
          </div>
          <span className="hidden xl:inline text-gray-500">|</span>
          <div className="flex items-center space-x-1.5 shrink-0">
            <Phone size={15} className="text-[#e31e24] shrink-0" />
            <span>+91 8081-100-200</span>
          </div>
          <span className="hidden xl:inline text-gray-500">|</span>
          <div className="flex items-center space-x-1.5 shrink-0">
            <Clock size={15} className="text-[#e31e24] shrink-0" />
            <span>
              Mon - Fri <span className="ml-1 text-gray-200">9:00 - 16:00</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;

