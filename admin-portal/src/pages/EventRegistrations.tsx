import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Users,
  Mail,
  Phone,
  Building2,
  Calendar,
  ExternalLink,
  Loader2,
  Download,
  AlertCircle,
  FileText,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface RegistrationItem {
  id: number;
  eventId: number;
  userId: number;
  name: string;
  email: string;
  countryCode?: string;
  contactNo?: string;
  companyOrCollege?: string;
  graduationYear?: string;
  linkedInUrl?: string;
  createdAt: string;
  user?: UserRecord;
}

interface UserRecord {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  isVerified?: boolean;
  schoolCategory?: string | null;
  bio?: string | null;
  gender?: string | null;
  socialLink?: string | null;
  idCardUrl?: string | null;
  degreeUrl?: string | null;
  createdAt?: string;
  contactNo?: string | null;
}

const DEFAULT_USER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23cbd5e1'/><circle cx='50' cy='38' r='18' fill='%2364748b'/><path d='M14 88 a36 36 0 0 1 72 0 Z' fill='%2364748b'/></svg>`;

interface EventInfo {
  id: number;
  name: string;
  registrationLimit?: number | null;
  startRegistrationsNow?: boolean;
  eventType: string;
  visibility: string;
}

export default function EventRegistrations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  const verifiedRegistrations = registrations.filter(
    (reg) => reg.user && reg.user.isVerified === true
  );

  const handleUserClick = (user?: UserRecord) => {
    if (!user) {
      toast.error('User details not available');
      return;
    }
    navigate('/users/alumni-students', { state: { viewingUser: user } });
  };

  const executeUnregister = async (regId: number, regName: string) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/events/registrations/${regId}`,
        { withCredentials: true }
      );
      toast.success(`Successfully unregistered ${regName}`);
      fetchRegistrations();
    } catch (err: any) {
      console.error('Error unregistering user:', err);
      toast.error(
        err.response?.data?.message || 'Failed to unregister user from event'
      );
    }
  };

  const handleUnregister = (regId: number, regName: string) => {
    toast(`Unregister "${regName}"?`, {
      description: "This will remove them from this event's registrations.",
      duration: 8000,
      action: {
        label: 'Confirm',
        onClick: () => executeUnregister(regId, regName),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const fetchRegistrations = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await axios.get(
        `http://localhost:4000/api/events/registrations/${id}/${itemsPerPage}/${offset}?search=${encodeURIComponent(searchQuery)}`,
        { withCredentials: true }
      );
      setRegistrations(response.data.registrations || []);
      setTotal(response.data.total || 0);
      if (response.data.event) {
        setEventInfo(response.data.event);
      }
    } catch (err: any) {
      console.error('Error fetching registrations:', err);
      toast.error(
        err.response?.data?.message || 'Failed to load event registrations'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [id, currentPage, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const handleExportCSV = () => {
    if (verifiedRegistrations.length === 0) {
      toast.error('No verified registrations to export');
      return;
    }

    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Organization/College',
      'Graduation Year',
      'LinkedIn URL',
      'Registered On',
    ];

    const rows = verifiedRegistrations.map((reg) => [
      reg.id,
      `"${reg.name.replace(/"/g, '""')}"`,
      `"${reg.email}"`,
      `"${(reg.countryCode || '') + ' ' + (reg.contactNo || '')}"`,
      `"${(reg.companyOrCollege || '').replace(/"/g, '""')}"`,
      `"${reg.graduationYear || ''}"`,
      `"${reg.linkedInUrl || ''}"`,
      `"${new Date(reg.createdAt).toLocaleString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `event_${id}_registrations_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported registrations to CSV');
  };

  const isLimitReached =
    eventInfo?.registrationLimit &&
    eventInfo.registrationLimit > 0 &&
    total >= eventInfo.registrationLimit;

  return (
    <div className="w-full min-h-[calc(100vh-64px)] p-6 lg:p-8 flex flex-col bg-[#f8fafc] text-slate-800 font-sans">
      {/* Admin Portal Style Header */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-5 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/events')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-slate-900 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Events Directory</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-slate-700" />
            <span>
              {eventInfo ? eventInfo.name : `Event Registrations #${id}`}
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review and manage all student and alumni registrations for this
            event.
          </p>
        </div>

        {/* Action Button: Export CSV */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-sm shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Admin Portal Style Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Event Identifier
          </span>
          <span className="text-lg font-bold text-slate-800 mt-1 block font-mono">
            #{id}
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Event Type
          </span>
          <span className="text-lg font-bold text-slate-800 mt-1 block capitalize">
            {eventInfo?.eventType
              ? eventInfo.eventType.toLowerCase()
              : 'General'}
          </span>
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Registration Status
          </span>
          <div className="mt-1.5">
            {isLimitReached ? (
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-sm">
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Closed (Limit Reached)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Open for Registrations</span>
              </span>
            )}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Total Registrations
          </span>
          <span className="text-lg font-bold text-slate-800 mt-1 block">
            {total}{' '}
            {eventInfo?.registrationLimit
              ? `of ${eventInfo.registrationLimit} limit`
              : ''}
          </span>
        </div>
      </div>

      {/* Main Container: Filter Toolbar + Data Table */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm flex-1 flex flex-col overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by registrant name, email, institution, or contact..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-gray-300 rounded-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing{' '}
            <strong className="font-bold text-slate-800">
              {total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </strong>{' '}
            to{' '}
            <strong className="font-bold text-slate-800">
              {Math.min(currentPage * itemsPerPage, total)}
            </strong>{' '}
            of <strong className="font-bold text-slate-900">{total}</strong>{' '}
            entries
          </div>
        </div>

        {/* Clean Light Table matching Admin Portal */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider sticky top-0 z-10">
                <th className="py-3.5 px-6 text-center w-16">S.No</th>
                <th className="py-3.5 px-6 text-left w-[26%]">
                  Registrant Details
                </th>
                <th className="py-3.5 px-6 text-left w-[22%]">
                  Email & Contact No.
                </th>
                <th className="py-3.5 px-6 text-left w-[18%]">
                  Institution / Organization
                </th>
                <th className="py-3.5 px-6 text-center w-[10%]">Grad. Year</th>
                <th className="py-3.5 px-6 text-center w-[10%]">Profile</th>
                <th className="py-3.5 px-6 text-left w-[14%]">Registered On</th>
                <th className="py-3.5 px-6 text-center w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-gray-400 font-medium"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
                      <span className="text-xs font-semibold text-slate-700">
                        Loading registration records...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : verifiedRegistrations.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center text-gray-400 font-medium"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-gray-300 mb-1" />
                      <span className="text-sm font-semibold text-slate-700">
                        No registration records found
                      </span>
                      <span className="text-xs text-gray-400">
                        {searchQuery
                          ? 'No records match your active search criteria.'
                          : 'No users have registered for this event yet.'}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                verifiedRegistrations.map((reg, index) => {
                  const serialNo = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr
                      key={reg.id}
                      className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-6 align-middle text-center font-mono text-xs text-gray-500">
                        {serialNo}
                      </td>
                      <td className="py-3.5 px-6 align-middle">
                        <div className="flex items-center gap-3">
                          <img
                            src={reg.user?.avatarUrl || DEFAULT_USER_AVATAR}
                            alt={reg.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-xs shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                            onClick={() => handleUserClick(reg.user)}
                            title="Click to view complete user details"
                          />
                          <div>
                            <button
                              type="button"
                              onClick={() => handleUserClick(reg.user)}
                              className="font-semibold text-[#344767] text-sm hover:text-blue-600 hover:underline text-left cursor-pointer block leading-tight"
                              title="Click to view complete user details"
                            >
                              {reg.name}
                            </button>
                            <div className="text-xs text-gray-400 font-normal">
                              ID: #{reg.userId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 align-middle">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{reg.email}</span>
                          </div>
                          {reg.countryCode || reg.contactNo ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>
                                {reg.countryCode ? `${reg.countryCode} ` : ''}
                                {reg.contactNo}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 align-middle text-slate-700">
                        {reg.companyOrCollege ? (
                          <div className="flex items-center gap-1.5 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{reg.companyOrCollege}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">
                            Not specified
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 align-middle text-center font-medium text-slate-700 font-mono">
                        {reg.graduationYear || (
                          <span className="text-gray-400 text-xs font-normal italic">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 align-middle text-center">
                        {reg.linkedInUrl ? (
                          <a
                            href={
                              reg.linkedInUrl.startsWith('http')
                                ? reg.linkedInUrl
                                : `https://${reg.linkedInUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>LinkedIn</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs italic">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 align-middle text-xs text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>
                            {new Date(reg.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => handleUnregister(reg.id, reg.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 transition-colors cursor-pointer"
                          title="Unregister user from this event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Unregister</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar matching Admin Portal */}
        {total > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0 text-xs text-gray-600 flex-wrap gap-3">
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
              entries
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-sm border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1.5 rounded-sm border text-xs font-bold transition-colors cursor-pointer ${
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
                className="px-3 py-1.5 rounded-sm border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
