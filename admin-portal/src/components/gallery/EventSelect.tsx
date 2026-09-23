import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Check,
  ChevronsUpDown,
  Search,
  X,
  Loader2,
  MapPin,
} from 'lucide-react';
import axios from 'axios';

export interface EventOption {
  id: number;
  name: string;
  startDate?: string;
  place?: string;
}

interface EventSelectProps {
  selectedEventId: number | null;
  onChange: (selectedId: number | null) => void;
  label?: string;
}

export const EventSelect: React.FC<EventSelectProps> = ({
  selectedEventId,
  onChange,
  label = 'Link with Event (Optional)',
}) => {
  const [events, setEvents] = useState<EventOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.get(`${apiUrl}/events/all-events/100/0`, {
          withCredentials: true,
        });
        setEvents(response.data.events || []);
      } catch (err) {
        console.error('Failed to fetch events for selector:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectEvent = (eventId: number) => {
    if (selectedEventId === eventId) {
      onChange(null);
    } else {
      onChange(eventId);
    }
    setIsOpen(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const filteredEvents = events.filter(
    (ev) =>
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      (ev.place && ev.place.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedEvent = events.find((ev) => ev.id === selectedEventId);

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider">
          {label}
        </label>
        {selectedEvent && (
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            1 Event Linked
          </span>
        )}
      </div>

      {/* Selected Event Card Pill */}
      {selectedEvent && (
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {selectedEvent.name}
              </p>
              {selectedEvent.place && (
                <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {selectedEvent.place}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            title="Remove linked event"
            className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full min-h-[38px] px-3 py-2 text-left text-sm border border-gray-200 rounded-sm bg-white text-slate-800 focus:outline-none focus:border-slate-800 transition-colors flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2 truncate text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">
              {selectedEvent
                ? 'Change linked event...'
                : 'Select an event to link (Optional)...'}
            </span>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-sm shadow-xl z-50 overflow-hidden text-xs">
            {/* Search */}
            <div className="p-2 border-b border-gray-100 bg-slate-50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-slate-800"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
              {/* Option to clear */}
              {selectedEventId && (
                <div
                  onClick={() => {
                    onChange(null);
                    setIsOpen(false);
                  }}
                  className="px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-red-50 text-red-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="font-semibold text-xs">
                    No linked event (Clear)
                  </span>
                </div>
              )}

              {isLoading ? (
                <div className="p-4 text-center text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading events...</span>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  No matching events found
                </div>
              ) : (
                filteredEvents.map((ev) => {
                  const isSelected = selectedEventId === ev.id;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => handleSelectEvent(ev.id)}
                      className={`px-3 py-2 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-slate-100/90 text-slate-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-xs text-slate-800">
                          {ev.name}
                        </div>
                        {ev.place && (
                          <div className="text-[10px] text-gray-400 truncate">
                            {ev.place}
                          </div>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
