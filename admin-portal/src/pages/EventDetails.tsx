import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../utils/api.ts';
import { 
  Calendar, 
  MapPin, 
  User, 
  ChevronLeft, 
  Loader2, 
  Download, 
  Search, 
  ExternalLink, 
  Phone,
  Mail,
  Building,
  GraduationCap
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
}

interface Registration {
  id: number;
  eventId: number;
  userId: number;
  name: string;
  email: string;
  countryCode?: string | null;
  contactNo?: string | null;
  companyOrCollege?: string | null;
  graduationYear?: string | null;
  linkedInUrl?: string | null;
  createdAt: string;
}

export const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const [eventRes, regsRes] = await Promise.all([
            apiRequest<{ event: Event }>(`/events/${id}`),
            apiRequest<{ registrations: Registration[] }>(`/events/${id}/registrations`),
          ]);
          setEvent(eventRes.event);
          setRegistrations(regsRes.registrations);
        } catch (err) {
          console.error('Error fetching event details and registrations:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  // Export registrations list to CSV
  const exportToCSV = () => {
    if (!event || registrations.length === 0) return;
    
    const headers = ['Name', 'Email', 'Phone', 'Company/College', 'Graduation Year', 'LinkedIn URL', 'Registration Date'];
    const rows = registrations.map(reg => [
      reg.name,
      reg.email,
      `${reg.countryCode || ''} ${reg.contactNo || ''}`.trim(),
      reg.companyOrCollege || '',
      reg.graduationYear || '',
      reg.linkedInUrl || '',
      new Date(reg.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = registrations.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase()) ||
    (r.companyOrCollege && r.companyOrCollege.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm max-w-lg mx-auto">
        <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-secondary">Event not found</h3>
        <p className="text-muted-foreground text-sm mt-1">The event details could not be retrieved.</p>
        <Link to="/events" className="mt-6 inline-flex items-center space-x-2 text-primary font-semibold hover:text-primary/80">
          <ChevronLeft className="h-4 w-4" /> <span>Back to events</span>
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.startDate).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  const endDate = new Date(event.endDate).toLocaleDateString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation Row */}
      <div className="flex items-center space-x-3">
        <Link 
          to="/events" 
          className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm text-secondary hover:text-primary transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">Event Details</h1>
          <p className="text-muted-foreground mt-1">View details and attendee lists for this event.</p>
        </div>
      </div>

      {/* Main Grid: Details and Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Card: Event Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            {/* Banner image */}
            <div className="h-44 bg-gray-100 relative">
              <img 
                src={event.imageUrl || 'https://images.unsplash.com/photo-1740065592671-9cb593ee9b78?q=80&w=1173'} 
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold text-white uppercase shadow-sm ${
                  event.eventType === 'ONLINE' ? 'bg-purple-600' : 'bg-blue-600'
                }`}>
                  {event.eventType}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-secondary uppercase bg-white/95 shadow-sm">
                  {event.visibility}
                </span>
              </div>
            </div>

            {/* Event Description and details */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-secondary text-xl">{event.name}</h3>
                <p className="text-xs text-muted-foreground font-semibold mt-1">Hosted by {event.organizedBy}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100 text-xs text-muted-foreground">
                <div className="flex items-start space-x-2.5">
                  <Calendar className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-secondary">Date & Time</p>
                    <p className="mt-0.5">{startDate} - {endDate}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-secondary">Location</p>
                    <p className="mt-0.5">{event.place}</p>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground/90 whitespace-pre-line leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Registrations table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-secondary flex items-center space-x-2">
                <span>Registrations</span>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-black">
                  {registrations.length}
                </span>
              </h2>
            </div>
            
            <div className="flex items-center space-x-2 self-start sm:self-center">
              <button
                onClick={exportToCSV}
                disabled={registrations.length === 0}
                className="inline-flex items-center space-x-1.5 px-4 py-2 border border-border bg-white rounded-xl text-secondary hover:text-primary hover:border-primary/20 text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Search Attendee Bar */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/30">
              <div className="relative max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  placeholder="Search attendees by name, email, college..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="appearance-none rounded-xl relative block w-full pl-9 pr-3 py-2 border border-border placeholder-muted-foreground text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-xs bg-white transition-all"
                />
              </div>
            </div>

            {/* Attendees Table */}
            {filteredRegistrations.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="font-medium text-secondary">No registrations found</p>
                <p className="text-sm mt-1">Either no users have registered or your search returned no matches.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                  <thead className="bg-gray-50/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Attendee Info</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">College/Company</th>
                      <th className="px-6 py-4">Graduation</th>
                      <th className="px-6 py-4 text-right">LinkedIn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-secondary">
                    {filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50/20 transition-colors">
                        <td className="px-6 py-4 font-bold">
                          {reg.name}
                        </td>
                        <td className="px-6 py-4 space-y-0.5">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1 text-primary" />
                            <span className="truncate max-w-[150px]">{reg.email}</span>
                          </div>
                          {(reg.countryCode || reg.contactNo) && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1 text-primary" />
                              <span>{reg.countryCode || ''} {reg.contactNo || ''}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {reg.companyOrCollege ? (
                            <div className="flex items-center text-xs">
                              <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              <span>{reg.companyOrCollege}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Not provided</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold">
                          {reg.graduationYear ? (
                            <div className="flex items-center">
                              <GraduationCap className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              <span>{reg.graduationYear}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Not provided</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {reg.linkedInUrl ? (
                            <a
                              href={reg.linkedInUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex p-1.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-600 hover:text-blue-800 rounded-lg transition-colors"
                              title="View LinkedIn Profile"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
