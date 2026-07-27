import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Calendar,
  MapPin,
  Grid,
  List,
  Search,
  Trash2,
  Edit3,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  AlertTriangle
} from 'lucide-react';

interface Event {
  id: number;
  name: string;
  description?: string | null;
  organizedBy: string;
  place: string;
  eventType: 'ONLINE' | 'OFFLINE';
  visibility: 'GLOBAL' | 'DEPARTMENTAL';
  startDate: string;
  endDate: string;
  imageUrl?: string | null;
  createdById: number;
  permissionMode: string;
  permittedAdminIds: number[];
}

export const Events: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const canEditEvent = (event: Event) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (event.createdById === user.id) return true;
    if (event.permissionMode === 'HYBRID' && event.permittedAdminIds?.includes(user.id)) {
      return true;
    }
    return false;
  };

  // Filters and Pagination
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('all');
  const [page, setPage] = useState(0);
  const limit = 6;

  // Delete modal state
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const offset = page * limit;
      let url = `/events/all-events/${limit}/${offset}`;

      const queryParams: string[] = [];
      if (filterType !== 'all') {
        queryParams.push(`filter=${filterType}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const response = await apiRequest<{ events: Event[], total: number }>(url);
      setEvents(response.events);
      setTotal(response.total);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, filterType]);

  // Reset page when filter changes
  const handleFilterChange = (type: 'all' | 'upcoming' | 'past') => {
    setFilterType(type);
    setPage(0);
  };

  const handleDelete = async () => {
    if (deleteEventId === null) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await apiRequest(`/events/delete/${deleteEventId}`, {
        method: 'DELETE',
      });
      setEvents(events.filter(e => e.id !== deleteEventId));
      setTotal(prev => prev - 1);
      setDeleteEventId(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete event. Make sure you are the creator.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredEvents = events.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.organizedBy.toLowerCase().includes(search.toLowerCase()) ||
    e.place.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">Events Management</h1>
          <p className="text-muted-foreground mt-1">Manage scheduled events, edits, and view attendee lists.</p>
        </div>
        <Link
          to="/events/new"
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] self-start sm:self-center"
        >
          <Plus className="h-5 w-5" />
          <span>Create Event</span>
        </Link>
      </div>

      {/* Control Bar (Search, Filter, View Toggle) */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search events by name, place, host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-2.5 border border-border placeholder-muted-foreground text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
          />
        </div>

        {/* Filters and View Toggles */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['all', 'upcoming', 'past'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filterType === type
                    ? 'bg-white text-secondary shadow-sm'
                    : 'text-muted-foreground hover:text-secondary'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-secondary'
                }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-secondary'
                }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-secondary">No events found</h3>
          <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.startDate).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
              >
                {/* Event Image */}
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1740065592671-9cb593ee9b78?q=80&w=1173'}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold text-white uppercase shadow-sm ${event.eventType === 'ONLINE' ? 'bg-purple-600' : 'bg-blue-600'
                      }`}>
                      {event.eventType}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-secondary uppercase bg-white/95 shadow-sm">
                      {event.visibility}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-secondary text-lg hover:text-primary transition-colors leading-snug line-clamp-1">
                      <Link to={`/events/${event.id}`}>{event.name}</Link>
                    </h3>
                    <p className="text-xs text-muted-foreground font-semibold">Organized by {event.organizedBy}</p>
                    <p className="text-sm text-muted-foreground/80 line-clamp-2">
                      {event.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-50 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{eventDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{event.place}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 mt-auto">
                    <Link
                      to={`/events/${event.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-secondary hover:text-primary px-3 py-2 rounded-lg bg-gray-50 hover:bg-primary/5 transition-all"
                    >
                      <Users className="h-4 w-4" />
                      <span>Registrations</span>
                    </Link>

                    {canEditEvent(event) && (
                      <div className="flex space-x-1">
                        <Link
                          to={`/events/edit/${event.id}`}
                          className="p-2 text-muted-foreground hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit Event"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteEventId(event.id)}
                          className="p-2 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Layout */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left">
              <thead className="bg-gray-50/70 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Event Details</th>
                  <th className="px-6 py-4">Host / Location</th>
                  <th className="px-6 py-4">Date / Time</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-secondary">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-16 rounded bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                          <img
                            src={event.imageUrl || 'https://images.unsplash.com/photo-1740065592671-9cb593ee9b78?q=80&w=1173'}
                            alt={event.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <Link to={`/events/${event.id}`} className="font-extrabold hover:text-primary transition-colors block leading-tight">
                            {event.name}
                          </Link>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mt-0.5 inline-block">
                            {event.visibility}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{event.organizedBy}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{event.place}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">
                        {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.startDate).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-extrabold ${event.eventType === 'ONLINE' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                        {event.eventType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/events/${event.id}`}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-secondary hover:text-primary px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 hover:bg-primary/5 hover:border-primary/10 transition-all"
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>Attendees</span>
                        </Link>
                        {canEditEvent(event) && (
                          <>
                            <Link
                              to={`/events/edit/${event.id}`}
                              className="p-1.5 text-muted-foreground hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteEventId(event.id)}
                              className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-secondary">{page * limit + 1}</span> to{' '}
            <span className="font-semibold text-secondary">
              {Math.min((page + 1) * limit, total)}
            </span>{' '}
            of <span className="font-semibold text-secondary">{total}</span> events
          </p>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="p-2.5 rounded-xl border border-border bg-white text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
              disabled={page === totalPages - 1}
              className="p-2.5 rounded-xl border border-border bg-white text-secondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Delete Dialog */}
      {deleteEventId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDeleteEventId(null)} />

          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setDeleteEventId(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-secondary p-1 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 text-primary mb-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-secondary">Delete this event?</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Are you sure you want to permanently delete this event? This will delete all attendee registrations and cannot be undone.
            </p>

            {deleteError && (
              <p className="text-xs text-primary bg-primary/5 p-3 rounded-lg font-medium mb-4">
                {deleteError}
              </p>
            )}

            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteEventId(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-border hover:bg-gray-50 text-sm font-semibold text-secondary transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;