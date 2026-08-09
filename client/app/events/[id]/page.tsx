'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Eye,
  Share2,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { useUserStore } from '@/store/useUserStore';
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
  registrationLimit?: number | null;
  startRegistrationsNow?: boolean;
  _count?: {
    registrations: number;
  };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  const time = date.toLocaleString('default', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return {
    fullDate: date.toLocaleDateString('en-US', options),
    time,
  };
};

const renderMarkdownDescription = (text?: string | null) => {
  if (!text)
    return (
      <p className="text-gray-500 italic">
        No description provided for this event.
      </p>
    );

  const lines = text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="list-disc list-inside space-y-1.5 my-3 text-gray-700 pl-2"
        >
          {listItems.map((li, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInlineMarkdown(li)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const formatInlineMarkdown = (line: string): React.ReactNode => {
    // Check for markdown image ![alt](url)
    const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
    const imgMatch = imgRegex.exec(line);
    if (imgMatch) {
      return (
        <span className="block my-4">
          <img
            src={imgMatch[2]}
            alt={imgMatch[1] || 'Event image'}
            className="max-h-80 w-auto rounded-lg border border-gray-200 shadow-sm object-contain"
          />
          {imgMatch[1] && (
            <span className="block text-[12px] text-gray-500 mt-1 italic">
              {imgMatch[1]}
            </span>
          )}
        </span>
      );
    }

    // Format links [title](url) and **bold**
    const parts: React.ReactNode[] = [];
    let remaining = line;
    let idx = 0;
    const tokenRegex =
      /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(\*\*([^*]+)\*\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.substring(lastIndex, match.index));
      }
      if (match[1]) {
        parts.push(
          <a
            key={idx++}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
          >
            {match[2]}
          </a>
        );
      } else if (match[4]) {
        parts.push(
          <strong key={idx++} className="font-bold text-gray-900">
            {match[5]}
          </strong>
        );
      }
      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < remaining.length) {
      parts.push(remaining.substring(lastIndex));
    }

    return parts.length > 0 ? parts : line;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(line.substring(2));
    } else {
      flushList();
      if (!line) {
        elements.push(<div key={`space-${idx}`} className="h-3" />);
      } else if (line.startsWith('### ')) {
        elements.push(
          <h4
            key={`h4-${idx}`}
            className="text-base font-bold text-gray-900 mt-5 mb-2"
          >
            {formatInlineMarkdown(line.substring(4))}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h3
            key={`h3-${idx}`}
            className="text-lg font-bold text-gray-900 mt-6 mb-2 border-b border-gray-100 pb-1"
          >
            {formatInlineMarkdown(line.substring(3))}
          </h3>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h2
            key={`h2-${idx}`}
            className="text-xl font-bold text-gray-900 mt-6 mb-2 border-b border-gray-200 pb-1"
          >
            {formatInlineMarkdown(line.substring(2))}
          </h2>
        );
      } else {
        elements.push(
          <p
            key={`p-${idx}`}
            className="text-[15px] text-gray-700 leading-relaxed"
          >
            {formatInlineMarkdown(line)}
          </p>
        );
      }
    }
  });
  flushList();

  return <div className="space-y-2">{elements}</div>;
};

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, user } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const placeholderImages = [
    '/gallery/gallery-5.jpg',
    '/gallery/gallery-6.jpg',
    '/gallery/gallery-7.jpg',
  ];

  useEffect(() => {
    if (!id) return;

    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await axios.get(`${apiUrl}/events/${id}`, {
          withCredentials: true,
        });
        setEvent(res.data.event);
      } catch (err) {
        console.warn('Could not fetch event from server:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    setIsSubmitting(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/events/register/${id}`,
        data,
        { withCredentials: true }
      );
      toast.success('Successfully registered!');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#a62025]/30 border-t-[#a62025] rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Event Not Found
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The event you are looking for does not exist or may have been
            removed.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 bg-[#a62025] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#85161a] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>
      </div>
    );
  }

  const { fullDate: startFull, time: startTime } = formatDate(event.startDate);

  const isBadUrl = event.imageUrl?.includes('unsplash.com/photos/');
  const eventImage =
    event.imageUrl && !isBadUrl
      ? event.imageUrl
      : placeholderImages[event.id % placeholderImages.length];

  return (
    <div className="w-full bg-white min-h-screen font-sans pb-16 md:pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-6 md:pt-10">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#a62025] font-medium transition-colors text-[14px] cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="relative w-full aspect-video md:aspect-[2.5/1] overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg">
              <div
                className="absolute inset-0 bg-cover bg-center blur-xl opacity-60 scale-110"
                style={{ backgroundImage: `url(${eventImage})` }}
              />
              <div className="relative w-full h-full z-10 p-2">
                <Image
                  src={eventImage as string}
                  alt={event.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 md:p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-5">
                About
              </h3>
              <div className="font-medium">
                {renderMarkdownDescription(event.description)}
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col lg:sticky lg:top-8">
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-emerald-600">
                    Upcoming Event
                  </span>
                </div>
                <button className="flex items-center gap-1 text-[13px] text-gray-600 font-medium hover:text-gray-900 transition-colors cursor-pointer">
                  Share <Share2 size={15} />
                </button>
              </div>

              <h1 className="text-[20px] md:text-[22px] font-bold text-gray-900 leading-snug mb-5">
                {event.name}
              </h1>
              <div className="flex flex-col gap-3.5 mb-7">
                <div className="flex items-start gap-3 text-[14px] text-gray-700 font-medium">
                  <Calendar
                    size={17}
                    className="text-gray-400 mt-0.5 shrink-0"
                    strokeWidth={2}
                  />
                  <span>
                    {startFull} {startTime}
                  </span>
                </div>
                <div className="flex items-start gap-3 text-[14px] text-gray-700 font-medium">
                  <MapPin
                    size={17}
                    className="text-gray-400 mt-0.5 shrink-0"
                    strokeWidth={2}
                  />
                  <span className="whitespace-pre-line leading-snug">
                    {event.place}
                  </span>
                </div>
              </div>

              {(() => {
                const isLimitReached =
                  event.registrationLimit &&
                  event.registrationLimit > 0 &&
                  typeof event._count?.registrations === 'number' &&
                  event._count.registrations >= event.registrationLimit;

                if (isLimitReached) {
                  return (
                    <button
                      disabled
                      className="w-full bg-gray-400 text-white text-center text-[14px] font-semibold py-3.5 rounded border border-transparent shadow-sm cursor-not-allowed"
                    >
                      Registration Limit Reached ({event.registrationLimit}{' '}
                      seats filled)
                    </button>
                  );
                }

                return (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error(
                          'Please make sure you are logged in to register.'
                        );
                      } else {
                        setIsModalOpen(true);
                      }
                    }}
                    className="w-full bg-[#a62025] hover:bg-[#85161a] text-white text-center text-[14px] font-semibold py-3.5 rounded border border-transparent shadow-sm cursor-pointer transition-colors"
                  >
                    Register Now
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 min-h-[400px]">
            <div className="px-8 py-5 border-b border-gray-200 flex justify-between items-center bg-white relative">
              <h2 className="text-[22px] text-gray-900 font-normal truncate pr-10">
                Registration for {event.name}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer text-2xl font-light absolute right-6 top-5"
              >
                &times;
              </button>
            </div>

            <form
              onSubmit={handleRegister}
              className="p-8 md:p-10 flex flex-col bg-white flex-1 overflow-y-auto max-h-[75vh]"
            >
              <h3 className="text-[#85161a] text-[17px] font-normal tracking-wide mb-10 uppercase">
                FILL DETAILS
              </h3>

              <div className="flex flex-col gap-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end">
                  <div className="md:col-span-5 relative group">
                    <label className="text-gray-400 text-[15px] absolute -top-6 left-0 transition-colors group-focus-within:text-gray-700">
                      Name <span className="text-gray-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={user?.name || ''}
                      readOnly
                      className="w-full py-1.5 border-b border-gray-200 bg-transparent text-gray-800 focus:outline-none focus:border-gray-400 font-medium cursor-default text-[15px]"
                    />
                  </div>

                  <div className="md:col-span-3 relative group">
                    <label className="text-[#85161a] text-[14px] absolute -top-6 left-0 transition-colors">
                      Country Code <span className="text-[#85161a]">*</span>
                    </label>
                    <select
                      name="countryCode"
                      className="w-full py-1.5 border-b border-gray-200 bg-transparent text-gray-800 focus:outline-none focus:border-gray-400 cursor-pointer text-[15px]"
                    >
                      <option value="+91">+91 India</option>
                      <option value="+1">+1 USA</option>
                      <option value="+44">+44 UK</option>
                    </select>
                  </div>

                  <div className="md:col-span-4 relative group">
                    <label className="text-gray-400 text-[15px] absolute -top-6 left-0 transition-colors group-focus-within:text-gray-700">
                      Contact No. <span className="text-gray-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactNo"
                      required
                      className="w-full py-1.5 border-b border-gray-200 bg-transparent text-gray-800 focus:outline-none focus:border-gray-400 text-[15px]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end mt-2">
                  <div className="md:col-span-6 relative group">
                    <label className="text-gray-400 text-[15px] absolute -top-6 left-0 transition-colors group-focus-within:text-gray-700">
                      Personal E-mail <span className="text-gray-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={user?.email || ''}
                      readOnly
                      className="w-full py-1.5 border-b border-gray-200 bg-transparent text-gray-800 focus:outline-none focus:border-gray-400 font-medium cursor-default text-[15px]"
                    />
                  </div>

                  <div className="md:col-span-6 relative group">
                    <label className="text-gray-400 text-[15px] absolute -top-6 left-0 transition-colors group-focus-within:text-gray-700">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      name="linkedInUrl"
                      className="w-full py-1.5 border-b border-gray-200 bg-transparent text-gray-800 focus:outline-none focus:border-gray-400 text-[15px]"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end mt-2">
                  <div className="md:col-span-7 relative group">
                    <label className="text-gray-400 text-[15px] absolute -top-6 left-0 transition-colors group-focus-within:text-gray-700">
                      Company / College
                    </label>
                    <input
                      type="text"
                      name="companyOrCollege"
                      className="w-full py-1.5 border-b border-gray-200 bg-transparent text-gray-800 focus:outline-none focus:border-gray-400 text-[15px]"
                      placeholder="e.g. Google or BFGI"
                    />
                  </div>

                  <div className="md:col-span-5 relative group">
                    <label className="text-gray-400 text-[15px] absolute -top-6 left-0 transition-colors group-focus-within:text-gray-700">
                      Graduation Year (or Expected)
                    </label>
                    <input
                      type="text"
                      name="graduationYear"
                      className="w-full py-1.5 border-b border-gray-200 bg-transparent text-gray-800 focus:outline-none focus:border-gray-400 text-[15px]"
                      placeholder="e.g. 2026"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-16 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-2.5 text-[15px] text-white bg-[#85161a] hover:bg-[#6c1215] transition-colors tracking-wider flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'opacity-75 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>SUBMITTING...</span>
                    </>
                  ) : (
                    <span>COMPLETE REGISTRATION</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
