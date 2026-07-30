'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  X,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';

interface LightboxGalleryProps {
  images: string[];
}

export default function LightboxGallery({ images }: LightboxGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validImages = (images || [])
    .map((img) => (typeof img === 'string' ? img : (img as any)?.url || (img as any)?.imageUrl || ''))
    .filter(Boolean);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : prev === validImages.length - 1 ? 0 : prev + 1
    );
  }, [validImages.length]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : prev === 0 ? validImages.length - 1 : prev - 1
    );
  }, [validImages.length]);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    setTimeout(() => setIsModalOpen(true), 10);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsPlaying(false);
    setTimeout(() => setSelectedIndex(null), 300);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleNext, handlePrev]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && selectedIndex !== null) {
      timer = setInterval(() => {
        handleNext();
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, selectedIndex, handleNext]);

  if (!validImages || validImages.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No images available in this gallery.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap justify-center gap-4 md:gap-6">
        {validImages.map((src, index) => (
          <div
            key={index}
            onClick={() => openModal(index)}
            className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.75rem)] lg:w-[calc(25%-1.125rem)] relative aspect-[4/3] group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gray-100"
          >
            <Image
              src={src}
              alt={`Gallery Image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized={typeof src === 'string' && src.startsWith('data:image')}
            />
          </div>
        ))}
      </div>

      {selectedIndex !== null && validImages[selectedIndex] && (
        <div
          className={`fixed inset-0 z-[9999] bg-black/80 flex flex-col justify-center items-center backdrop-blur-sm p-4 md:p-12 transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeModal}
        >
          <div
            className={`relative w-full max-w-5xl bg-white shadow-2xl rounded-sm flex flex-col overflow-hidden transition-transform duration-300 transform ${isModalOpen ? 'scale-100' : 'scale-95'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              className="absolute top-4 right-4 z-[100] bg-black/50 cursor-pointer text-white p-2 rounded-full backdrop-blur-sm transition-colors hover:bg-[#b91c1c]"
              title="Close Modal"
            >
              <X size={24} />
            </button>

            <div className="relative w-full h-[60vh] md:h-[75vh] p-2 bg-white flex items-center justify-center">
              <Image
                src={validImages[selectedIndex]}
                alt={`Gallery Image ${selectedIndex + 1}`}
                fill
                className="object-contain p-2"
                priority
                unoptimized={typeof validImages[selectedIndex] === 'string' && validImages[selectedIndex].startsWith('data:image')}
              />
            </div>

            <div className="w-full h-14 bg-white flex items-center justify-between px-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-gray-600">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(!isPlaying);
                  }}
                  className="hover:text-[#b91c1c] transition-colors flex items-center"
                  title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
                >
                  {isPlaying ? (
                    <PauseCircle size={20} strokeWidth={2} />
                  ) : (
                    <PlayCircle size={20} strokeWidth={2} />
                  )}
                </button>
                <div className="text-sm font-semibold tracking-wide text-gray-500">
                  {selectedIndex + 1} / {validImages.length}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal();
                }}
                className="flex items-center gap-1.5 bg-gray-400 cursor-pointer hover:bg-[#b91c1c] text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider transition-colors"
              >
                CLOSE <X size={14} strokeWidth={3} />
              </button>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-[#b91c1c] text-white p-2 md:p-3 rounded-full transition-colors z-50"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-[#b91c1c] text-white p-2 md:p-3 rounded-full transition-colors z-50"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </>
  );
}
