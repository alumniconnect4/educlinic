'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  X,
  Images as ImageIcon,
  CalendarDays,
  Calendar,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import LightboxGallery from '@/components/Gallery/LightboxGallery';

interface LinkedEvent {
  id: number;
  name: string;
  startDate?: string;
  place?: string;
  imageUrl?: string | null;
}

interface AlbumViewClientProps {
  title: string;
  category?: string;
  description?: string | null;
  images: string[];
  events?: LinkedEvent[];
}

const formatEventDate = (dateString?: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate().toString();
  const year = date.getFullYear().toString();
  const time = date.toLocaleString('default', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${month} ${day}, ${year}${time !== '12:00 AM' ? ` • ${time}` : ''}`;
};

export default function AlbumViewClient({
  title,
  description,
  images,
  events,
}: AlbumViewClientProps) {
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const hasDescription = Boolean(description?.trim());

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-7xl py-12">
      {/* Navigation Back Link */}
      <div className="mb-6">
        <Link
          href="/gallery/events"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-[#b91c1c] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Events & Albums</span>
        </Link>
      </div>

      {/* Centered Album Title & Action Buttons */}
      <div className="text-center max-w-4xl mx-auto mb-10">
        {title && (
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1e293b] uppercase tracking-tight leading-snug">
            {title}
          </h1>
        )}

        {/* Squarish Action Buttons: View Description & View Event Details */}
        {(hasDescription || (events && events.length > 0)) && (
          <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
            {hasDescription && (
              <button
                type="button"
                onClick={() => setIsDescModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-gray-300 bg-white hover:bg-gray-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors shadow-2xs hover:border-slate-800 cursor-pointer"
              >
                <FileText size={15} className="text-slate-700" />
                <span>View Description</span>
              </button>
            )}

            {events && events.length > 0 && (
              <Link
                href={`/events/${events[0].id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#a82020] hover:bg-[#8f1b1b] text-white text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <CalendarDays size={15} className="text-white" />
                <span>View Event Details</span>
                <ExternalLink size={13} className="text-white/80" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Main Gallery Images Display */}
      {images.length > 0 ? (
        <LightboxGallery images={images} />
      ) : (
        <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-sm bg-gray-50 max-w-md mx-auto p-8">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">
            No Photos In This Album Yet
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Images uploaded to this album will automatically appear here.
          </p>
        </div>
      )}

      {/* ── Squarish Album Description Modal ── */}
      {isDescModalOpen && hasDescription && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsDescModalOpen(false)}
        >
          <div
            className="bg-white rounded-sm shadow-2xl border border-gray-200 w-full max-w-2xl sm:max-w-3xl overflow-hidden flex flex-col max-h-[88vh] cursor-default animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 bg-gray-50">
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
                  Album Description
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDescModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-sm transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Description Content */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-500" />
                  <span>About this Album</span>
                </h4>
                <div className="text-sm sm:text-[15px] text-slate-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 sm:p-5 rounded-sm border border-gray-200 font-normal">
                  {description}
                </div>
              </div>

              {/* Linked Events (if any) */}
              {events && events.length > 0 && (
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-[#b91c1c]" />
                    <span>Linked Event</span>
                  </h4>
                  <div className="space-y-2.5">
                    {events.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex flex-col sm:flex-row bg-white rounded-sm border border-gray-200 overflow-hidden hover:border-slate-400 transition-all group"
                      >
                        {/* Compact Event Thumbnail */}
                        <div className="relative sm:w-36 h-24 sm:h-28 shrink-0 bg-slate-100 overflow-hidden">
                          {ev.imageUrl ? (
                            <img
                              src={ev.imageUrl}
                              alt={ev.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-2 text-center">
                              <CalendarDays className="w-6 h-6 text-slate-300 mb-0.5" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                Event
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Compact Event Details */}
                        <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <h5 className="text-sm font-bold text-slate-900 group-hover:text-[#a62025] transition-colors leading-snug line-clamp-1">
                              {ev.name}
                            </h5>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                              {ev.startDate && (
                                <div className="flex items-center gap-1.5">
                                  <Calendar
                                    size={13}
                                    className="text-slate-400 shrink-0"
                                  />
                                  <span>{formatEventDate(ev.startDate)}</span>
                                </div>
                              )}
                              {ev.place && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin
                                    size={13}
                                    className="text-slate-400 shrink-0"
                                  />
                                  <span className="line-clamp-1">
                                    {ev.place}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-end">
                            <Link
                              href={`/events/${ev.id}`}
                              className="inline-flex items-center gap-1.5 bg-[#a82020] hover:bg-[#8f1b1b] text-white text-xs font-semibold px-3 py-1.5 rounded-sm transition-colors shadow-2xs"
                            >
                              <span>View Event Details</span>
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsDescModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-sm text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
