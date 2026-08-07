import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Search, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

import {
  CreateEventForm,
  type CreateEventFormData,
  type EventItem,
} from '@/components/events/CreateEventForm';
import { EventCard } from '@/components/events/EventCard';
import { ViewEventModal } from '@/components/events/ViewEventModal';
import { EditEventModal } from '@/components/events/EditEventModal';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Events() {
  const navigate = useNavigate();
  // State for events and pagination
  const [events, setEvents] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isLoading, setIsLoading] = useState(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'UPCOMING' | 'PAST'>(
    'ALL'
  );

  // Form submission loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // Modal active states
  const [viewingEvent, setViewingEvent] = useState<EventItem | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  // Fetch Events from API
  // Fetch Events from API across all events
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const params = new URLSearchParams();
      if (filterType === 'UPCOMING') params.append('filter', 'upcoming');
      if (filterType === 'PAST') params.append('filter', 'past');
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${apiUrl}/events/all-events/${itemsPerPage}/${offset}${queryString}`,
        { withCredentials: true }
      );
      setEvents(response.data.events || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, filterType, searchQuery]);

  // Events returned from API are filtered across all database events and sorted latest added first
  const filteredEvents = [...events].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return b.id - a.id;
  });

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  // Create Event Handler
  const handleCreateEvent = async (formData: CreateEventFormData) => {
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setIsCreating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.post(
        `${apiUrl}/events/create`,
        {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          organizedBy: formData.organizedBy.trim(),
          place: formData.place.trim(),
          eventType: formData.eventType,
          visibility: formData.visibility || 'GLOBAL',
          startDate: formData.startDate,
          endDate: formData.endDate,
          imageUrl: formData.imageUrl || undefined,
          startRegistrationsNow: formData.startRegistrationsNow ?? true,
          registrationLimit: formData.registrationLimit
            ? Number(formData.registrationLimit)
            : null,
        },
        { withCredentials: true }
      );

      toast.success('Event created successfully!');
      setCurrentPage(1);
      fetchEvents();
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  // Update Event Handler
  const handleUpdateEvent = async (eventId: number, updatedData: any) => {
    if (new Date(updatedData.endDate) <= new Date(updatedData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    setIsUpdating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.patch(
        `${apiUrl}/events/update/${eventId}`,
        {
          name: updatedData.name.trim(),
          description: updatedData.description.trim() || undefined,
          organizedBy: updatedData.organizedBy.trim(),
          place: updatedData.place.trim(),
          eventType: updatedData.eventType,
          visibility: updatedData.visibility || 'GLOBAL',
          startDate: updatedData.startDate,
          endDate: updatedData.endDate,
          imageUrl: updatedData.imageUrl || undefined,
          startRegistrationsNow: updatedData.startRegistrationsNow ?? true,
          registrationLimit: updatedData.registrationLimit
            ? Number(updatedData.registrationLimit)
            : null,
        },
        { withCredentials: true }
      );

      toast.success('Event updated successfully!');
      setEditingEvent(null);
      fetchEvents();
    } catch (error: any) {
      console.error('Failed to update event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Event Handler
  const executeDeleteEvent = async (eventId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.delete(`${apiUrl}/events/delete/${eventId}`, {
        withCredentials: true,
      });
      toast.success('Event deleted successfully!');
      fetchEvents();
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  const handleDeleteEvent = (ev: EventItem) => {
    toast(`Delete event "${ev.name}"?`, {
      description:
        'This action cannot be undone. All registrations will also be removed.',
      duration: 8000,
      action: {
        label: 'Confirm',
        onClick: () => executeDeleteEvent(ev.id),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  // Share / Copy Event URL Handler
  const handleShareEvent = (ev: EventItem) => {
    const clientUrl = import.meta.env.VITE_CLIENT_URL;
    const eventUrl = `${clientUrl}/events/${ev.id}`;
    navigator.clipboard.writeText(eventUrl);
    toast.success(`Copied Event URL: ${eventUrl}`);
  };

  return (
    <div className="w-full lg:h-[calc(100vh-112px)] lg:min-h-[580px] flex flex-col">
      {/* Main Grid: Create Form + Events Directory List */}
      <div className="w-full flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[380px_1fr] gap-6 lg:gap-8 relative">
        {/* Left Modular Component: Create Event Form */}
        <CreateEventForm onSubmit={handleCreateEvent} isCreating={isCreating} />

        {/* Right Panel: Events Directory */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm flex flex-col lg:h-full overflow-hidden">
          {/* Header Bar inside Right Panel */}
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-[#333] uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-800" />
                EVENTS DIRECTORY
              </h3>
              <span className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {total} Total
              </span>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Filter Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-200 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('ALL');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded transition-colors ${
                    filterType === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('UPCOMING');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded transition-colors ${
                    filterType === 'UPCOMING'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('PAST');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded transition-colors ${
                    filterType === 'PAST'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Past
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search all events by name, place..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-full text-xs w-full sm:w-60 focus:outline-none focus:border-slate-800"
                />
                <Search className="w-4 h-4 absolute left-3 top-2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Cards List Body */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`skeleton-event-${i}`}
                    className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-sm overflow-hidden shadow-2xs"
                  >
                    <Skeleton className="sm:w-56 md:w-64 h-48 sm:h-auto flex-shrink-0" />
                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <Skeleton className="h-6 w-2/3" />
                          <div className="flex gap-2">
                            <Skeleton className="w-6 h-6 rounded" />
                            <Skeleton className="w-6 h-6 rounded" />
                            <Skeleton className="w-6 h-6 rounded" />
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      </div>
                      <div className="pt-2 flex gap-2">
                        <Skeleton className="w-24 h-8 rounded-sm" />
                        <Skeleton className="w-36 h-8 rounded-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400 border border-dashed border-gray-200 rounded-sm">
                <Calendar className="w-8 h-8 text-gray-300" />
                <span className="text-sm font-bold text-gray-700">
                  No Events Found
                </span>
                <span className="text-xs text-gray-400">
                  Fill in the form on the left to register a new event.
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onShare={handleShareEvent}
                    onEdit={(ev) => setEditingEvent(ev)}
                    onDelete={(ev) => handleDeleteEvent(ev)}
                    onView={(ev) => setViewingEvent(ev)}
                    onViewRegistrations={(ev) =>
                      navigate(`/events/${ev.id}/registrations`)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination Footer matching Admin Portal */}
          {total > 0 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0 text-xs text-gray-600">
              <div>
                Showing{' '}
                <strong className="font-bold text-slate-800">
                  {Math.min((currentPage - 1) * itemsPerPage + 1, total)}
                </strong>{' '}
                to{' '}
                <strong className="font-bold text-slate-800">
                  {Math.min(currentPage * itemsPerPage, total)}
                </strong>{' '}
                of <strong className="font-bold text-slate-900">{total}</strong>{' '}
                events
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1 || isLoading}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  className="px-3 py-1.5 rounded border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setCurrentPage(num)}
                      className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none ${
                        currentPage === num
                          ? 'border-slate-800 bg-slate-800 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
                <button
                  type="button"
                  disabled={currentPage === totalPages || isLoading}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className="px-3 py-1.5 rounded border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ViewEventModal
        event={viewingEvent}
        onClose={() => setViewingEvent(null)}
        onEdit={(ev) => setEditingEvent(ev)}
        onDelete={(ev) => handleDeleteEvent(ev)}
      />

      <EditEventModal
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onSubmit={handleUpdateEvent}
        isUpdating={isUpdating}
      />
    </div>
  );
}
