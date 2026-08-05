import { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  GraduationCap,
  Check,
  X,
  ShieldCheck,
  Eye,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import axios, { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ALUMNI' | 'ADMIN' | 'SUPER_ADMIN';
  schoolCategory?: string;
  avatarUrl?: string;
  idCardUrl?: string;
  degreeUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

const DEFAULT_USER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23cbd5e1'/><circle cx='50' cy='38' r='18' fill='%2364748b'/><path d='M14 88 a36 36 0 0 1 72 0 Z' fill='%2364748b'/></svg>`;

export default function PendingRequestsPage() {
  const [pendingRequests, setPendingRequests] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ALUMNI'>(
    'ALL'
  );
  const [selectedRequest, setSelectedRequest] = useState<UserRecord | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingRequests = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.get(
        `${apiUrl}/admin-portal/pending-requests?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}&role=${roleFilter}`,
        { withCredentials: true }
      );
      setPendingRequests(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch pending requests', err);
    }
  };

  useEffect(() => {
    let ignore = false;
    const timer = setTimeout(() => {
      const apiUrl = import.meta.env.VITE_API_URL;
      axios
        .get(
          `${apiUrl}/admin-portal/pending-requests?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}&role=${roleFilter}`,
          { withCredentials: true }
        )
        .then((res) => {
          if (!ignore) {
            setPendingRequests(res.data.data);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
          }
        })
        .catch((err) => console.error('Failed to fetch pending requests', err))
        .finally(() => {
          if (!ignore) setIsLoading(false);
        });
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [searchQuery, currentPage, roleFilter]);

  const handleApprove = async (id: number, name: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.put(
        `${apiUrl}/admin-portal/pending-requests/${id}/approve`,
        {},
        { withCredentials: true }
      );
      toast.success(`Request for "${name}" approved.`);
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
      fetchPendingRequests();
    } catch (err: unknown) {
      console.error('Failed to approve request', err);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to approve request');
      } else {
        toast.error('Failed to approve request');
      }
    }
  };

  const handleDecline = async (id: number, name: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.delete(
        `${apiUrl}/admin-portal/pending-requests/${id}/decline`,
        { withCredentials: true }
      );
      toast.success(`Request for "${name}" declined.`);
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
      fetchPendingRequests();
    } catch (err: unknown) {
      console.error('Failed to decline request', err);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to decline request');
      } else {
        toast.error('Failed to decline request');
      }
    }
  };

  const formatSchool = (school?: string) => {
    if (!school) return 'General / Unassigned';
    return school.replace(/_/g, ' ');
  };

  return (
    <div className="w-full h-[calc(100vh-112px)] flex flex-col gap-4 overflow-hidden">
      {/* Top Banner Bar */}
      <div className="bg-white border border-gray-200 shadow-2xs rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/users/alumni-students"
            className="p-2 border border-gray-200 hover:border-slate-300 rounded-sm bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
            title="Back to Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-700" />
              Pending Registration Requests
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and approve or decline account registration requests.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-1 rounded-sm">
            {total} Total Pending
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-200 shadow-2xs rounded-sm flex flex-col flex-1 overflow-hidden">
        {/* Header Controls */}
        <div className="px-6 py-4 border-b border-gray-200 shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-[#333] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-800" />
              Requests Queue
            </h3>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {total} Total
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Role Filter Tabs */}
            <div className="inline-flex rounded-sm bg-slate-100 p-0.5 border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => {
                  setRoleFilter('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-xs transition-colors ${roleFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setRoleFilter('USER');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-xs transition-colors ${roleFilter === 'USER' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Students
              </button>
              <button
                onClick={() => {
                  setRoleFilter('ALUMNI');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-xs transition-colors ${roleFilter === 'ALUMNI' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Alumni
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 h-8 border border-gray-300 rounded-sm text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors bg-white"
                placeholder="Search name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider sticky top-0 z-10">
                <th className="py-3.5 px-6 text-left w-[25%]">Applicant</th>
                <th className="py-3.5 px-6 text-left w-[25%]">Email</th>
                <th className="py-3.5 px-6 text-center w-[22%]">School</th>
                <th className="py-3.5 px-6 text-center w-[10%]">Type</th>
                <th className="py-3.5 px-6 text-center w-[18%]">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-10 text-center text-gray-400 font-medium"
                  >
                    Loading pending requests...
                  </td>
                </tr>
              ) : pendingRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-10 text-center text-gray-400 font-medium"
                  >
                    No pending registration requests found.
                  </td>
                </tr>
              ) : (
                pendingRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-6 align-middle">
                      <div className="flex items-center">
                        <img
                          src={req.avatarUrl || DEFAULT_USER_AVATAR}
                          alt={req.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-2xs mr-3 flex-shrink-0 bg-slate-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              DEFAULT_USER_AVATAR;
                          }}
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block leading-tight">
                            {req.name}
                          </span>
                          <span className="text-xs text-gray-400 font-normal">
                            ID: {req.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 align-middle font-normal text-gray-600">
                      {req.email}
                    </td>
                    <td className="py-3.5 px-6 align-middle text-center text-xs font-medium text-gray-600">
                      <div className="flex justify-center">
                        {req.schoolCategory ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                            {formatSchool(req.schoolCategory)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 align-middle text-center">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold border ${
                            req.role === 'ALUMNI'
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {req.role === 'ALUMNI' ? 'Alumni' : 'Student'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 align-middle text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          title="View Details"
                          className="px-2.5 py-1 border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-sm text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600 inline mr-1" />
                          Details
                        </button>
                        <button
                          onClick={() => handleDecline(req.id, req.name)}
                          className="px-2.5 py-1 border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-sm text-xs font-semibold transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-slate-600 inline mr-1" />
                          Decline
                        </button>
                        <button
                          onClick={() => handleApprove(req.id, req.name)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-sm text-xs font-bold transition-colors shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5 text-white inline mr-1" />
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 shrink-0 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            Showing{' '}
            <span className="font-bold text-gray-700">
              {total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-gray-700">
              {Math.min(currentPage * itemsPerPage, total)}
            </span>{' '}
            of <span className="font-bold text-gray-700">{total}</span> pending
            requests
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 text-xs font-semibold border border-gray-300 rounded-sm bg-white hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3 text-xs font-semibold border border-gray-300 rounded-sm bg-white hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Minimal Applicant Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-sm border border-gray-200 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-700" />
                Applicant Details
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 font-bold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-sm bg-slate-50 border border-slate-200">
                <img
                  src={selectedRequest.avatarUrl || DEFAULT_USER_AVATAR}
                  alt={selectedRequest.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 bg-white shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_USER_AVATAR;
                  }}
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {selectedRequest.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {selectedRequest.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-gray-50 rounded border border-gray-200 space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">
                    Applied Role
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedRequest.role === 'ALUMNI' ? 'Alumni' : 'Student'}
                  </span>
                </div>

                <div className="p-2.5 bg-gray-50 rounded border border-gray-200 space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">
                    School
                  </span>
                  <span className="font-semibold text-slate-800">
                    {formatSchool(selectedRequest.schoolCategory)}
                  </span>
                </div>

                <div className="p-2.5 bg-gray-50 rounded border border-gray-200 space-y-1 col-span-2">
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">
                    Submitted On
                  </span>
                  <span className="font-semibold text-slate-800">
                    {new Date(selectedRequest.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </span>
                </div>
              </div>

              {/* Uploaded Verification Documents */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Verification Documents
                </span>

                <div className="grid grid-cols-2 gap-3">
                  {/* ID Card Document */}
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      ID Card
                    </span>
                    {selectedRequest.idCardUrl ? (
                      <div className="w-full space-y-2">
                        <img
                          src={selectedRequest.idCardUrl}
                          alt="ID Card"
                          className="w-full h-24 object-cover rounded border border-gray-300 bg-white"
                        />
                        <a
                          href={selectedRequest.idCardUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-slate-700 hover:text-slate-900 underline block"
                        >
                          View Full Image ↗
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic py-4">
                        Not Attached
                      </span>
                    )}
                  </div>

                  {/* Degree Certificate Document */}
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Degree Certificate
                    </span>
                    {selectedRequest.degreeUrl ? (
                      <div className="w-full space-y-2">
                        <img
                          src={selectedRequest.degreeUrl}
                          alt="Degree Certificate"
                          className="w-full h-24 object-cover rounded border border-gray-300 bg-white"
                        />
                        <a
                          href={selectedRequest.degreeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-slate-700 hover:text-slate-900 underline block"
                        >
                          View Full Image ↗
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic py-4">
                        Not Attached
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() =>
                    handleDecline(selectedRequest.id, selectedRequest.name)
                  }
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-sm text-xs font-semibold transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() =>
                    handleApprove(selectedRequest.id, selectedRequest.name)
                  }
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-sm text-xs font-bold transition-colors shadow-2xs"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
