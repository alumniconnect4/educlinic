import React from 'react';
import { Calendar, MapPin, Share2, Pencil, Trash2, Users } from 'lucide-react';
import type { EventItem } from './CreateEventForm';
export type { EventItem };

interface EventCardProps {
  event: EventItem;
  onShare: (event: EventItem) => void;
  onEdit: (event: EventItem) => void;
  onDelete: (event: EventItem) => void;
  onView: (event: EventItem) => void;
  onViewRegistrations: (event: EventItem) => void;
}

const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1740065592671-9cb593ee9b78?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onShare,
  onEdit,
  onDelete,
  onView,
  onViewRegistrations,
}) => {
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart}, ${timePart}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-sm overflow-hidden shadow-2xs hover:shadow-sm transition-all group">
      {/* Left Cover Image */}
      <div
        onClick={() => onShare(event)}
        title="Click to copy student app URL"
        className="sm:w-56 md:w-64 sm:h-auto h-48 flex-shrink-0 relative overflow-hidden bg-slate-100 cursor-pointer"
      >
        <img
          src={event.imageUrl || DEFAULT_EVENT_IMAGE}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_EVENT_IMAGE;
          }}
        />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shadow-xs ${
              event.eventType === 'ONLINE'
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {event.eventType}
          </span>
          <span className="bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase shadow-xs">
            {event.visibility}
          </span>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
        <div>
          {/* Header Row: Title & Action Buttons */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3
              onClick={() => onShare(event)}
              title="Click to copy student app URL"
              className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug cursor-pointer select-none"
            >
              {event.name}
            </h3>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onShare(event)}
                title="Share Event"
                className="p-1.5 text-gray-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onEdit(event)}
                title="Edit Event"
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(event)}
                title="Delete Event"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm text-slate-600 mb-4">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-medium text-slate-700">
                {formatEventDate(event.startDate)}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-slate-600">{event.place}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-xs text-slate-500">
                Organized by{' '}
                <strong className="text-slate-700">{event.organizedBy}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons matching screenshot */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onView(event)}
            className="bg-[#a82020] hover:bg-[#8f1b1b] text-white font-medium px-3.5 py-1.5 rounded-sm text-xs transition-colors shadow-2xs cursor-pointer"
          >
            View Event
          </button>
          <button
            type="button"
            onClick={() => onViewRegistrations(event)}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-3.5 py-1.5 rounded-sm text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>View Registrations</span>
            {typeof event.verifiedRegistrationsCount === 'number' && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                {event.verifiedRegistrationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
