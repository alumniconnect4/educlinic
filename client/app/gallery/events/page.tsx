'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  Images,
  Loader2,
  ExternalLink,
  X,
  MapPin,
} from 'lucide-react';
import axios from 'axios';

interface LinkedEvent {
  id: number;
  name: string;
  startDate?: string;
  place?: string;
  imageUrl?: string | null;
}

interface Album {
  id: number;
  name: string;
  description: string | null;
  category: string;
  coverImageUrl: string | null;
  createdAt: string;
  events?: LinkedEvent[];
  _count?: {
    images: number;
  };
}

const DEFAULT_COVER = '/gallery-images/17.jpg';

export default function EventsGallery() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAlbumId, setLoadingAlbumId] = useState<number | null>(null);

  // Modal for multiple linked events selection
  const [selectedEventsModalAlbum, setSelectedEventsModalAlbum] =
    useState<Album | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiUrl}/gallery/all/100/0`);
        setAlbums(res.data.albums || []);
      } catch (err) {
        console.error('Failed to fetch gallery albums:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Image Without Text Overlay */}
      <div className="relative w-full h-[220px] md:h-[320px] bg-gray-900 overflow-hidden select-none">
        <Image
          src="/gallery/campus-life/17.jpg"
          alt="Events Banner"
          fill
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
      </div>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#b91c1c]" />
              <span className="text-sm font-semibold">
                Loading gallery albums...
              </span>
            </div>
          ) : albums.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white max-w-2xl mx-auto p-8">
              <Images className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800">
                No Albums Found
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                New photo albums uploaded via the admin portal will appear here
                automatically.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-w-5xl mx-auto">
              {albums.map((album) => {
                const hasEvents = album.events && album.events.length > 0;

                return (
                  <div
                    key={album.id}
                    className="flex flex-col sm:flex-row bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden w-full group border-none"
                  >
                    <div className="relative w-full sm:w-1/3 min-h-[200px] sm:min-h-full overflow-hidden bg-gray-100">
                      <Image
                        src={album.coverImageUrl || DEFAULT_COVER}
                        alt={album.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={album.coverImageUrl?.startsWith(
                          'data:image'
                        )}
                      />
                    </div>
                    <div className="p-6 sm:p-8 flex flex-col justify-between w-full sm:w-2/3">
                      <div>
                        <h3
                          className="text-xl sm:text-2xl font-bold text-[#1e293b] leading-snug mb-3 line-clamp-2"
                          title={album.name}
                        >
                          {album.name}
                        </h3>
                        <div className="flex items-center gap-2.5 text-gray-500 text-sm mb-6">
                          <Calendar
                            size={18}
                            className="text-gray-400 shrink-0"
                          />
                          <span>
                            {album._count?.images || 0} Photos in this Gallery
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* 1. View Album Button */}
                        <Link
                          href={`/gallery/events/${album.id}`}
                          onClick={() => setLoadingAlbumId(album.id)}
                          className={`bg-[#b91c1c] hover:bg-[#991b1b] cursor-pointer text-white px-7 py-2.5 rounded font-semibold text-sm transition-colors shadow-xs inline-flex items-center gap-2 ${
                            loadingAlbumId === album.id
                              ? 'opacity-80 pointer-events-none'
                              : ''
                          }`}
                        >
                          {loadingAlbumId === album.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Loading...</span>
                            </>
                          ) : (
                            'View Album'
                          )}
                        </Link>

                        {/* 2. View Event Details Button (only if linked to an event) */}
                        {hasEvents &&
                          (album.events!.length === 1 ? (
                            <Link
                              href={`/events/${album.events![0].id}`}
                              className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors cursor-pointer inline-flex items-center gap-2"
                            >
                              View Event Details
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedEventsModalAlbum(album)
                              }
                              className="bg-[#1e293b] hover:bg-[#0f172a] text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors cursor-pointer inline-flex items-center gap-2"
                            >
                              View Event Details
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Modal: Multiple Linked Events Selector Modal ── */}
      {selectedEventsModalAlbum && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedEventsModalAlbum(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] cursor-default animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4 bg-gray-50/70">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  Linked Events
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select an event from "{selectedEventsModalAlbum.name}" to view
                  details
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEventsModalAlbum(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Events List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {selectedEventsModalAlbum.events?.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#b91c1c] bg-white hover:bg-red-50/30 transition-all group/card shadow-2xs hover:shadow-xs"
                >
                  <div className="min-w-0 pr-3">
                    <h4 className="text-sm font-bold text-gray-900 group-hover/card:text-[#b91c1c] transition-colors leading-snug mb-1">
                      {ev.name}
                    </h4>
                    {ev.place && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{ev.place}</span>
                      </p>
                    )}
                  </div>
                  <div className="bg-[#b91c1c] text-white px-3 py-1.5 rounded text-xs font-bold inline-flex items-center gap-1 shrink-0 group-hover/card:bg-[#991b1b] transition-colors">
                    <span>View Event</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedEventsModalAlbum(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-bold transition-colors cursor-pointer"
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

