import React from 'react';
import Image from 'next/image';
import AlbumViewClient from '@/components/Gallery/AlbumViewClient';
import { notFound } from 'next/navigation';

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  let title = '';
  let category = 'Event Gallery';
  let images: string[] = [];
  let description = '';
  let coverImageUrl = '';
  let events: {
    id: number;
    name: string;
    place?: string;
    startDate?: string;
    imageUrl?: string | null;
  }[] = [];

  // Try fetching backend album first
  const numericId = parseInt(albumId, 10);
  if (!isNaN(numericId)) {
    try {
      const res = await fetch(`${apiUrl}/gallery/${numericId}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.album) {
          title = data.album.name;
          category = data.album.category || 'Gallery';
          description = data.album.description || '';
          coverImageUrl = data.album.coverImageUrl || '';
          events = data.album.events || [];
          images = (data.album.images || [])
            .map((img: any) =>
              typeof img === 'string' ? img : img?.url || img?.imageUrl || ''
            )
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
      <AlbumViewClient
        title={title}
        category={category}
        description={description}
        images={images}
        events={events}
      />
    </div>
  );
}
