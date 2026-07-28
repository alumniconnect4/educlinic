import { useState, useEffect } from 'react';
import {
  Search,
  HelpCircle,
  ChevronRight,
  User,
  Mail,
  Phone,
  Calendar,
  Check,
  RotateCcw,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';
import axios, { isAxiosError } from 'axios';

interface HelpTicket {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  title: string;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdById: number | null;
  createdBy?: {
    name: string;
    email: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function HelpTickets() {
  const [tickets, setTickets] = useState<HelpTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>(
    'ALL'
  );
  const [selectedTicket, setSelectedTicket] = useState<HelpTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        'http://localhost:4000/api/admin-portal/help-tickets',
        {
          withCredentials: true,
        }
      );
      setTickets(res.data);

      // Update selected ticket in detail view if it's currently open
      if (selectedTicket) {
        const updatedSelected = res.data.find(
          (t: HelpTicket) => t.id === selectedTicket.id
        );
        if (updatedSelected) {
          setSelectedTicket(updatedSelected);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tickets', err);
      toast.error('Failed to load help tickets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (
    id: number,
    newStatus: 'OPEN' | 'RESOLVED'
  ) => {
    try {
      await axios.put(
        `http://localhost:4000/api/admin-portal/help-tickets/${id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      toast.success(
        newStatus === 'RESOLVED'
          ? 'Ticket resolved successfully!'
          : 'Ticket re-opened.'
      );

      // Update list
      setTickets((prevTickets) =>
        prevTickets.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );

      // Update details view
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (err) {
      console.error('Failed to update ticket status', err);
      if (isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || 'Failed to update ticket status.'
        );
      } else {
        toast.error('Failed to update ticket status.');
      }
    }
  };

  // Filter tickets based on search and status filter tabs
  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === 'ALL' || ticket.status === statusFilter;

    const requesterName = ticket.createdBy?.name || ticket.name || 'Guest';
    const requesterEmail = ticket.createdBy?.email || ticket.email || '';

    const matchesSearch =
      requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      requesterEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 text-red-600 border-red-150';
      case 'MEDIUM':
        return 'bg-yellow-50 text-yellow-600 border-yellow-150';
      case 'LOW':
      default:
        return 'bg-blue-50 text-blue-600 border-blue-150';
    }
  };

  // Stats computation
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] p-6 lg:p-8 flex flex-col bg-[#f8fafc] text-slate-800 font-sans lg:overflow-hidden">
      {/* Modern Header block */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center text-xs font-semibold text-gray-500 mb-2 gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
            <span>Help Tickets Directory</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-400 font-normal">
              Manage Support Requests
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-slate-700" />
            <span>User & Guest Support Center</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review and respond to messages submitted from the contact page.
            Toggle ticket resolution status as needed.
          </p>
        </div>
      </div>

      {/* Summary statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Total Tickets Received
          </span>
          <span className="text-lg font-bold text-slate-800 mt-1 block">
            {totalCount}
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Open / Pending Requests
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-bold text-[#84749f]">
              {openCount}
            </span>
            {openCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-100 text-yellow-600 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                <ShieldAlert className="w-3 h-3" />
                <span>Action Needed</span>
              </span>
            )}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Resolved Submissions
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-bold text-emerald-600">
              {resolvedCount}
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
              <CheckCircle2 className="w-3 h-3" />
              <span>Healthy Queue</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Panel Area - List is BIG (flex-1), Details is SMALL sidebar (w-[420px]) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 items-stretch overflow-hidden">
        {/* Left Side: Tickets Queue (Big main list pane) */}
        <div className="flex-1 bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col overflow-hidden">
          {/* Toolbar and filter tabs */}
          <div className="p-4 border-b border-gray-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            {/* Search input - Styled similar to EventRegistrations.tsx but with rounded-full corners */}
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by registrant name, email, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-gray-300 rounded-full focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-750 placeholder-gray-450"
              />
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex rounded-sm bg-slate-100 p-0.5 border border-slate-200 text-xs font-semibold self-start md:self-auto">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setSelectedTicket(null);
                }}
                className={`px-4 py-1.5 rounded-xs transition-colors cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('OPEN');
                  setSelectedTicket(null);
                }}
                className={`px-4 py-1.5 rounded-xs transition-colors cursor-pointer ${
                  statusFilter === 'OPEN'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('RESOLVED');
                  setSelectedTicket(null);
                }}
                className={`px-4 py-1.5 rounded-xs transition-colors cursor-pointer ${
                  statusFilter === 'RESOLVED'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Tickets list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 min-h-0">
            {isLoading ? (
              <div className="py-16 text-center text-gray-400 font-medium">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold text-slate-700">
                    Loading support tickets...
                  </span>
                </div>
              </div>
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map((ticket) => {
                const requesterName =
                  ticket.createdBy?.name || ticket.name || 'Guest';
                const requesterRole = ticket.createdBy?.role || 'Guest';
                const isSelected = selectedTicket?.id === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-5 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-slate-50/80 border-l-4 border-l-slate-700'
                        : 'hover:bg-gray-50/50 hover:border-l-4 hover:border-l-gray-300 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h5 className="text-sm font-semibold text-[#344767] truncate">
                          {ticket.title}
                        </h5>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${getPriorityBadgeClass(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-slate-755">
                            {requesterName}
                          </span>
                          <span className="text-[9px] font-bold px-1 py-0.2 bg-slate-100 text-slate-500 rounded-xs uppercase">
                            {requesterRole}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-mono text-gray-500">
                            {ticket.createdBy?.email || ticket.email}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase ${
                          ticket.status === 'OPEN'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-150'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-gray-400 font-medium">
                <div className="flex flex-col items-center justify-center gap-2">
                  <HelpCircle className="w-8 h-8 text-gray-300 mb-1" />
                  <span className="text-sm font-semibold text-slate-700">
                    No support tickets found
                  </span>
                  <span className="text-xs text-gray-400">
                    {searchQuery
                      ? 'No tickets match your active query.'
                      : 'The support ticket queue is currently empty.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Ticket Details Panel (Small sidebar details inspector - LOCKED height, nested scroll) */}
        <div className="w-full lg:w-[420px] bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col overflow-hidden shrink-0">
          {/* Details Header (Fixed) */}
          <div className="px-6 py-4 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
            <h4 className="text-[#333] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-800" />
              Ticket Details Inspector
            </h4>
            {selectedTicket && (
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 border border-gray-150 rounded-xs">
                ID: #{selectedTicket.id}
              </span>
            )}
          </div>

          {selectedTicket ? (
            <>
              {/* Scrollable Contents Body (Scroll only happens here!) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Header Information */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${
                        selectedTicket.status === 'OPEN'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-150'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                      }`}
                    >
                      {selectedTicket.status}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getPriorityBadgeClass(
                        selectedTicket.priority
                      )}`}
                    >
                      {selectedTicket.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 leading-snug">
                    {selectedTicket.title}
                  </h3>
                </div>

                {/* Submitter details box */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-sm space-y-3 text-xs text-slate-700">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200/50">
                    Requester Metadata
                  </h5>
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-800">
                        {selectedTicket.createdBy?.name ||
                          selectedTicket.name ||
                          'Guest User'}
                      </span>
                      <span className="ml-2 text-[9px] font-bold px-1.5 py-0.2 bg-slate-200/70 text-slate-600 rounded-xs uppercase">
                        {selectedTicket.createdBy?.role || 'GUEST'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span
                      className="text-slate-650 font-mono truncate select-all"
                      title="Click to copy email"
                    >
                      {selectedTicket.createdBy?.email ||
                        selectedTicket.email ||
                        'No Email Address'}
                    </span>
                  </div>
                  {(selectedTicket.phone ||
                    (selectedTicket.createdBy as any)?.phone) && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono">
                        {selectedTicket.phone ||
                          (selectedTicket.createdBy as any)?.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 border-t border-slate-200/50 pt-2.5 mt-1">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-gray-500">
                      Created:{' '}
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Support Message
                  </h5>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm text-sm text-[#344767] whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.description}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer (Fixed at the bottom, never scrolls) */}
              <div className="p-4 border-t border-gray-250 bg-slate-50 shrink-0">
                {selectedTicket.status === 'OPEN' ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(selectedTicket.id, 'RESOLVED')
                    }
                    className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-xs py-3 px-4 rounded-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Mark as Resolved
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateStatus(selectedTicket.id, 'OPEN')
                    }
                    className="w-full bg-white hover:bg-slate-50 border border-gray-300 text-slate-700 font-bold uppercase tracking-wider text-xs py-3 px-4 rounded-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500" />
                    Re-open Ticket
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-6">
              <HelpCircle className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-slate-600">
                No Ticket Selected
              </p>
              <p className="text-xs text-gray-455 mt-1">
                Select a request from the list to inspect details and resolve
                it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
