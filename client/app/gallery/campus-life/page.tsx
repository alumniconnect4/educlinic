'use client';

import React from 'react';
import Image from 'next/image';
import LightboxGallery from '@/components/Gallery/LightboxGallery';

export default function CampusLifeGallery() {
  const images = Array.from(
    { length: 30 },
    (_, i) => `/gallery/campus-life/${i + 1}.jpg`
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="relative w-full h-[250px] md:h-[350px] bg-gray-900 overflow-hidden">
        <Image
          src="/gallery/campus-life/17.jpg"
          alt="Campus Life Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex items-center container mx-auto px-4 md:px-8 max-w-7xl"></div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <LightboxGallery images={images} />
        </div>
      </section>
    </div>
  );
}
