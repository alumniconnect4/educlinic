'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Images } from 'lucide-react';

interface GalleryAlbum {
  id: string | number;
  title: string;
  cover: string;
  count?: number;
}

const Gallery = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [albumsList, setAlbumsList] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchLatestAlbums = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`${apiUrl}/gallery/all/3/0`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.albums && data.albums.length > 0) {
            const mapped = data.albums.slice(0, 3).map((alb: any) => ({
              id: alb.id,
              title: alb.name,
              cover: alb.coverImageUrl || '/gallery-images/17.jpg',
              count: alb._count?.images || 0,
            }));
            setAlbumsList(mapped);
          } else {
            setAlbumsList([]);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch gallery for home:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAlbums();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-white py-12 md:py-20 w-full overflow-hidden"
    >
      <div className="w-full px-4 md:px-8 lg:px-16 xl:px-32">
        {/* Section Header */}
        <div
          className={`flex justify-between items-center mb-8 transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1e293b]">
            Gallery
          </h2>
          <Link
            href="/gallery/events"
            className="px-5 py-1.5 border border-[#b91c1c] text-[#b91c1c] hover:bg-[#b91c1c] hover:text-white rounded text-sm font-semibold transition-all duration-300 shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            View All
          </Link>
        </div>

        {/* Gallery Content: Skeleton Loader / Empty State / Albums Grid */}
        {loading || error ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex flex-col gap-3 animate-pulse">
                {/* Skeleton Image Box */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 shadow-xs" />
                {/* Skeleton Title Lines */}
                <div className="flex flex-col gap-2 px-0.5 mt-1">
                  <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                  <div className="h-3 bg-gray-200 rounded-md w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : albumsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 sm:p-14 bg-gray-50/70 border-2 border-dashed border-gray-200 rounded-2xl text-center w-full min-h-[240px]">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">
              No Gallery Albums
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-sm">
              Campus life moments and event photo collections will appear here once published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {albumsList.map((item, index) => (
              <Link
                key={item.id}
                href={`/gallery/events/${item.id}`}
                className={`flex flex-col gap-3 group cursor-pointer transition-all duration-700 ease-out transform ${isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Image Container with rounded-xl */}
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md">
                  <Image
                    src={item.cover}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={item.cover?.startsWith('data:image')}
                  />
                </div>

                {/* Title & Items Badge */}
                <div className="flex justify-between items-start gap-3 px-0.5">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug flex-1 transition-colors line-clamp-2 group-hover:text-[#b91c1c]">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
