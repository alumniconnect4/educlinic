import { useState, useEffect } from 'react';
import {
  Search,
  UserPlus,
  Users,
  GraduationCap,
  Pencil,
  Trash2,
  Upload,
  Clock,
  Eye,
  X,
  Mail,
  ShieldCheck,
  FileText,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import axios, { isAxiosError } from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ALUMNI' | 'ADMIN' | 'SUPER_ADMIN';
  schoolCategory?: string;
  avatarUrl?: string;
  idCardUrl?: string;
  degreeUrl?: string;
  bio?: string;
  gender?: string;
  socialLink?: string;
  isVerified: boolean;
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

export default function ManageAlumniStudents() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ALUMNI'>(
    'ALL'
  );

  // Pending Requests Count State
  const [pendingCount, setPendingCount] = useState(0);

  // View User Modal State
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && (location.state as any).viewingUser) {
      setViewingUser((location.state as any).viewingUser);
      // Clear state so modal doesn't reopen after refresh/navigation
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Create Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ALUMNI',
    schoolCategory: '',
    avatarUrl: '',
  });

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ALUMNI',
    schoolCategory: '',
    avatarUrl: '',
    idCardUrl: '',
    degreeUrl: '',
    bio: '',
    gender: '',
    socialLink: '',
    isVerified: true,
  });

  const fetchUsers = async () => {
    setIsFetching(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(
        `${apiUrl}/admin-portal/alumni-students?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}&role=${roleFilter}`,
        { withCredentials: true }
      );
      setUsers(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const apiUrl = import.meta.env.VITE_API_URL;
    axios
      .get(`${apiUrl}/admin-portal/pending-requests`, {
        withCredentials: true,
      })
      .then((res) => {
        if (!ignore) setPendingCount(res.data.total ?? 0);
      })
      .catch((err) =>
        console.error('Failed to fetch pending requests count', err)
      );
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    setIsFetching(true);
    const timer = setTimeout(() => {
      const apiUrl = import.meta.env.VITE_API_URL;
      axios
        .get(
          `${apiUrl}/admin-portal/alumni-students?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}&role=${roleFilter}`,
          { withCredentials: true }
        )
        .then((res) => {
          if (!ignore) {
            setUsers(res.data.data);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
            setIsFetching(false);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch users', err);
          if (!ignore) setIsFetching(false);
        });
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [searchQuery, currentPage, roleFilter]);

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

  const handleDocUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'idCardUrl' | 'degreeUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Document file size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditFormData((prev) => ({ ...prev, [field]: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.avatarUrl) {
      toast.error('Profile avatar image is compulsory for creation!');
      return;
    }
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.post(
        `${apiUrl}/admin-portal/alumni-students`,
        formData,
        { withCredentials: true }
      );
      toast.success('User account created successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER',
        schoolCategory: '',
        avatarUrl: '',
      });
      fetchUsers();
    } catch (err: unknown) {
      console.error('Failed to create user', err);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to create user');
      } else {
        toast.error('Failed to create user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (user: UserRecord) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role === 'ALUMNI' ? 'ALUMNI' : 'USER',
      schoolCategory: user.schoolCategory || '',
      avatarUrl: user.avatarUrl || '',
      idCardUrl: user.idCardUrl || '',
      degreeUrl: user.degreeUrl || '',
      bio: user.bio || '',
      gender: user.gender || '',
      socialLink: user.socialLink || '',
      isVerified: user.isVerified,
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.put(
        `${apiUrl}/admin-portal/alumni-students/${editingUser.id}`,
        editFormData,
        { withCredentials: true }
      );
      toast.success('User updated successfully!');
      setEditingUser(null);
      fetchUsers();
    } catch (err: unknown) {
      console.error('Failed to update user', err);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to update user');
      } else {
        toast.error('Failed to update user');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const executeDelete = async (userId: number) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.delete(
        `${apiUrl}/admin-portal/alumni-students/${userId}`,
        { withCredentials: true }
      );
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (err: unknown) {
      console.error('Failed to delete user', err);
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to delete user');
      } else {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleDelete = (user: UserRecord) => {
    toast(`Delete user "${user.name}"?`, {
      description: 'This action cannot be undone.',
      duration: 8000,
      action: {
        label: 'Confirm',
        onClick: () => executeDelete(user.id),
      },
      cancel: {
        label: 'Cancel',
        onClick: () => { },
      },
    });
  };

  const formatSchool = (school?: string) => {
    if (!school) return 'General / Unassigned';
    return school.replace(/_/g, ' ');
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Banner Bar with Pending Requests Trigger */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-700" />
            Manage Alumni & Students
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Register students, manage alumni accounts, and review pending
            approval requests.
          </p>
        </div>

        <Link
          to="/users/pending-requests"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-sm self-start sm:self-auto"
        >
          <Clock className="w-4 h-4 text-slate-200" />
          <span>Pending Requests</span>
          {pendingCount > 0 && (
            <span className="ml-1 bg-slate-900 text-white font-bold text-[11px] px-2 py-0.5 rounded-full shadow-2xs">
              {pendingCount}
            </span>
          )}
        </Link>
      </div>

      {/* Main Grid: Create Form + Directory Table */}
      <div className="w-full h-[calc(100vh-180px)] min-h-[560px] grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6 relative">
        {/* Create User Form */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm flex flex-col h-full overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 shrink-0">
            <h3 className="text-[#333] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-slate-800" />
              New Registration
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 font-normal">
              Create a new student or alumni profile
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
                  placeholder="e.g. Rahul Sharma"
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
                  placeholder="student@example.com"
                  className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Account Type / Role
                </label>
                <select
                  required
                  className="w-full h-10 rounded-sm border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'USER' | 'ALUMNI',
                    })
                  }
                >
                  <option value="USER">Student (Active)</option>
                  <option value="ALUMNI">Alumni (Graduate)</option>
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
                      Upload Avatar Image
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
                        className="text-[11px] text-red-500 hover:text-red-700 font-medium text-left"
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? 'Creating...' : 'Create User Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm flex flex-col h-full overflow-hidden">
          {/* Header & Filter Controls */}
          <div className="px-6 py-4 border-b border-gray-200 shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[#333] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-800" />
                Directory
              </h3>
              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {total} Total
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Role Tabs */}
              <div className="inline-flex rounded-sm bg-slate-100 p-0.5 border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => {
                    setRoleFilter('ALL');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${roleFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  All
                </button>
                <button
                  onClick={() => {
                    setRoleFilter('USER');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${roleFilter === 'USER' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Students
                </button>
                <button
                  onClick={() => {
                    setRoleFilter('ALUMNI');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 rounded-xs transition-colors cursor-pointer ${roleFilter === 'ALUMNI' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Alumni
                </button>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60">
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

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-3.5 px-6 text-left w-[28%]">Identity</th>
                  <th className="py-3.5 px-6 text-left w-[30%]">Contact</th>
                  <th className="py-3.5 px-6 text-center w-[24%]">School</th>
                  <th className="py-3.5 px-6 text-center w-[10%]">Type</th>
                  <th className="py-3.5 px-6 text-center w-[8%]">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {isFetching ? (
                  Array.from({ length: Math.min(itemsPerPage, 4) }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="border-b border-gray-100 animate-pulse">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 shrink-0"></div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                            <div className="h-2 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <div className="flex justify-center">
                          <div className="h-6 bg-gray-200 rounded w-24"></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <div className="flex justify-center">
                          <div className="h-5 bg-gray-200 rounded w-16"></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-gray-400 font-medium"
                    >
                      No verified student or alumni records found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-6 align-middle">
                        <div
                          className="flex items-center cursor-pointer group"
                          onClick={() => setViewingUser(user)}
                          title="Click to view complete user details"
                        >
                          <img
                            src={user.avatarUrl || DEFAULT_USER_AVATAR}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-xs mr-3 flex-shrink-0 bg-slate-100 group-hover:border-blue-400 transition-colors"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                DEFAULT_USER_AVATAR;
                            }}
                          />
                          <div>
                            <span className="font-semibold text-[#344767] block leading-tight group-hover:text-blue-600 group-hover:underline transition-colors">
                              {user.name}
                            </span>
                            <span className="text-xs text-gray-400 font-normal">
                              ID: {user.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 align-middle font-normal text-gray-600">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-6 align-middle text-center text-xs font-medium text-gray-600">
                        <div className="flex justify-center">
                          {user.schoolCategory ? (
                            <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                              {formatSchool(user.schoolCategory)}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Global</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 align-middle text-center">
                        <div className="flex justify-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold border ${user.role === 'ALUMNI'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                          >
                            {user.role === 'ALUMNI' ? 'Alumni' : 'Student'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 align-middle text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="View User Details"
                            onClick={() => setViewingUser(user)}
                            className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Edit User"
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            title="Delete User"
                            onClick={() => handleDelete(user)}
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
              of <span className="font-bold text-gray-700">{total}</span> users
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="h-8 px-3 text-xs font-semibold border border-gray-300 rounded-sm bg-white hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg border border-gray-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-800 rounded-md">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    User Details Profile
                  </h3>
                  <p className="text-[11px] text-slate-400 font-normal">
                    ID #{viewingUser.id} • Complete system details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 bg-slate-50/50">
              {/* Profile Card Header */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row items-center gap-5">
                <div className="relative group shrink-0">
                  <img
                    src={viewingUser.avatarUrl || DEFAULT_USER_AVATAR}
                    alt={viewingUser.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-sm bg-slate-100 cursor-pointer"
                    onClick={() =>
                      viewingUser.avatarUrl &&
                      setPreviewImageModal({
                        url: viewingUser.avatarUrl,
                        title: `${viewingUser.name}'s Avatar`,
                      })
                    }
                  />
                  {viewingUser.avatarUrl && (
                    <button
                      onClick={() =>
                        setPreviewImageModal({
                          url: viewingUser.avatarUrl!,
                          title: `${viewingUser.name}'s Avatar`,
                        })
                      }
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-lg font-bold text-slate-900">
                      {viewingUser.name}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${viewingUser.role === 'ALUMNI'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                    >
                      {viewingUser.role === 'ALUMNI' ? 'Alumni' : 'Student'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${viewingUser.isVerified
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      {viewingUser.isVerified
                        ? 'Verified Account'
                        : 'Pending Approval'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a
                      href={`mailto:${viewingUser.email}`}
                      className="hover:underline hover:text-slate-800"
                    >
                      {viewingUser.email}
                    </a>
                  </p>

                  <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                    {viewingUser.schoolCategory && (
                      <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                        {formatSchool(viewingUser.schoolCategory)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Grid Stats */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-4">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-gray-100 pb-2">
                  Account Details
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                      Full Name
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {viewingUser.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                      Email Address
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {viewingUser.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                      Account Role
                    </span>
                    <span className="font-semibold text-slate-800">
                      {viewingUser.role === 'ALUMNI'
                        ? 'Alumni (Graduate)'
                        : 'Student (Active)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                      School / Department
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatSchool(viewingUser.schoolCategory)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                      Registration Date
                    </span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(viewingUser.createdAt).toLocaleDateString(
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
                      {viewingUser.gender || 'Not specified'}
                    </span>
                  </div>
                  {viewingUser.bio && (
                    <div className="sm:col-span-2">
                      <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                        Bio
                      </span>
                      <p className="text-slate-700 bg-gray-50 p-2.5 rounded border border-gray-100 font-normal">
                        {viewingUser.bio}
                      </p>
                    </div>
                  )}
                  {viewingUser.socialLink && (
                    <div className="sm:col-span-2">
                      <span className="text-gray-400 font-semibold uppercase block text-[10px] tracking-wider mb-0.5">
                        Social Profile
                      </span>
                      <a
                        href={viewingUser.socialLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {viewingUser.socialLink}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded Documents Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs space-y-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center justify-between">
                  <span>Verification Documents</span>
                  <FileText className="w-4 h-4 text-slate-400" />
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ID Card Box */}
                  <div className="border border-gray-200 rounded-md p-3 bg-gray-50/50 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Student / Alumni ID Card
                    </span>
                    {viewingUser.idCardUrl ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={viewingUser.idCardUrl}
                          alt="ID Card"
                          className="w-12 h-12 object-cover rounded border border-gray-300 shadow-2xs bg-white shrink-0 cursor-pointer"
                          onClick={() =>
                            setPreviewImageModal({
                              url: viewingUser.idCardUrl!,
                              title: `${viewingUser.name}'s ID Card`,
                            })
                          }
                        />
                        <div className="space-y-1">
                          <span className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Document
                            Attached
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImageModal({
                                url: viewingUser.idCardUrl!,
                                title: `${viewingUser.name}'s ID Card`,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> View Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No ID Card uploaded
                      </p>
                    )}
                  </div>

                  {/* Degree Certificate Box */}
                  <div className="border border-gray-200 rounded-md p-3 bg-gray-50/50 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Degree Certificate
                    </span>
                    {viewingUser.degreeUrl ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={viewingUser.degreeUrl}
                          alt="Degree Certificate"
                          className="w-12 h-12 object-cover rounded border border-gray-300 shadow-2xs bg-white shrink-0 cursor-pointer"
                          onClick={() =>
                            setPreviewImageModal({
                              url: viewingUser.degreeUrl!,
                              title: `${viewingUser.name}'s Degree Certificate`,
                            })
                          }
                        />
                        <div className="space-y-1">
                          <span className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Document
                            Attached
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewImageModal({
                                url: viewingUser.degreeUrl!,
                                title: `${viewingUser.name}'s Degree Certificate`,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> View Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No Degree uploaded
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const target = viewingUser;
                  setViewingUser(null);
                  handleOpenEdit(target);
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-gray-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Profile
              </button>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-800 rounded-md">
                  <Pencil className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Update User Account
                  </h3>
                  <p className="text-[11px] text-slate-400 font-normal">
                    ID #{editingUser.id} • {editingUser.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateSubmit}
              className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1 bg-slate-50/40"
            >
              {/* Account & Status Bar */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-gray-100 pb-2">
                  Account Credentials & Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          name: e.target.value,
                        })
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
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                      value={editFormData.email}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Account Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                      value={editFormData.role}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          role: e.target.value as 'USER' | 'ALUMNI',
                        })
                      }
                    >
                      <option value="USER">Student (Active)</option>
                      <option value="ALUMNI">Alumni (Graduate)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      School / Department
                    </label>
                    <select
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
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

                  <div className="sm:col-span-2 space-y-1.5 pt-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Account Approval Status
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100/80 transition-colors">
                      <input
                        type="checkbox"
                        checked={editFormData.isVerified}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            isVerified: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Verified & Pre-approved Account
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          Unchecking will place the user into pending
                          administrator review.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Profile Avatar & Personal Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-gray-100 pb-2">
                  Profile Avatar & Personal Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Avatar Upload Box */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                      Profile Avatar
                    </label>
                    <div className="flex items-center gap-4 bg-gray-50/80 p-3 rounded-md border border-gray-200">
                      <img
                        src={editFormData.avatarUrl || DEFAULT_USER_AVATAR}
                        alt="Avatar Preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-300 shadow-xs bg-white shrink-0"
                      />
                      <div className="flex-1 flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-2xs">
                          <Upload className="w-3.5 h-3.5 text-slate-600" />
                          Upload New Image
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
                              className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEditFormData({
                                  ...editFormData,
                                  avatarUrl: '',
                                })
                              }
                              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors cursor-pointer"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

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
                      Social Link / Profile URL
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

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Bio / Summary
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter user bio or additional notes..."
                      className="w-full p-3 rounded-md border border-gray-300 bg-white text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none resize-none"
                      value={editFormData.bio}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          bio: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Verification Documents Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-gray-100 pb-2">
                  Verification Documents
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ID Card Document Upload */}
                  <div className="border border-gray-200 rounded-md p-3 bg-gray-50/50 space-y-2.5">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Student / Alumni ID Card
                    </span>
                    {editFormData.idCardUrl ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={editFormData.idCardUrl}
                          alt="ID Card"
                          className="w-12 h-12 object-cover rounded border border-gray-300 shadow-2xs bg-white shrink-0 cursor-pointer"
                          onClick={() =>
                            setPreviewImageModal({
                              url: editFormData.idCardUrl,
                              title: 'ID Card Preview',
                            })
                          }
                        />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImageModal({
                                  url: editFormData.idCardUrl,
                                  title: 'ID Card Preview',
                                })
                              }
                              className="px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                            <label className="px-2 py-0.5 text-xs font-semibold text-gray-700 bg-gray-200/70 hover:bg-gray-200 rounded border border-gray-300 cursor-pointer transition-colors">
                              Change
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleDocUpload(e, 'idCardUrl')
                                }
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setEditFormData({
                                  ...editFormData,
                                  idCardUrl: '',
                                })
                              }
                              className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 rounded-md text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors w-full justify-center">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        Upload ID Card
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleDocUpload(e, 'idCardUrl')}
                        />
                      </label>
                    )}
                  </div>

                  {/* Degree Certificate Document Upload */}
                  <div className="border border-gray-200 rounded-md p-3 bg-gray-50/50 space-y-2.5">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Degree Certificate
                    </span>
                    {editFormData.degreeUrl ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={editFormData.degreeUrl}
                          alt="Degree Certificate"
                          className="w-12 h-12 object-cover rounded border border-gray-300 shadow-2xs bg-white shrink-0 cursor-pointer"
                          onClick={() =>
                            setPreviewImageModal({
                              url: editFormData.degreeUrl,
                              title: 'Degree Certificate Preview',
                            })
                          }
                        />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImageModal({
                                  url: editFormData.degreeUrl,
                                  title: 'Degree Certificate Preview',
                                })
                              }
                              className="px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                            <label className="px-2 py-0.5 text-xs font-semibold text-gray-700 bg-gray-200/70 hover:bg-gray-200 rounded border border-gray-300 cursor-pointer transition-colors">
                              Change
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleDocUpload(e, 'degreeUrl')
                                }
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                setEditFormData({
                                  ...editFormData,
                                  degreeUrl: '',
                                })
                              }
                              className="p-1 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 rounded-md text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors w-full justify-center">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        Upload Degree
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleDocUpload(e, 'degreeUrl')}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Password Override */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Override Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="•••••••• (leave blank to keep existing password)"
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none"
                  value={editFormData.password}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              {/* Form Action Controls */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 bg-white p-3 rounded-lg border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 h-9 bg-slate-700 hover:bg-slate-800 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
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
