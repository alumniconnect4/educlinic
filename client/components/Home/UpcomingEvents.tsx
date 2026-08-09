'use client';
import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Share2,
  Loader2,
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

export function UpcomingEvents() {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<Event[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState<number | null>(null);
  const ITEMS_PER_PAGE = 4;

  const [latestUpcoming, setLatestUpcoming] = useState<Event[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);

  useEffect(() => {
    const fetchLatestUpcoming = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(
          `${apiUrl}/events/all-events/2/0?filter=upcoming`
        );
        setLatestUpcoming(res.data.events || []);
      } catch (err) {
        console.error('Failed to fetch latest upcoming events:', err);
      } finally {
        setLoadingLatest(false);
      }
    };
    fetchLatestUpcoming();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(
          `${apiUrl}/events/all-events/${ITEMS_PER_PAGE}/${offset}?filter=${filter}`
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

  return (
    <section className="bg-white py-12 md:py-20 w-full">
      <div className="w-full px-4 md:px-8 lg:px-16 xl:px-32">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900">Events</h2>
          <Link
            href="/events"
            className="px-6 py-2 border border-[#a62025] text-[#a62025] hover:bg-[#a62025] hover:text-white rounded font-medium transition-colors cursor-pointer"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-4 flex flex-col gap-6">
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
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="flex gap-4 items-start p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all group">
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
                      </Link>
                    );
                  })}
            </div>

            {totalPages > 0 && (
              <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-5">
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
            {loadingLatest || latestUpcoming.length === 0 ? (
              <div className="flex flex-col gap-6 h-full">
                {Array.from({ length: 2 }).map((_, i) => (
                  <article
                    key={i}
                    className="flex flex-col sm:flex-row h-[220px] bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 animate-pulse rounded-lg overflow-hidden"
                  >
                    <div className="w-full sm:w-[35%] bg-gray-200"></div>
                    <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between">
                      <div className="flex flex-col gap-3">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="mt-8">
                        <div className="h-10 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-6 h-full">
                {latestUpcoming.slice(0, 3).map((event) => {
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
                          className="object-cover transition-transform duration-700 hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between relative group">
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
                          <h3 className="text-[17px] md:text-[19px] font-semibold text-gray-900 leading-snug line-clamp-2 mb-5 group-hover:text-[#a62025] transition-colors">
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
                              <span className="line-clamp-1">
                                {event.place}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={`/events/${event.id}`}
                          onClick={() => setNavigatingId(event.id)}
                        >
                          <div className="mt-8">
                            <button
                              type="button"
                              disabled={navigatingId === event.id}
                              className={`inline-flex items-center gap-2 bg-[#a62025] hover:bg-[#85161a] text-white text-[13px] font-semibold px-5 py-2.5 rounded transition-all shadow-sm ${
                                navigatingId === event.id
                                  ? 'opacity-80 cursor-wait'
                                  : 'cursor-pointer'
                              }`}
                            >
                              {navigatingId === event.id ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : (
                                <span>View Event</span>
                              )}
                            </button>
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default UpcomingEvents;
