'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50 text-gray-400">
      <MapPin size={32} className="mb-2 animate-bounce" />
      <p className="text-sm font-medium">Loading Interactive Map...</p>
    </div>
  ),
});

export default function AlumniMap() {
  return (
    <section className="bg-white py-12 md:py-20 w-full border-t border-gray-100">
      <div className="w-full px-4 md:px-8 lg:px-16 xl:px-32">
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <h2 className="text-3xl font-semibold text-gray-900">
            World Wide Alumni Presence
          </h2>
          <p className="text-gray-500 mt-2 text-sm max-w-2xl">
            Our alumni are making an impact all over the world. Explore where
            our community is currently living and working.
          </p>
        </div>

        <div className="w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-200 relative bg-gray-50 z-0">
          <MapComponent />
        </div>
      </div>
    </section>
  );
}
