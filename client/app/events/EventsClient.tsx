'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';

interface Event {
  id: number;
  name: string;
  description: string | null;
  organizedBy: string;
  place: string;
  imageUrl?: string | null;
  eventType: string;
  visibility: string;
  startDate: string;
  endDate: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate().toString();
  const year = date.getFullYear().toString();

  const time = date.toLocaleString('default', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return {
    month,
    day,
    year,
    time,
    fullDate: `${month} ${day}, ${year}`,
  };
};

export default function EventsClient() {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<Event[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const res = await axios.get(
          `http://localhost:4000/api/events/all-events/${ITEMS_PER_PAGE}/${offset}?filter=${filter}`
        );
        setEvents(res.data.events || []);
        setTotalPages(
          Math.max(1, Math.ceil((res.data.total || 0) / ITEMS_PER_PAGE))
        );
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [page, filter]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
      <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
        <div className="flex bg-gray-50 p-1 rounded-md max-w-fit border border-gray-100">
          <button
            onClick={() => {
              setFilter('upcoming');
              setPage(1);
            }}
            className={`px-5 py-2 rounded text-sm font-medium transition-all ${filter === 'upcoming' ? 'bg-white shadow-sm text-[#a62025]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => {
              setFilter('past');
              setPage(1);
            }}
            className={`px-5 py-2 rounded text-sm font-medium transition-all ${filter === 'past' ? 'bg-white shadow-sm text-[#a62025]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Past
          </button>
        </div>

        <div className="flex flex-col gap-2 min-h-[300px]">
          {loading || events.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-start p-3 rounded-lg border border-transparent animate-pulse"
                >
                  <div className="min-w-[55px] h-[55px] bg-gray-200 rounded-md"></div>
                  <div className="flex flex-col gap-2 w-full mt-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            : events.map((event) => {
                const { month, day } = formatDate(event.startDate);
                return (
                  <div
                    key={event.id}
                    className="flex gap-4 items-start p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all group"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[55px] py-1.5 bg-gray-50 border border-gray-100 rounded-md group-hover:border-[#a62025]/30 group-hover:bg-[#a62025]/5 transition-colors">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {month}
                      </span>
                      <span className="text-xl font-bold text-[#a62025] leading-none mt-1">
                        {day}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 mt-0.5">
                      <h4 className="text-[15px] font-medium text-gray-800 leading-snug group-hover:text-[#a62025] transition-colors line-clamp-2">
                        {event.name}
                      </h4>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {event.place}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>

        {totalPages > 0 && (
          <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-5">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="p-1 text-gray-400 hover:text-[#a62025] disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
            <span className="text-xs font-medium text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="p-1 text-gray-400 hover:text-[#a62025] disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>

      <div className="lg:col-span-8">
        <div className="grid grid-cols-1 gap-6 h-full items-start">
          {loading || events.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <article
                  key={i}
                  className="group flex flex-col sm:flex-row h-[220px] bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 animate-pulse"
                >
                  <div className="w-full sm:w-[35%] bg-gray-200"></div>
                  <div className="flex-1 p-6 gap-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </article>
              ))
            : events.map((event, index) => {
                const { fullDate, time } = formatDate(event.startDate);
                return (
                  <div
                    key={event.id}
                    className="flex flex-col sm:flex-row bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[220px]"
                  >
                    <div className="relative w-full sm:w-[35%] min-h-[200px] sm:min-h-full overflow-hidden bg-gray-100">
                      <Image
                        src={event.imageUrl as string}
                        alt={event.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between relative">
                      <div
                        className="absolute top-6 right-6 text-gray-700 hover:text-black cursor-pointer transition-colors z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          const url = `${window.location.origin}/events/${event.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success('Event URL copied to share!');
                        }}
                      >
                        <Share2 size={20} strokeWidth={2.5} />
                      </div>

                      <div className="pr-10">
                        <h3 className="text-[17px] md:text-[19px] font-semibold text-gray-900 leading-snug line-clamp-2 mb-5">
                          {event.name}
                        </h3>

                        <div className="flex flex-col gap-3.5">
                          <div className="flex items-center gap-3 text-[15px] text-gray-700">
                            <Calendar
                              size={18}
                              className="text-gray-400"
                              strokeWidth={2}
                            />
                            <span>
                              {fullDate}, {time}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[15px] text-gray-700">
                            <MapPin
                              size={18}
                              className="text-gray-400"
                              strokeWidth={2}
                            />
                            <span className="line-clamp-1">{event.place}</span>
                          </div>
                        </div>
                      </div>

                      <Link href={`/events/${event.id}`}>
                        <div className="mt-8">
                          <span className="inline-block cursor-pointer bg-[#a62025] hover:bg-[#85161a] text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-colors shadow-sm">
                            View Event
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
