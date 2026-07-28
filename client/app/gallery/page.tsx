'use client';

import React from 'react';
import Image from 'next/image';
import DynamicGalleryView from '@/components/Gallery/DynamicGalleryView';

export default function GeneralGalleryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="relative w-full h-[250px] md:h-[350px] bg-gray-900 overflow-hidden select-none">
        <Image
          src="/gallery-images/17.jpg"
          alt="Campus Gallery Banner"
          fill
          className="object-cover opacity-85"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 flex items-center container mx-auto px-6 md:px-8 max-w-7xl z-10">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
              Campus Gallery
            </h1>
            <p className="text-xs md:text-sm text-gray-300 mt-3 font-medium leading-relaxed">
              Explore dynamic moments, infrastructure highlights, sports accomplishments, and student academic life captured across our campuses.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <DynamicGalleryView showFilters={true} initialCategory="ALL" />
        </div>
      </section>
    </div>
  );
}
