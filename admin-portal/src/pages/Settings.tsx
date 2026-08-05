import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  ChevronRight,
  User,
  Key,
  Mail,
  Building2,
  Globe,
  Loader2,
  Save,
  Camera,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  X,
  Maximize2,
  ZoomIn,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

const DEFAULT_USER_AVATAR = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%23cbd5e1'/><circle cx='50' cy='38' r='18' fill='%2364748b'/><path d='M14 88 a36 36 0 0 1 72 0 Z' fill='%2364748b'/></svg>`;

const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const SCHOOL_CATEGORIES = [
  { value: 'School_of_Engineering', label: 'School of Engineering' },
  { value: 'School_of_Sciences', label: 'School of Sciences' },
  { value: 'School_of_Agriculture', label: 'School of Agriculture' },
  { value: 'School_of_Business_Studies', label: 'School of Business Studies' },
  {
    value: 'School_of_Computer_Applications',
    label: 'School of Computer Applications',
  },
  { value: 'School_of_Humanities', label: 'School of Humanities' },
  { value: 'School_of_Education', label: 'School of Education' },
  { value: 'School_of_Law', label: 'School of Law' },
  { value: 'School_of_Pharmacy', label: 'School of Pharmacy' },
];

export default function Settings() {
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    avatarUrl: '',
    bio: '',
    gender: '',
    socialLink: '',
    schoolCategory: '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password Visibilities
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Image Adjustment / Crop Modal States
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState('');
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (location.state?.tab === 'password') {
      setActiveTab('password');
    } else {
      setActiveTab('profile');
    }
  }, [location.state]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.get(
        `${apiUrl}/admin-portal/profile`,
        {
          withCredentials: true,
        }
      );
      const fetchedUser = res.data.user;
      if (fetchedUser) {
        setProfileData({
          name: fetchedUser.name || '',
          email: fetchedUser.email || '',
          avatarUrl: fetchedUser.avatarUrl || '',
          bio: fetchedUser.bio || '',
          gender: fetchedUser.gender || '',
          socialLink: fetchedUser.socialLink || '',
          schoolCategory: fetchedUser.schoolCategory || '',
        });

        // Sync local storage user state
        if (user) {
          login({
            ...user,
            name: fetchedUser.name,
            email: fetchedUser.email,
            avatarUrl: fetchedUser.avatarUrl,
            role: fetchedUser.role,
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      toast.error(
        err.response?.data?.message || 'Failed to load profile details'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImageSrc(reader.result as string);
      setShowAdjustModal(true);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImgNaturalSize({ width: naturalWidth, height: naturalHeight });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomStep = 0.05;
    const newZoom =
      e.deltaY < 0
        ? Math.min(zoom + zoomStep, 3)
        : Math.max(zoom - zoomStep, 1);
    setZoom(newZoom);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - offset.x,
        y: touch.clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const handleCropSave = async () => {
    if (!imageRef.current) return;

    setIsUploadingImage(true);
    try {
      // Simulate network latency for a better UX feeling
      await new Promise((resolve) => setTimeout(resolve, 800));
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const isLandscape = imgNaturalSize.width >= imgNaturalSize.height;
        const vw = 256;
        const cw = 300;
        const scale = cw / vw;

        let baseW = 0;
        let baseH = 0;

        if (isLandscape) {
          baseH = vw;
          baseW = vw * (imgNaturalSize.width / imgNaturalSize.height);
        } else {
          baseW = vw;
          baseH = vw * (imgNaturalSize.height / imgNaturalSize.width);
        }

        const finalW = baseW * zoom * scale;
        const finalH = baseH * zoom * scale;
        const drawX = cw / 2 + offset.x * scale - finalW / 2;
        const drawY = cw / 2 + offset.y * scale - finalH / 2;

        // Draw background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cw, cw);

        // Draw cropped and panned image
        ctx.drawImage(imageRef.current, drawX, drawY, finalW, finalH);

        const base64String = canvas.toDataURL('image/jpeg', 0.9);

        // Upload to backend
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await axios.post(
          `${apiUrl}/admin-portal/upload`,
          { image: base64String },
          { withCredentials: true }
        );

        if (res.data.url) {
          const newAvatarUrl = res.data.url;

          // Save avatarUrl immediately to profile in database
          const updateRes = await axios.put(
            `${apiUrl}/admin-portal/profile`,
            {
              name: profileData.name.trim(),
              email: profileData.email.trim(),
              avatarUrl: newAvatarUrl,
              bio: profileData.bio.trim() || null,
              gender: profileData.gender || null,
              socialLink: profileData.socialLink.trim() || null,
              schoolCategory: profileData.schoolCategory || null,
            },
            { withCredentials: true }
          );

          const updatedUser = updateRes.data.user || {
            ...user,
            avatarUrl: newAvatarUrl,
          };

          setProfileData((prev) => ({
            ...prev,
            avatarUrl: updatedUser.avatarUrl || newAvatarUrl,
          }));

          if (user) {
            login({
              ...user,
              avatarUrl: updatedUser.avatarUrl || newAvatarUrl,
            });
          }

          toast.success('Profile picture updated successfully!');
          setShowAdjustModal(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      }
    } catch (err: any) {
      console.error('Adjustment upload failed:', err);
      toast.error(
        err.response?.data?.message || 'Failed to adjust and upload image'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCloseModal = () => {
    setShowAdjustModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setProfileData((prev) => ({ ...prev, avatarUrl: '' }));
    toast.success('Selected avatar cleared (will save on submit)');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (!profileData.email.trim()) {
      toast.error('Email address is required');
      return;
    }

    setIsSavingProfile(true);
    try {
      // Simulate network latency for a better UX feeling
      await new Promise((resolve) => setTimeout(resolve, 800));
      const payload = {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        avatarUrl: profileData.avatarUrl.trim() || null,
        bio: profileData.bio.trim() || null,
        gender: profileData.gender || null,
        socialLink: profileData.socialLink.trim() || null,
        schoolCategory: profileData.schoolCategory || null,
      };

      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.put(
        `${apiUrl}/admin-portal/profile`,
        payload,
        { withCredentials: true }
      );

      const updatedUser = res.data.user;
      if (updatedUser) {
        toast.success('Profile updated successfully');

        // Update Zustand auth store / localStorage
        login({
          ...user,
          name: updatedUser.name,
          email: updatedUser.email,
          avatarUrl: updatedUser.avatarUrl,
          role: updatedUser.role,
        });
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast.error(
        err.response?.data?.message || 'Failed to save profile changes'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (!newPassword) {
      toast.error('Please enter your new password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation password do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      // Simulate network latency for a better UX feeling
      await new Promise((resolve) => setTimeout(resolve, 800));
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.put(
        `${apiUrl}/admin-portal/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );

      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      console.error('Error changing password:', err);
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col min-h-[calc(100vh-64px)]">
        {/* Breadcrumb Header */}
        <div className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
          <div className="flex items-center text-sm text-gray-500">
            <SettingsIcon className="w-4 h-4 mr-2" />
            <span>Settings</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-gray-400">Overview</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f8fafc]">
          <Loader2 className="w-10 h-10 animate-spin text-slate-700" />
          <span className="text-sm font-semibold text-slate-700 mt-3">
            Loading settings profile details...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-64px)]">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
        <div className="flex items-center text-sm text-gray-500">
          <SettingsIcon className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium text-slate-600">Settings</span>
          <ChevronRight className="w-4 h-4 mx-1 text-gray-300" />
          <span className="text-slate-400 capitalize">{activeTab}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-6 lg:p-8 space-y-6 flex-1 bg-[#f8fafc] text-slate-800 font-sans">
        {/* Title Header Card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2.5">
              <SettingsIcon className="w-6 h-6 text-slate-700" />
              <span>Profile & Account Settings</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Update your administrative profile details, school category, and
              security password.
            </p>
          </div>
        </div>

        {/* Custom Premium Tabs bar */}
        <div className="flex gap-2 border-b border-gray-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer border ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Profile Settings</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer border ${
              activeTab === 'password'
                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </span>
          </button>
        </div>

        {/* Active Tab Contents */}
        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PROFILE PREVIEW & AVATAR CARD */}
            <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm flex flex-col items-center justify-center h-full">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-4 self-center text-center">
                Avatar Preview
              </span>

              <div className="relative group mb-2">
                <div className="relative">
                  <img
                    src={profileData.avatarUrl || DEFAULT_USER_AVATAR}
                    alt={profileData.name}
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-200 shadow-sm transition-all duration-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_USER_AVATAR;
                    }}
                  />
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    </div>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Edit Button stick with profile photo */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="absolute bottom-1 right-1 bg-slate-800 hover:bg-slate-900 text-white p-2 rounded-full shadow-md transition-all cursor-pointer flex items-center justify-center border-2 border-white disabled:opacity-60"
                  title="Upload new profile image"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Remove Photo Action if custom photo exists */}
              {profileData.avatarUrl &&
                profileData.avatarUrl !== DEFAULT_USER_AVATAR && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold mb-3 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove photo</span>
                  </button>
                )}

              <h3 className="font-bold text-slate-800 text-lg leading-tight mt-2">
                {profileData.name || 'Administrator'}
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {profileData.email}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border border-slate-200">
                  Role: {user?.role || 'ADMIN'}
                </span>
                {profileData.schoolCategory && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm border border-blue-200">
                    {profileData.schoolCategory.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              <div className="w-full border-t border-gray-100 mt-6 pt-5 space-y-3.5 text-center text-xs">
                {profileData.socialLink && (
                  <div className="flex items-center justify-center gap-2.5">
                    <LinkedInIcon className="w-4 h-4 text-[#0077b5] shrink-0" />
                    <a
                      href={
                        profileData.socialLink.startsWith('http')
                          ? profileData.socialLink
                          : `https://${profileData.socialLink}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium break-all"
                    >
                      {profileData.socialLink}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* DETAILED SETTINGS FORM */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-sm shadow-sm h-full">
              <div className="p-5 border-b border-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-600" />
                  <span>Profile Information</span>
                </h2>
              </div>

              <form onSubmit={handleProfileSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full h-9 px-3 text-sm bg-white border border-gray-300 rounded-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-700 placeholder-gray-400"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        required
                        placeholder="admin@educlinic.com"
                        className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-gray-300 rounded-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-700 placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* School Category */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      School Category / Department
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <select
                        name="schoolCategory"
                        value={profileData.schoolCategory}
                        onChange={handleProfileChange}
                        className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-gray-300 rounded-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-700 cursor-pointer"
                      >
                        <option value="">General (No specific school)</option>
                        {SCHOOL_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleProfileChange}
                      className="w-full h-9 px-3 text-sm bg-white border border-gray-300 rounded-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-700 cursor-pointer"
                    >
                      <option value="">Not Specified</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                      <option value="PREFER_NOT_TO_SAY">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                </div>

                {/* Social Link */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    LinkedIn / Social Profile URL
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      name="socialLink"
                      value={profileData.socialLink}
                      onChange={handleProfileChange}
                      placeholder="linkedin.com/in/username"
                      className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-gray-300 rounded-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-700 placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Biography / Description
                  </label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 text-sm bg-white border border-gray-300 rounded-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-700 placeholder-gray-400"
                  />
                </div>

                {/* Submit button */}
                <div className="border-t border-gray-100 pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSavingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* CHANGE PASSWORD CONTAINER */
          <div className="max-w-2xl bg-white border border-gray-200 rounded-sm shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-600" />
                <span>Security Settings</span>
              </h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-sm p-4 text-xs flex gap-2.5 items-start">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider text-[10px] text-amber-700 mb-0.5">
                    Security Recommendation
                  </p>
                  <p>
                    Choose a strong password containing at least 6 characters,
                    including numbers, symbols, and mixed-case letters to keep
                    your administrator portal account secure.
                  </p>
                </div>
              </div>

              {/* Current Password */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="••••••••"
                    className="w-full h-9 pl-3 pr-10 text-sm bg-white border border-gray-300 rounded-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="••••••••"
                    className="w-full h-9 pl-3 pr-10 text-sm bg-white border border-gray-300 rounded-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="••••••••"
                    className="w-full h-9 pl-3 pr-10 text-sm bg-white border border-gray-300 rounded-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSavingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* PICTURE ADJUSTMENT / CROP MODAL DIALOG */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-sm shadow-xl border border-gray-200 w-full max-w-sm overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-slate-600" />
                <span>Adjust Profile Picture</span>
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-slate-600 cursor-pointer transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-4 text-center">
                Drag the image to reposition inside the circle. Scroll or use
                the slider to zoom.
              </p>

              {/* Viewport Circle Container */}
              <div
                className="relative w-64 h-64 rounded-full overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 select-none cursor-move flex items-center justify-center shadow-inner"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={tempImageSrc}
                  alt="Crop preview"
                  onLoad={handleImageLoad}
                  className="absolute pointer-events-none select-none origin-center"
                  style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    maxWidth: 'none',
                    width:
                      imgNaturalSize.width >= imgNaturalSize.height
                        ? 'auto'
                        : '100%',
                    height:
                      imgNaturalSize.width >= imgNaturalSize.height
                        ? '100%'
                        : 'auto',
                  }}
                />

                {/* Circular boundary guide shadow overlay */}
                <div className="absolute inset-0 rounded-full border border-slate-400/20 pointer-events-none shadow-[0_0_0_9999px_rgba(255,255,255,0.4)]"></div>
              </div>

              {/* Zoom Controls */}
              <div className="w-full mt-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-gray-400" />
                    <span>Zoom Level</span>
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(z - 0.1, 1))}
                    className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-slate-600 font-bold transition-colors cursor-pointer text-sm"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-slate-800 cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(z + 0.1, 3))}
                    className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-slate-600 font-bold transition-colors cursor-pointer text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isUploadingImage}
                className="px-4 py-2 border border-gray-200 rounded-sm bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-55"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                disabled={isUploadingImage}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 rounded-sm text-xs font-semibold text-white cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-55"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Apply & Save</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
