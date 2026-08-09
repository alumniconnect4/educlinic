import { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Users,
  ShieldCheck,
  GraduationCap,
  Pencil,
  Trash2,
  X,
  Upload,
  Eye,
  Mail,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import axios, { isAxiosError } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Skeleton } from '@/components/ui/Skeleton';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  schoolCategory?: string;
  avatarUrl?: string;
  bio?: string;
  gender?: string;
  socialLink?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

const DEFAULT_USER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23cbd5e1'/><circle cx='50' cy='38' r='18' fill='%2364748b'/><path d='M14 88 a36 36 0 0 1 72 0 Z' fill='%2364748b'/></svg>`;

const SCHOOL_OPTIONS = [
  { label: 'Select School (Optional)', value: '' },
  { label: 'School of Engineering', value: 'School_of_Engineering' },
  { label: 'School of Sciences', value: 'School_of_Sciences' },
  { label: 'School of Agriculture', value: 'School_of_Agriculture' },
  { label: 'School of Business Studies', value: 'School_of_Business_Studies' },
  {
    label: 'School of Computer Applications',
    value: 'School_of_Computer_Applications',
  },
  { label: 'School of Humanities', value: 'School_of_Humanities' },
  { label: 'School of Education', value: 'School_of_Education' },
  { label: 'School of Law', value: 'School_of_Law' },
  { label: 'School of Pharmacy', value: 'School_of_Pharmacy' },
];

