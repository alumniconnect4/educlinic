'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Images, Loader2 } from 'lucide-react';
import axios from 'axios';

interface Album {
  id: number;
  name: string;
  description: string | null;
  category: string;
  coverImageUrl: string | null;
  createdAt: string;
  _count?: {
    images: number;
  };
}

const DEFAULT_COVER = '/gallery-images/17.jpg';

export default function EventsGallery() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

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
          src="/gallery-images/17.jpg"
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
              <span className="text-sm font-semibold">Loading gallery albums...</span>
            </div>
          ) : albums.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-white max-w-2xl mx-auto p-8">
              <Images className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-800">No Albums Found</h3>
              <p className="text-xs text-gray-500 mt-1">
                New photo albums uploaded via the admin portal will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-w-5xl mx-auto">
              {albums.map((album) => (
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
                      unoptimized={album.coverImageUrl?.startsWith('data:image')}
                    />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-between w-full sm:w-2/3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#1e293b] leading-snug mb-3 line-clamp-2" title={album.name}>
                        {album.name}
                      </h3>
                      <div className="flex items-center gap-2.5 text-gray-500 text-sm mb-6">
                        <Calendar size={18} className="text-gray-400 shrink-0" />
                        <span>{album._count?.images || 0} Photos in this Gallery</span>
                      </div>
                    </div>

                    <div>
                      <Link
                        href={`/gallery/events/${album.id}`}
                        className="bg-[#b91c1c] hover:bg-[#991b1b] cursor-pointer text-white px-7 py-2.5 rounded font-semibold text-sm transition-colors shadow-xs inline-block"
                      >
                        View Album
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
