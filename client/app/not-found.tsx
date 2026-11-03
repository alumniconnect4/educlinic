import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Compass, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The requested page could not be found on BFGI Connect.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">

        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 tracking-tight mb-3">
          Page Not Found
        </h1>

        <p className="text-base text-gray-600 leading-relaxed mb-8">
          The page you are looking for doesn’t exist or has been moved. You can navigate back to the home page or explore our directory.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#a62025] text-white font-medium text-sm hover:bg-[#8e191d] transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Back to Homepage</span>
          </Link>

        </div>
      </div>
    </main>
  );
}