export default function ManageAdmins() {
  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // View Admin Modal & Zoom State
  const [viewingAdmin, setViewingAdmin] = useState<AdminUser | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
    schoolCategory: '',
    avatarUrl: '',
  });

  // Edit Modal state
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
    schoolCategory: '',
    avatarUrl: '',
    bio: '',
    gender: '',
    socialLink: '',
    isVerified: true,
  });

  const fetchAdmins = async () => {
    setIsTableLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${apiUrl}/admin-portal/admins?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`,
        { withCredentials: true }
      );
      setAdmins(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch admins', err);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdmins();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, currentPage]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isEdit: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image file size should be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isEdit) {
        setEditFormData((prev) => ({ ...prev, avatarUrl: base64String }));
      } else {
        setFormData((prev) => ({ ...prev, avatarUrl: base64String }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.avatarUrl) {
      toast.error('Profile avatar image is compulsory!');
      return;
    }
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.post(`${apiUrl}/admin-portal/admins`, formData, {
        withCredentials: true,
      });
      toast.success('Admin created successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'ADMIN',
        schoolCategory: '',
        avatarUrl: '',
      });
      fetchAdmins();
    } catch (err: unknown) {
      console.error('Failed to create admin', err);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to create admin');
      } else {
        toast.error('Failed to create admin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      schoolCategory: admin.schoolCategory || '',
      avatarUrl: admin.avatarUrl || '',
      bio: admin.bio || '',
      gender: admin.gender || '',
      socialLink: admin.socialLink || '',
      isVerified: admin.isVerified !== false, // default true for admins
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setIsUpdating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.put(
        `${apiUrl}/admin-portal/admins/${editingAdmin.id}`,
        editFormData,
        { withCredentials: true }
      );
      toast.success('Admin updated successfully!');
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err: unknown) {
      console.error('Failed to update admin', err);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to update admin');
      } else {
        toast.error('Failed to update admin');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const executeDelete = async (adminId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.delete(`${apiUrl}/admin-portal/admins/${adminId}`, {
        withCredentials: true,
      });
      toast.success('Admin deleted successfully!');
      fetchAdmins();
    } catch (err: unknown) {
      console.error('Failed to delete admin', err);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to delete admin');
      } else {
        toast.error('Failed to delete admin');
      }
    }
  };

  const handleDelete = (admin: AdminUser) => {
    toast(`Delete admin "${admin.name}"?`, {
      description: 'This action cannot be undone.',
      duration: 8000,
      action: {
        label: 'Confirm',
        onClick: () => executeDelete(admin.id),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const formatSchool = (school?: string) => {
    if (!school) return 'General / Unassigned';
    return school.replace(/_/g, ' ');
  };

  return (
    <div className="w-full xl:h-[calc(100vh-112px)] min-h-0 xl:min-h-[580px] grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6 relative">
      {/* Create Admin Form */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm flex flex-col xl:h-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 shrink-0">
          <h3 className="text-[#333] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-slate-800" />
            New Admin
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 font-normal">
            Register a new administrator account
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Full Name
              </label>
              <input
                required
                placeholder="e.g. John Doe"
                className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Email Address
              </label>
              <input
                required
                type="email"
                placeholder="admin@example.com"
                className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Profile Avatar{' '}
                <span className="text-red-500">* Compulsory</span>
              </label>
              <div className="flex items-center gap-3 bg-gray-50/60 p-2.5 rounded-sm border border-gray-200">
                <img
                  src={formData.avatarUrl || DEFAULT_USER_AVATAR}
                  alt="Avatar Preview"
                  className="w-11 h-11 rounded-full object-cover border border-gray-300 shadow-xs bg-white shrink-0"
                />
                <div className="flex-1 flex flex-col gap-1">
                  <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors w-fit shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, false)}
                    />
                  </label>
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, avatarUrl: '' })
                      }
                      className="text-[11px] text-red-500 hover:text-red-700 font-medium text-left cursor-pointer"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Temporary Password
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Role Access
              </label>
              <select
                required
                className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="ADMIN">Administrator</option>
                <option value="SUPER_ADMIN">Super Administrator</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                School Category
              </label>
              <select
                className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                value={formData.schoolCategory}
                onChange={(e) =>
                  setFormData({ ...formData, schoolCategory: e.target.value })
                }
              >
                {SCHOOL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Administrator'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Admin Directory */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm flex flex-col h-full overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[#333] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-800" />
              Directory
            </h3>
            <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">
              {total} Admins
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 h-9 border border-gray-300 rounded-sm text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors bg-white"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider sticky top-0 z-10">
                <th className="py-3.5 px-6 text-left w-[26%]">Identity</th>
                <th className="py-3.5 px-6 text-left w-[30%]">Contact</th>
                <th className="py-3.5 px-6 text-center w-[24%]">School</th>
                <th className="py-3.5 px-6 text-center w-[12%]">Role</th>
                <th className="py-3.5 px-6 text-center w-[8%]">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {isTableLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="py-3.5 px-6">
                      <Skeleton className="h-4 w-28 mx-auto" />
                    </td>
                    <td className="py-3.5 px-6">
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </td>
                    <td className="py-3.5 px-6">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : admins.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-gray-400 font-medium"
                  >
                    No administrators found.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-6 align-middle">
                      <div
                        className="flex items-center cursor-pointer group"
                        onClick={() => setViewingAdmin(admin)}
                        title="Click to view complete admin details"
                      >
                        <img
                          src={admin.avatarUrl || DEFAULT_USER_AVATAR}
                          alt={admin.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-xs mr-3 flex-shrink-0 bg-slate-100 group-hover:border-blue-400 transition-colors"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              DEFAULT_USER_AVATAR;
                          }}
                        />
                        <div>
                          <span className="font-semibold text-[#344767] block leading-tight group-hover:text-blue-600 group-hover:underline transition-colors">
                            {admin.name}
                          </span>
                          <span className="text-xs text-gray-400 font-normal">
                            ID: {admin.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 align-middle font-normal text-gray-600">
                      {admin.email}
                    </td>
                    <td className="py-3.5 px-6 align-middle text-center text-xs font-medium text-gray-600">
                      <div className="flex justify-center">
                        {admin.schoolCategory ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                            {formatSchool(admin.schoolCategory)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Global</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 align-middle text-center">
                      <div className="flex justify-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold border ${
                            admin.role === 'SUPER_ADMIN'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {admin.role === 'SUPER_ADMIN' && (
                            <ShieldCheck className="w-3 h-3 mr-1" />
                          )}
                          {admin.role === 'SUPER_ADMIN'
                            ? 'Super Admin'
                            : 'Admin'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 align-middle text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="View Admin Details"
                          onClick={() => setViewingAdmin(admin)}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          title="Edit Admin"
                          onClick={() => handleOpenEdit(admin)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete Admin"
                          onClick={() => handleDelete(admin)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
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
            of <span className="font-bold text-gray-700">{total}</span> admins
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 text-xs font-semibold border border-gray-300 rounded-sm bg-white hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3 text-xs font-semibold border border-gray-300 rounded-sm bg-white hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Admin Details Modal */}
      {viewingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg border border-gray-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-800 rounded-md">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Admin Profile Details
                  </h3>
                  <p className="text-[11px] text-slate-400 font-normal">
                    ID #{viewingAdmin.id} • Administrator Account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingAdmin(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 bg-slate-50/50">
              {/* Header Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row items-center gap-5">
                <div className="relative group shrink-0">
                  <img
                    src={viewingAdmin.avatarUrl || DEFAULT_USER_AVATAR}
                    alt={viewingAdmin.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 shadow-sm bg-slate-100 cursor-pointer"
                    onClick={() =>
                      viewingAdmin.avatarUrl &&
                      setPreviewImageModal({
                        url: viewingAdmin.avatarUrl,
                        title: `${viewingAdmin.name}'s Avatar`,
                      })
                    }
                  />
                  {viewingAdmin.avatarUrl && (
                    <button
                      onClick={() =>
                        setPreviewImageModal({
                          url: viewingAdmin.avatarUrl!,
                          title: `${viewingAdmin.name}'s Avatar`,
                        })
                      }
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-blue-300" />
                    </button>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-lg font-bold text-slate-900">
                      {viewingAdmin.name}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        viewingAdmin.role === 'SUPER_ADMIN'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {viewingAdmin.role === 'SUPER_ADMIN' && (
                        <ShieldCheck className="w-3 h-3 mr-1" />
                      )}
                      {viewingAdmin.role === 'SUPER_ADMIN'
                        ? 'Super Admin'
                        : 'Admin'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a
                      href={`mailto:${viewingAdmin.email}`}
                      className="hover:underline hover:text-slate-800"
                    >
                      {viewingAdmin.email}
                    </a>
                  </p>

                  <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                    {viewingAdmin.schoolCategory ? (
                      <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                        {formatSchool(viewingAdmin.schoolCategory)}
                      </span>
                    ) : (
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] font-semibold">
                        Global Access
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Grid Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-gray-100 pb-2">
                  System Credentials & Access
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                      Full Name
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {viewingAdmin.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                      Email Address
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {viewingAdmin.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                      Role Access Level
                    </span>
                    <span className="font-semibold text-slate-800">
                      {viewingAdmin.role === 'SUPER_ADMIN'
                        ? 'Super Administrator'
                        : 'Administrator'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                      School Assigned
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatSchool(viewingAdmin.schoolCategory)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                      Created Date
                    </span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(viewingAdmin.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                      Gender
                    </span>
                    <span className="font-semibold text-slate-800">
                      {viewingAdmin.gender || 'Not specified'}
                    </span>
                  </div>
                  {viewingAdmin.bio && (
                    <div className="sm:col-span-2">
                      <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                        Bio
                      </span>
                      <p className="text-slate-700 bg-gray-50 p-2.5 rounded border border-gray-100 font-normal">
                        {viewingAdmin.bio}
                      </p>
                    </div>
                  )}
                  {viewingAdmin.socialLink && (
                    <div className="sm:col-span-2">
                      <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                        Social Profile
                      </span>
                      <a
                        href={viewingAdmin.socialLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        {viewingAdmin.socialLink}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = viewingAdmin;
                  setViewingAdmin(null);
                  handleOpenEdit(target);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-gray-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Admin
              </button>
              <button
                type="button"
                onClick={() => setViewingAdmin(null)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImageModal(null)}
        >
          <div
            className="bg-white rounded-lg max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh] border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                {previewImageModal.title}
              </h4>
              <button
                onClick={() => setPreviewImageModal(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-950 overflow-auto flex-1">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.title}
                className="max-h-[65vh] max-w-full object-contain rounded shadow-lg"
              />
            </div>
            <div className="px-4 py-2.5 border-t border-gray-200 flex justify-end bg-gray-50">
              <button
                onClick={() => setPreviewImageModal(null)}
                className="px-3 py-1 text-xs font-bold bg-slate-800 text-white rounded hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-sm border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Update Administrator
                </h3>
              </div>
              <button
                onClick={() => setEditingAdmin(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateSubmit}
              className="p-6 overflow-y-auto custom-scrollbar space-y-4 flex-1"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Profile Avatar
                </label>
                <div className="flex items-center gap-3 bg-gray-50/60 p-2.5 rounded-sm border border-gray-200">
                  <img
                    src={editFormData.avatarUrl || DEFAULT_USER_AVATAR}
                    alt="Avatar Preview"
                    className="w-11 h-11 rounded-full object-cover border border-gray-300 shadow-xs bg-white shrink-0"
                  />
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-sm text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors w-fit shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, true)}
                      />
                    </label>
                    {editFormData.avatarUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImageModal({
                              url: editFormData.avatarUrl,
                              title: 'Avatar Preview',
                            })
                          }
                          className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditFormData({ ...editFormData, avatarUrl: '' })
                          }
                          className="text-[11px] text-red-500 hover:text-red-700 font-medium text-left cursor-pointer"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Role Access
                  </label>
                  <select
                    required
                    className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value })
                    }
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="SUPER_ADMIN">Super Administrator</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    School Category
                  </label>
                  <select
                    className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                    value={editFormData.schoolCategory}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        schoolCategory: e.target.value,
                      })
                    }
                  >
                    {SCHOOL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                    value={editFormData.gender}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        gender: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Social Profile URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                    value={editFormData.socialLink}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        socialLink: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Bio / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter admin bio or notes..."
                  className="w-full p-2.5 rounded-md border border-gray-300 bg-white text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none resize-none"
                  value={editFormData.bio}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, bio: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="•••••••• (leave blank to keep current)"
                  className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              {/* isVerified toggle — SUPER_ADMIN only */}
              {isSuperAdmin && (
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Verification Status
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-sm px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {editFormData.isVerified
                          ? 'Verified Account'
                          : 'Unverified Account'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {editFormData.isVerified
                          ? 'Admin appears in analytics & has full access'
                          : 'Admin is hidden from analytics & reports'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditFormData({
                          ...editFormData,
                          isVerified: !editFormData.isVerified,
                        })
                      }
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        editFormData.isVerified ? 'bg-green-500' : 'bg-red-400'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                          editFormData.isVerified
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  {!editFormData.isVerified && (
                    <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-sm">
                      ⚠ Marking an admin as unverified will exclude them from
                      all dashboard analytics.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 h-9 border border-gray-300 rounded-sm text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
