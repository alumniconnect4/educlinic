import { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  User,
  Phone,
  Calendar,
  Inbox,
  MessageSquare,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface HelpTicket {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  title: string;
  description: string;
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
  const [selectedTicket, setSelectedTicket] = useState<HelpTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states (Server-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 5;

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `http://localhost:4000/api/admin-portal/help-tickets?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(
          searchQuery
        )}`,
        { withCredentials: true }
      );

      const items = res.data.data || [];
      setTickets(items);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);

      if (items.length > 0) {
        setSelectedTicket((prev) => {
          if (!prev) return items[0];
          const exists = items.find((t: HelpTicket) => t.id === prev.id);
          return exists || items[0];
        });
      } else {
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error('Failed to fetch contact messages', err);
      toast.error('Failed to load contact messages.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets();
    }, 250);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery]);

  const startItem = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] p-6 lg:p-8 flex flex-col bg-[#f8fafc] text-slate-800 font-sans lg:overflow-hidden">
      {/* Header block */}
      <div className="bg-white border border-gray-200 shadow-xs rounded-sm p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center text-xs font-semibold text-gray-500 mb-1.5 gap-1">
            <Inbox className="w-3.5 h-3.5 text-gray-400" />
            <span>Support & Inquiries</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-400 font-normal">Contact Messages</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-slate-700" />
            <span>Contact Us Submissions</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            View messages submitted by visitors and users from the Contact Us page.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-sm text-right shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Messages Received
          </span>
          <span className="text-xl font-bold text-slate-900">{total}</span>
        </div>
      </div>

      {/* Main Split Panel Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 items-stretch overflow-hidden">
        {/* Left Side: Messages List with Server-Side Pagination */}
        <div className="flex-1 bg-white border border-gray-200 rounded-sm shadow-xs flex flex-col overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between gap-4 shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or message..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-9 pr-4 text-sm bg-white border border-gray-300 rounded-full focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-800 placeholder-gray-400"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium hidden sm:inline-block">
              Showing {startItem} - {endItem} of {total}
            </span>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 min-h-0">
            {isLoading ? (
              <div className="py-20 text-center text-gray-400 font-medium">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold text-slate-700">
                    Loading messages...
                  </span>
                </div>
              </div>
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => {
                const requesterName =
                  ticket.createdBy?.name || ticket.name || 'Guest User';
                const requesterEmail =
                  ticket.createdBy?.email || ticket.email || '';
                const isSelected = selectedTicket?.id === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 sm:p-5 cursor-pointer transition-all flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-slate-50 border-l-4 border-l-slate-900 shadow-2xs'
                        : 'hover:bg-gray-50/80 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <h5 className="text-sm font-bold text-slate-900 truncate">
                        {ticket.title}
                      </h5>
                      <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap shrink-0">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-gray-400 flex-wrap pt-1">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <span>{requesterName}</span>
                      </span>
                      {requesterEmail && (
                        <span className="flex items-center gap-1.5 font-mono text-gray-500">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{requesterEmail}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center text-gray-400 font-medium">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Inbox className="w-8 h-8 text-gray-300 mb-1" />
                  <span className="text-sm font-semibold text-slate-700">
                    No contact messages found
                  </span>
                  <span className="text-xs text-gray-400">
                    {searchQuery
                      ? 'No messages match your search query.'
                      : 'No messages have been submitted yet.'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Server-Side Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-between gap-4 shrink-0 text-xs">
              <span className="text-gray-500 font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer font-medium"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCurrentPage(num)}
                      className={`px-3 py-1.5 rounded border text-xs font-semibold transition-colors cursor-pointer ${
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
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className="px-3 py-1.5 rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Message Inspector Pane */}
        <div className="w-full lg:w-[420px] bg-white border border-gray-200 rounded-sm shadow-xs flex flex-col overflow-hidden shrink-0">
          <div className="px-5 py-4 border-b border-gray-200 bg-white shrink-0 flex items-center justify-between">
            <h4 className="text-slate-800 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-700" />
              Message Inspector
            </h4>
            {selectedTicket && (
              <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2.5 py-0.5 border border-gray-200 rounded-xs">
                #{selectedTicket.id}
              </span>
            )}
          </div>

          {selectedTicket ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Subject / Topic
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedTicket.title}
                </h3>
              </div>

              {/* Sender Info Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-sm space-y-3 text-xs text-slate-700">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200">
                  Sender Details
                </h5>
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-bold text-slate-800">
                    {selectedTicket.createdBy?.name ||
                      selectedTicket.name ||
                      'Guest User'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-600 truncate select-all">
                    {selectedTicket.createdBy?.email ||
                      selectedTicket.email ||
                      'No Email'}
                  </span>
                </div>
                {selectedTicket.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-600">
                      {selectedTicket.phone}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 border-t border-slate-200 pt-2.5 mt-1">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-gray-500">
                    Received:{' '}
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Message Content
                </h5>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-sm text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Reply via email link */}
              {(selectedTicket.email || selectedTicket.createdBy?.email) && (
                <div className="pt-2">
                  <a
                    href={`mailto:${
                      selectedTicket.email || selectedTicket.createdBy?.email
                    }?subject=Re: ${encodeURIComponent(selectedTicket.title)}`}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs py-2.5 px-4 rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-6">
              <Inbox className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-slate-600">
                No Message Selected
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Select a message from the list to view its full details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
