'use client';

import React, { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1500);

    const removeTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#fafafa] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex items-center justify-center w-12 h-12 mb-8">
        <div className="absolute inset-0 border-[1.5px] border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-[1.5px] border-[#85161a] rounded-full border-t-transparent animate-spin"></div>
      </div>
      <h2 className="text-gray-800 font-light text-sm sm:text-base tracking-[0.25em] uppercase">
        BFGI Alumni Association
      </h2>
    </div>
  );
}
