import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Images as ImageIcon } from 'lucide-react';
import LightboxGallery from '@/components/Gallery/LightboxGallery';
import { notFound } from 'next/navigation';

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  let title = '';
  let category = 'Event Gallery';
  let images: string[] = [];
  let description = '';
  let coverImageUrl = '';

  // Try fetching backend album first
  const numericId = parseInt(albumId, 10);
  if (!isNaN(numericId)) {
    try {
      const res = await fetch(`${apiUrl}/gallery/${numericId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.album) {
          title = data.album.name;
          category = data.album.category || 'Gallery';
          description = data.album.description || '';
          coverImageUrl = data.album.coverImageUrl || '';
          images = (data.album.images || [])
            .map((img: any) => (typeof img === 'string' ? img : img?.url || img?.imageUrl || ''))
            .filter(Boolean);
        }
      }
    } catch (error) {
      console.error('Failed to fetch album from backend:', error);
    }
  }

  // If backend album not found, render 404
  if (images.length === 0 && !title) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner Image with Gradient */}
      <div className="relative w-full h-[220px] md:h-[320px] bg-slate-950 overflow-hidden select-none">
        <Image
          src="/gallery/campus-life/17.jpg"
          alt={title || 'Album Banner'}
          fill
          className="object-cover opacity-85"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Main Content Area */}
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

        {/* Centered Image Title Above All Images */}
        {title && (
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1e293b] uppercase tracking-tight text-center mb-10 max-w-4xl mx-auto leading-snug">
            {title}
          </h1>
        )}

        {description && (
          <p className="text-xs md:text-sm text-gray-600 text-center -mt-6 mb-8 max-w-2xl mx-auto font-medium">
            {description}
          </p>
        )}

        {/* Main Gallery Images Display */}
        {images.length > 0 ? (
          <LightboxGallery images={images} />
        ) : (
          <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 max-w-md mx-auto p-8">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Photos In This Album Yet</h3>
            <p className="text-xs text-gray-500 mt-1">
              Images uploaded to this album will automatically appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
