'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  User,
  Camera,
  Trash2,
  Loader2,
  Save,
  X,
  Lock,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useUserStore } from '@/store/useUserStore';
import { ProfileCropModal } from '@/components/Home/ProfileCropModal';

const SCHOOL_OPTIONS = [
  { value: 'School_of_Engineering', label: 'School of Engineering' },
  { value: 'School_of_Sciences', label: 'School of Sciences' },
  { value: 'School_of_Agriculture', label: 'School of Agriculture' },
  {
    value: 'School_of_Business_Studies',
    label: 'School of Business Studies',
  },
  { value: 'School_of_Commerce', label: 'School of Commerce' },
  { value: 'School_of_Management', label: 'School of Management' },
  {
    value: 'School_of_Computer_Applications',
    label: 'School of Computer Applications',
  },
  { value: 'School_of_Humanities', label: 'School of Humanities' },
  { value: 'School_of_Education', label: 'School of Education' },
  { value: 'School_of_Law', label: 'School of Law' },
  { value: 'School_of_Pharmacy', label: 'School of Pharmacy' },
];

const PRONOUN_OPTIONS = [
  'he/him',
  'she/her',
  'they/them',
  'he/they',
  'she/they',
  'Other',
  'Prefer not to say',
];

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const sessionId = useUserStore((state) => state.sessionId);

  const [mounted, setMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const role = user?.role || 'USER';
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAlumni = role === 'ALUMNI';
  const isStudent = role === 'USER';

  // Form states - strictly relevant attributes per role
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [schoolCategory, setSchoolCategory] = useState('');
  const [course, setCourse] = useState('');
  const [batchFrom, setBatchFrom] = useState('');
  const [batchTo, setBatchTo] = useState('');
  const [gender, setGender] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Crop modal states
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    let isCancelled = false;

    const checkAuth = async () => {
      try {
        const activeSession = await useUserStore
          .getState()
          .validateOrRefreshSession();

        if (isCancelled) return;

        if (!activeSession && !useUserStore.getState().isAuthenticated) {
          toast.error('Session expired or login required.');
          router.push('/auth');
          return;
        }
      } catch (err) {
        if (!isCancelled) {
          router.push('/auth');
        }
      } finally {
        if (!isCancelled) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  // Sync state with user store
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      setSchoolCategory(user.schoolCategory || '');
      setCourse(user.course || '');
      setBatchFrom(user.batchFrom || '');
      setBatchTo(user.batchTo || '');
      setGender(user.gender || '');
      setSocialLink(user.socialLink || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      setSchoolCategory(user.schoolCategory || '');
      setCourse(user.course || '');
      setBatchFrom(user.batchFrom || '');
      setBatchTo(user.batchTo || '');
      setGender(user.gender || '');
      setSocialLink(user.socialLink || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
      setErrors({});
    }
    setIsEditing(false);
  };

  const handleAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image is larger than 15MB. Please choose a smaller photo.');
      return;
    }

    e.target.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setIsCropOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCroppedAvatar = (croppedDataUrl: string) => {
    setAvatarUrl(croppedDataUrl);
    setIsCropOpen(false);
    setRawImageSrc(null);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Name is required';
    }

    if (!isAdmin) {
      if (course.length > 50) {
        errs.course = 'Course must be 50 characters or less';
      }
      if (batchFrom.length > 30) {
        errs.batchFrom = 'Batch (From) must be 30 characters or less';
      }
      if (batchTo.length > 30) {
        errs.batchTo = 'Batch (To) must be 30 characters or less';
      }
    }

    if (phoneNumber && phoneNumber.trim().length > 20) {
      errs.phoneNumber = 'Phone number must be 20 characters or less';
    }

    if (socialLink && socialLink.trim()) {
      try {
        new URL(socialLink);
      } catch {
        if (!socialLink.startsWith('http://') && !socialLink.startsWith('https://')) {
          errs.socialLink = 'Please enter a valid URL starting with https://';
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      const headers: Record<string, string> = {};
      if (sessionId) {
        headers['Authorization'] = `Bearer ${sessionId}`;
      }

      const payload: Record<string, any> = {
        name: name.trim(),
        phoneNumber: phoneNumber.trim() || null,
        gender: gender || null,
        socialLink: socialLink.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl || null,
      };

      // Only include academic fields for students and alumni
      if (!isAdmin) {
        payload.course = course.trim() || null;
        payload.batchFrom = batchFrom.trim() || null;
        payload.batchTo = batchTo.trim() || null;
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
        payload,
        {
          headers,
          withCredentials: true,
        }
      );

      if (res.data?.user) {
        useUserStore.getState().setUser(res.data.user);
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      const msg =
        err?.response?.data?.message ||
        'Failed to save changes. Please try again.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const getCleanSchoolName = (key?: string | null) => {
    if (!key) return null;
    const found = SCHOOL_OPTIONS.find((s) => s.value === key);
    return found ? found.label : key.replace(/_/g, ' ');
  };

  const getRoleBadge = (r?: string) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return { label: 'Super Administrator', style: 'bg-amber-50 text-amber-900 border-amber-300' };
      case 'ADMIN':
        return { label: 'Administrator', style: 'bg-red-50 text-red-900 border-red-300' };
      case 'ALUMNI':
        return { label: 'Alumni', style: 'bg-purple-50 text-purple-900 border-purple-300' };
      case 'USER':
      default:
        return { label: 'Student', style: 'bg-blue-50 text-blue-900 border-blue-300' };
    }
  };

  if (!mounted || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-gray-700">
        <Loader2 className="h-8 w-8 animate-spin text-[#d60000] mb-3" />
        <p className="text-sm font-semibold tracking-wide uppercase">
          Loading Profile...
        </p>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user?.role);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-gray-900 font-sans py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Main Centered Profile Card */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden">

          {/* ================= CENTERED HEADER ================= */}
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center border-b border-gray-200 bg-white text-center">
            {/* User Photo */}
            <div className="relative group">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shadow-2xs">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name || 'User Photo'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <User className="h-16 w-16 stroke-[1.2]" />
                    <span className="text-[10px] font-bold uppercase text-gray-400 mt-1">
                      No Photo
                    </span>
                  </div>
                )}
              </div>

              {/* Edit Mode Camera overlay */}
              {isEditing && (
                <label
                  htmlFor="portal-avatar-upload"
                  className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Upload & Crop Photo"
                >
                  <Camera size={22} />
                  <span className="text-[11px] font-semibold mt-1">Change</span>
                </label>
              )}
              <input
                id="portal-avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarFileSelected}
                className="hidden"
                disabled={!isEditing}
              />
            </div>

            {/* Name */}
            <h1 className="text-xl sm:text-2xl font-bold text-[#1f3a60] uppercase tracking-wide mt-4 leading-tight">
              {name || user?.name || <span className="text-gray-400 normal-case italic font-normal">Not provided</span>}
            </h1>

            {/* Subtitle strictly tailored per role */}
            <div className="text-xs font-semibold text-[#2563eb] mt-1 space-x-1 uppercase">
              {isSuperAdmin && <span>SUPER ADMINISTRATOR</span>}
              {role === 'ADMIN' && <span>ADMINISTRATOR</span>}
              {isAlumni && (
                <>
                  <span>ALUMNI</span>
                  {course?.trim() && <span>• {course.toUpperCase()}</span>}
                  {batchFrom?.trim() && batchTo?.trim() && (
                    <span>• BATCH {batchFrom}-{batchTo}</span>
                  )}
                </>
              )}
              {isStudent && (
                <>
                  <span>STUDENT</span>
                  {course?.trim() && <span>• {course.toUpperCase()}</span>}
                  {batchFrom?.trim() && batchTo?.trim() && (
                    <span>• BATCH {batchFrom}-{batchTo}</span>
                  )}
                </>
              )}
            </div>


            {/* Signature Red EDIT Button or SAVE/CANCEL */}
            <div className="mt-4 flex items-center justify-center gap-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-[#d60000] hover:bg-[#b30000] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-7 rounded-full shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 size={12} />
                  <span>EDIT</span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={isSaving}
                    className="bg-[#d60000] hover:bg-[#b30000] text-white text-xs font-bold uppercase tracking-wider py-1.5 px-6 rounded-full shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    {isSaving ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Save size={13} />
                    )}
                    <span>SAVE</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider py-1.5 px-5 rounded-full transition cursor-pointer flex items-center gap-1"
                  >
                    <X size={13} />
                    <span>CANCEL</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-[11px] text-red-600 hover:underline px-2"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ================= DETAILS BODY (TAILORED STRICTLY BY ROLE) ================= */}
          <div className="p-5 sm:p-8 space-y-7">

            {/* Section 1: Academic Details (ONLY for Students and Alumni) */}
            {!isAdmin && (
              <div>
                <div className="bg-[#eaf5ea] border-l-4 border-[#34a853] py-2 px-4 text-xs sm:text-sm font-bold text-gray-800 rounded-xs mb-4">
                  Academic Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-xs sm:text-sm">
                  {/* Course */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-36 font-bold text-gray-900 shrink-0">
                      Course
                    </span>
                    {isEditing ? (
                      <div className="flex-1">
                        <input
                          type="text"
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          placeholder="e.g. B.Tech. CSE"
                          maxLength={50}
                          className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-xs focus:border-[#d60000] focus:ring-1 focus:ring-[#d60000] outline-none"
                        />
                        {errors.course && (
                          <p className="text-xs text-red-500 mt-1">{errors.course}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-800 font-medium uppercase">
                        {course?.trim() || <span className="text-gray-400 normal-case italic">Not provided</span>}
                      </span>
                    )}
                  </div>

                  {/* School Category (Read-Only) */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-36 font-bold text-gray-900 shrink-0 flex items-center gap-1">
                      <span>School</span>
                      <Lock size={11} className="text-gray-400" />
                    </span>
                    <span className="text-gray-800 font-medium">
                      {getCleanSchoolName(user?.schoolCategory || schoolCategory) || (
                        <span className="text-gray-400 normal-case italic">Not provided</span>
                      )}
                    </span>
                  </div>

                  {/* Batch From */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-36 font-bold text-gray-900 shrink-0">
                      Batch (From)
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={batchFrom}
                        onChange={(e) => setBatchFrom(e.target.value)}
                        placeholder="e.g. 2020"
                        maxLength={30}
                        className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-xs focus:border-[#d60000] focus:ring-1 focus:ring-[#d60000] outline-none"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">
                        {batchFrom?.trim() || <span className="text-gray-400 normal-case italic">Not provided</span>}
                      </span>
                    )}
                  </div>

                  {/* Batch To */}
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="w-36 font-bold text-gray-900 shrink-0">
                      Batch (To)
                    </span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={batchTo}
                        onChange={(e) => setBatchTo(e.target.value)}
                        placeholder="e.g. 2024"
                        maxLength={30}
                        className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-xs focus:border-[#d60000] focus:ring-1 focus:ring-[#d60000] outline-none"
                      />
                    ) : (
                      <span className="text-gray-800 font-medium">
                        {batchTo?.trim() || <span className="text-gray-400 normal-case italic">Not provided</span>}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Personal & Contact Details (Shown for All Roles) */}
            <div>
              <div className="bg-[#eaf5ea] border-l-4 border-[#34a853] py-2 px-4 text-xs sm:text-sm font-bold text-gray-800 rounded-xs mb-4">
                {isAdmin ? 'Administrative & Contact Details' : 'Personal & Contact Details'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-xs sm:text-sm">
                {/* Name */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-36 font-bold text-gray-900 shrink-0">
                    Full Name <span className="text-[#d60000]">*</span>
                  </span>
                  {isEditing ? (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-xs focus:border-[#d60000] focus:ring-1 focus:ring-[#d60000] outline-none"
                        required
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-800 font-medium uppercase">
                      {name?.trim() || user?.name || <span className="text-gray-400 normal-case italic">Not provided</span>}
                    </span>
                  )}
                </div>

                {/* Email (Read-Only) */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-36 font-bold text-gray-900 shrink-0 flex items-center gap-1">
                    <span>Email Address</span>
                    <Lock size={11} className="text-gray-400" />
                  </span>
                  <span className="text-gray-800 font-medium font-mono break-all">
                    {user?.email || <span className="text-gray-400 normal-case italic">Not provided</span>}
                  </span>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-36 font-bold text-gray-900 shrink-0">
                    Phone Number
                  </span>
                  {isEditing ? (
                    <div className="flex-1">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 9876543210"
                        maxLength={20}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-xs focus:border-[#d60000] focus:ring-1 focus:ring-[#d60000] outline-none"
                      />
                      {errors.phoneNumber && (
                        <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-800 font-medium font-mono">
                      {phoneNumber?.trim() || <span className="text-gray-400 normal-case italic">Not provided</span>}
                    </span>
                  )}
                </div>

                {/* Pronouns */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-36 font-bold text-gray-900 shrink-0">
                    Pronouns
                  </span>
                  {isEditing ? (
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-xs bg-white focus:border-[#d60000] focus:ring-1 focus:ring-[#d60000] outline-none text-gray-800"
                    >
                      <option value="">Select Pronouns</option>
                      {PRONOUN_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-gray-800 font-medium">
                      {gender?.trim() || <span className="text-gray-400 normal-case italic">Not provided</span>}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Professional Details */}
            <div>
              <div className="bg-[#eaf5ea] border-l-4 border-[#34a853] py-2 px-4 text-xs sm:text-sm font-bold text-gray-800 rounded-xs mb-4">
                Professional Details
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Social Link */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <span className="w-36 font-bold text-gray-900 shrink-0">
                    Social Link
                  </span>
                  {isEditing ? (
                    <div className="flex-1">
                      <input
                        type="url"
                        value={socialLink}
                        onChange={(e) => setSocialLink(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-xs focus:border-[#d60000] focus:ring-1 focus:ring-[#d60000] outline-none"
                      />
                      {errors.socialLink && (
                        <p className="text-xs text-red-500 mt-1">{errors.socialLink}</p>
                      )}
                    </div>
                  ) : socialLink?.trim() ? (
                    <a
                      href={socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563eb] hover:underline flex items-center gap-1 font-medium break-all"
                    >
                      <span>{socialLink}</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </div>

                {/* Bio */}
                <div className="flex flex-col sm:flex-row sm:items-start pt-1">
                  <span className="w-36 font-bold text-gray-900 shrink-0 pt-1">
                    Bio
                  </span>
                  {isEditing ? (
                    <div className="flex-1">
                      <textarea
                        value={bio}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) setBio(e.target.value);
                        }}
                        rows={3}
                        placeholder="Write a brief bio..."
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-xs focus:border-[#d60000] focus:ring-1 focus:ring-[#d60000] outline-none resize-none leading-relaxed"
                      />
                      <span className="text-[10px] text-gray-400 block text-right mt-0.5">
                        {bio.length}/500
                      </span>
                    </div>
                  ) : (
                    <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">
                      {bio?.trim() || <span className="text-gray-400 normal-case italic">Not provided</span>}
                    </p>
                  )}
                </div>

                {/* Developer Title if user is developer */}
                {user?.isDeveloper && (
                  <div className="flex flex-col sm:flex-row sm:items-center pt-1">
                    <span className="w-36 font-bold text-gray-900 shrink-0">
                      Developer Role
                    </span>
                    <span className="text-gray-800 font-medium">
                      {user.developerTitle || 'Core Platform Contributor'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Save bar when user is editing */}
            {isEditing && (
              <div className="pt-5 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#d60000] hover:bg-[#b30000] text-white text-xs font-bold uppercase tracking-wider rounded-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Crop Modal if user chooses a new avatar */}
      {isCropOpen && rawImageSrc && (
        <ProfileCropModal
          isOpen={isCropOpen}
          imageSrc={rawImageSrc}
          onClose={() => {
            setIsCropOpen(false);
            setRawImageSrc(null);
          }}
          onApplyCrop={handleApplyCroppedAvatar}
        />
      )}
    </div>
  );
}
