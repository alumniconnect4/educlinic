import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';

const TopBar = () => {
  return (
    <div className="bg-[#d60000] w-full py-2 px-6 md:px-12 lg:px-32 xl:px-58 flex flex-col lg:flex-row items-center justify-between text-white text-sm">
      <div className="flex items-center space-x-4 mb-2 lg:mb-0">
        <h1 className="font-semibold tracking-wide">Alumni Portal</h1>
        <span className="hidden text-white/50 md:inline">|</span>
        <a href="#" className="hover:underline font-medium">
          Apply Now
        </a>
      </div>

      <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-xs md:text-sm font-medium">
        <div className="flex items-center space-x-2">
          <MapPin size={16} className="text-white/80" />
          <span>Muktsar Road, Bathinda, Punjab</span>
        </div>
        <span className="hidden text-white/50 md:inline">|</span>
        <div className="flex items-center space-x-2">
          <Phone size={16} className="text-white/80" />
          <span>+91 8081-100-200</span>
        </div>
        <span className="hidden text-white/50 md:inline">|</span>
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-white/80" />
          <span>Mon - Fri 8:50 - 16:00</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
