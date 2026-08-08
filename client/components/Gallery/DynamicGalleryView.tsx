'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  X,
  PlayCircle,
  PauseCircle,
  Search,
  Loader2,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import axios from 'axios';

interface GalleryItem {
  id: number;
  url: string;
  category: string;
  description: string;
  createdAt: string;
}

interface DynamicGalleryViewProps {
  initialCategory?: string; // If provided, default to this category
  showFilters?: boolean; // Whether to allow switching categories
}

export default function DynamicGalleryView({
  initialCategory = 'ALL',
  showFilters = true,
}: DynamicGalleryViewProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Lightbox index state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API base URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all items from database (unpaginated on client for fluid layout)
      const res = await axios.get(`${apiUrl}/gallery?category=ALL`);
      const allItems = res.data.items || [];
      setItems(allItems);

      // Extract unique categories dynamically
      const dbCategories = res.data.categories || [];
      setCategories(dbCategories);
    } catch (err) {
      console.error('Failed to fetch gallery items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter items in memory by category and search query
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : prev === filteredItems.length - 1 ? 0 : prev + 1
    );
  }, [filteredItems.length]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : prev === 0 ? filteredItems.length - 1 : prev - 1
    );
  }, [filteredItems.length]);

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
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, selectedIndex, handleNext]);

  return (
    <div className="w-full">
      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-150">
        {/* Category Buttons */}
        {showFilters ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none select-none">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#a62025] text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              All Media
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[#a62025] text-white shadow-sm'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 font-medium text-sm flex items-center gap-2">
            <ImageIcon size={16} className="text-[#a62025]" />
            <span>
              Category:{' '}
              <strong className="font-bold text-gray-800">
                {selectedCategory}
              </strong>
            </span>
          </div>
        )}

        {/* Brand Round Search Bar */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search description, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm bg-white focus:outline-none focus:border-[#a62025] transition-colors text-gray-800 placeholder-gray-400"
          />
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#a62025]" />
          <span className="text-sm font-medium">Loading campus gallery...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
          <ImageIcon className="w-10 h-10 text-gray-300" />
          <span className="text-base font-bold text-gray-700">
            No Media Found
          </span>
          <span className="text-xs text-gray-450 max-w-xs text-center">
            {searchQuery
              ? 'Try adjusting your search criteria.'
              : 'Check back later as new images are uploaded.'}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => openModal(index)}
              className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-xs hover:shadow-lg border border-gray-150 transition-all duration-300 flex flex-col"
            >
              {/* Aspect box */}
              <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                <Image
                  src={item.url}
                  alt={item.description}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized={item.url.startsWith('data:image')}
                />
                {/* Category Badge overlay */}
                <div className="absolute top-3 left-3 z-10 select-none">
                  <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-slate-900/80 backdrop-blur-xs text-white rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Description block */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-2 border-t border-gray-100 bg-white">
                <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-relaxed group-hover:text-[#a62025] transition-colors">
                  {item.description}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase select-none mt-1">
                  <Calendar size={11} />
                  <span>
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedIndex !== null && filteredItems[selectedIndex] && (
        <div
          className={`fixed inset-0 z-[9999] bg-black/95 flex flex-col justify-center items-center backdrop-blur-xs p-4 md:p-12 transition-opacity duration-300 ${
            isModalOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeModal}
        >
          {/* Top panel controls */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white opacity-70 hover:opacity-100 transition-opacity p-2 cursor-pointer"
              title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
            >
              {isPlaying ? <PauseCircle size={28} /> : <PlayCircle size={28} />}
            </button>
            <button
              onClick={closeModal}
              className="text-white opacity-75 hover:opacity-100 transition-opacity p-2 cursor-pointer bg-white/10 hover:bg-white/20 rounded-full"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white opacity-70 hover:opacity-100 bg-white/10 hover:bg-white/15 p-3 rounded-full transition-all cursor-pointer select-none"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white opacity-70 hover:opacity-100 bg-white/10 hover:bg-white/15 p-3 rounded-full transition-all cursor-pointer select-none"
          >
            <ChevronRight size={24} />
          </button>

          {/* Main Photo Card */}
          <div
            className={`relative w-full max-w-5xl bg-zinc-950 shadow-2xl rounded-lg overflow-hidden flex flex-col transition-transform duration-350 transform ${
              isModalOpen ? 'scale-100' : 'scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image box */}
            <div className="relative w-full aspect-[16/10] md:max-h-[70vh] bg-black">
              <Image
                src={filteredItems[selectedIndex].url}
                alt={filteredItems[selectedIndex].description}
                fill
                className="object-contain"
                unoptimized={filteredItems[selectedIndex].url.startsWith(
                  'data:image'
                )}
              />
            </div>

            {/* Bottom Caption panel */}
            <div className="p-5 md:p-6 bg-zinc-900 border-t border-zinc-800 text-white flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest bg-[#a62025] text-white rounded-full">
                  {filteredItems[selectedIndex].category}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">
                  {new Date(
                    filteredItems[selectedIndex].createdAt
                  ).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-sm md:text-base font-semibold leading-relaxed text-zinc-100 mt-1">
                {filteredItems[selectedIndex].description}
              </p>
            </div>
          </div>

          {/* Play status message */}
          {isPlaying && (
            <div className="absolute bottom-4 text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full border border-zinc-800/80 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Slideshow Active (3.5s interval)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
