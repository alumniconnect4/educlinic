'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface GalleryAlbum {
  id: string | number;
  title: string;
  cover: string;
  count?: number;
}

const Gallery = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [albumsList, setAlbumsList] = useState<GalleryAlbum[]>([]);
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
          }
        }
      } catch (err) {
        console.error('Failed to fetch gallery for home:', err);
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
          className={`flex justify-between items-center mb-8 transition-all duration-700 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
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

        {/* Gallery 3-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {albumsList.map((item, index) => (
            <Link
              key={item.id}
              href={`/gallery/events/${item.id}`}
              className={`fgroup lex flex-col gap-3 group cursor-pointer transition-all duration-700 ease-out transform ${
                isVisible
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
                  className="object-cover transition-transform duration-500 "
                  unoptimized={item.cover?.startsWith('data:image')}
                />
              </div>

              {/* Title & Items Badge */}
              <div className="flex justify-between items-start gap-3 px-0.5">
                <h3 className="font-bold text-slate-900 text-sm leading-snug flex-1 transition-colors line-clamp-2 group-hover:text-slate-900/60">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
