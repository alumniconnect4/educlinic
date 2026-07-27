import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Calendar, 
  Users, 
  Clock, 
  PlusCircle, 
  ChevronRight, 
  Loader2,
  CalendarCheck,
  MapPin
} from 'lucide-react';

interface Event {
  id: number;
  name: string;
  organizedBy: string;
  place: string;
  eventType: 'ONLINE' | 'OFFLINE';
  visibility: 'GLOBAL' | 'DEPARTMENTAL';
  startDate: string;
  endDate: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    past: 0
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        // Fetch upcoming
        const upcomingRes = await apiRequest<{ events: Event[], total: number }>(`/events/all-events/100/0?filter=upcoming&createdById=${user.id}`);
        // Fetch past
        const pastRes = await apiRequest<{ events: Event[], total: number }>(`/events/all-events/100/0?filter=past&createdById=${user.id}`);
        
        const upcomingCount = upcomingRes.total;
        const pastCount = pastRes.total;
        const totalCount = upcomingCount + pastCount;

        setStats({
          total: totalCount,
          upcoming: upcomingCount,
          past: pastCount
        });

        // Combine and take recent ones (up to 5 upcoming first, or just upcoming)
        setRecentEvents(upcomingRes.events.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-secondary tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Monitor your events and registrations here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Events - Navy Hero Gradient with subtle mesh red glow */}
        <div className="p-6 bg-gradient-to-br from-[#182236] to-[#0f1624] rounded-3xl flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:shadow-[#182236]/10 hover:scale-[1.01] text-white relative overflow-hidden border border-white/5 shadow-xs">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-[#a62025]/20 to-transparent blur-md" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Events</p>
            <h3 className="text-4xl font-extrabold mt-2 leading-none">{stats.total}</h3>
            <p className="text-[10px] text-gray-450 mt-2.5 font-medium">All-time creations</p>
          </div>
          <div className="relative z-10 p-3.5 rounded-2xl bg-white/10 text-white backdrop-blur-xs border border-white/5 shadow-inner">
            <Calendar className="h-6 w-6" />
          </div>
        </div>

        {/* Upcoming Events - Crimson Active Tab with live pulsing dot */}
        <div className="p-6 bg-gradient-to-br from-white to-[#a62025]/1 rounded-3xl border-y border-r border-gray-100 border-l-4 border-l-[#a62025] shadow-xs flex items-center justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upcoming Events</p>
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-450 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
              </span>
            </div>
            <h3 className="text-4xl font-extrabold text-secondary mt-2 leading-none">{stats.upcoming}</h3>
            <p className="text-[10px] text-emerald-600 mt-2.5 font-bold">Scheduled & active</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100/50 text-[#a62025] shadow-xs">
            <CalendarCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Past Events - Slate Static Card with light warm gradient */}
        <div className="p-6 bg-gradient-to-br from-white to-gray-50/50 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.01]">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Past Events</p>
            <h3 className="text-4xl font-extrabold text-secondary mt-2 leading-none">{stats.past}</h3>
            <p className="text-[10px] text-gray-500 mt-2.5 font-medium">Completed history</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/50 text-gray-500 shadow-xs">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Actions and Recent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-secondary">Quick Tasks</h2>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <Link
              to="/events/new"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-red-50/20 hover:border-red-100/50 hover:scale-[1.01] group transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                  <PlusCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-secondary text-sm">Create New Event</p>
                  <p className="text-xs text-muted-foreground">Launch a new online/offline event</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors animate-in" />
            </Link>

            <Link
              to="/events"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-red-50/20 hover:border-red-100/50 hover:scale-[1.01] group transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors duration-200">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-secondary text-sm">Manage Events</p>
                  <p className="text-xs text-muted-foreground">View, edit, or delete existing events</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-colors" />
            </Link>

            <Link
              to="/profile"
              className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-red-50/20 hover:border-red-100/50 hover:scale-[1.01] group transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gray-200/50 text-gray-600 group-hover:bg-gray-700 group-hover:text-white transition-colors duration-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-secondary text-sm">View Profile</p>
                  <p className="text-xs text-muted-foreground">Check and update bio/social details</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-gray-700 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Right: Recent Upcoming Events */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-secondary">Upcoming Scheduled Events</h2>
            <Link to="/events" className="text-xs font-bold text-[#a62025] hover:text-[#801619] bg-red-50 hover:bg-red-100/70 border border-red-100/50 px-3.5 py-1.5 rounded-xl flex items-center transition-all">
              View all <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {recentEvents.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="font-bold text-secondary text-sm">No upcoming events scheduled</p>
                <p className="text-xs mt-1">Get started by creating your first event!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentEvents.map((event) => (
                  <div key={event.id} className="p-5 hover:bg-gray-50/30 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-center min-w-0">
                      {/* Interactive Calendar Date block */}
                      <div className="flex flex-col items-center justify-center min-w-[56px] h-14 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden shrink-0 mr-4 shadow-xs">
                        <div className="w-full text-center bg-[#a62025] text-[9px] font-black uppercase text-white py-0.5 tracking-wider">
                          {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                        </div>
                        <div className="text-lg font-black text-secondary leading-none py-1.5">
                          {new Date(event.startDate).getDate()}
                        </div>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <h4 className="font-bold text-secondary hover:text-primary transition-colors truncate text-sm sm:text-base">
                          <Link to={`/events/${event.id}`}>{event.name}</Link>
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center truncate">
                          <span className="font-semibold text-gray-500 mr-2 shrink-0">{event.organizedBy}</span>
                          <span className="text-gray-300">•</span>
                          <MapPin className="h-3.5 w-3.5 text-gray-400 mx-1.5 shrink-0" />
                          <span className="truncate">{event.place}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold border ${
                          event.eventType === 'ONLINE' 
                            ? 'bg-purple-50 text-purple-700 border-purple-100/50' 
                            : 'bg-blue-50 text-blue-700 border-blue-100/50'
                        }`}>
                          {event.eventType}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          {new Date(event.startDate).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                      <Link
                        to={`/events/${event.id}`}
                        className="p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-primary/10 hover:border-primary/20 hover:text-primary text-secondary transition-all"
                      >
                        <ChevronRight className="h-4.5 w-4.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
