import React from 'react';
import type { Metadata } from 'next';
import EventsClient from './EventsClient';

export const metadata: Metadata = {
  title: 'Alumni Events & Reunions',
  description:
    'Discover and register for the latest BFGI workshops, alumni reunions, guest lectures, and professional gatherings. Reconnect with peers and expand your BFGI network.',
  openGraph: {
    title: 'Alumni Events & Reunions | BFGI Connect',
    description:
      'Join upcoming alumni meets, webinars, and networking conferences organized by Baba Farid Group of Institutions.',
    url: 'https://bfgiconnect.com/events',
    images: ['/logo1.png'],
  },
  alternates: {
    canonical: 'https://bfgiconnect.com/events',
  },
};

export default function EventsPage() {
  return (
    <div className="w-full bg-white text-[#231f1b] min-h-screen font-sans">
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 xl:px-32 w-full">
        <div className="flex flex-col mb-12 md:mb-16">
          <p className="text-sm font-semibold tracking-[0.15em] text-[#a62025] uppercase mb-2">
            Stay Connected
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight tracking-tight mb-4">
            Come back home. Or join from anywhere.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
            Discover and register for the latest workshops, reunions, and
            professional gatherings. Reconnect with peers and expand your BFCET
            network.
          </p>
        </div>

        <EventsClient />
      </section>
    </div>
  );
}
