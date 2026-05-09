'use client';
import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    '/gallery/gallery-1.jpg',
    '/gallery/gallery-2.jpg',
    '/gallery/gallery-3.jpg',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex, images.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 md:py-24 lg:py-36 px-6 md:px-12 lg:px-32 xl:px-58 w-full bg-white flex flex-col items-center">
      <div className="flex flex-col mb-10 text-left w-full">

        <h2 className="text-4xl md:text-[2.75rem] font-bold text-[#111827] leading-[1.1] tracking-tight">
          Gallery Highlights
        </h2>
      </div>

      <div className="relative w-[100%] aspect-[16/10] sm:aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl group bg-[#101828]">
        <div
          className="flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((src, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              <img
                src={src}
                alt={`Gallery highlight ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
            </div>
          ))}
        </div>

        <button
          onClick={handlePrev}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-all duration-300 border border-white/20 z-10 sm:opacity-0 sm:group-hover:opacity-100 transform sm:-translate-x-4 sm:group-hover:translate-x-0"
          aria-label="Previous"
        >
          <ChevronLeft className="text-white" size={24} strokeWidth={2.5} />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-all duration-300 border border-white/20 z-10 sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-x-4 sm:group-hover:translate-x-0"
          aria-label="Next"
        >
          <ChevronRight className="text-white" size={24} strokeWidth={2.5} />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index
                  ? 'w-8 h-2.5 bg-white'
                  : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
