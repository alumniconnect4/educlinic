'use client';

import { useUserStore } from '@/store/useUserStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Eye, Trash2, Upload, CheckCircle2, X, Loader2 } from 'lucide-react';

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<'USER' | 'ALUMNI'>('USER');
  const [idCardUrl, setIdCardUrl] = useState<string>('');
  const [degreeUrl, setDegreeUrl] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [previewModal, setPreviewModal] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const compressImage = (
    file: File,
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.7
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(e.target?.result as string);
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'idCard' | 'degree' | 'avatar'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      const msg = 'File size is too large. Please select a file under 20MB.';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file);
      if (type === 'idCard') setIdCardUrl(compressedDataUrl);
      if (type === 'degree') setDegreeUrl(compressedDataUrl);
      if (type === 'avatar') setAvatarUrl(compressedDataUrl);
    } catch (err) {
      console.error('Failed to process image file', err);
      toast.error('Failed to process file. Please try another image.');
    }
    e.target.value = '';
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (activeTab === 'register') {
        const role = e.target.role.value as 'USER' | 'ALUMNI';

        if (role === 'USER' && !idCardUrl) {
          setError('Student registration requires uploading an ID Card.');
          toast.error('Student registration requires uploading an ID Card.');
          setIsLoading(false);
          return;
        }

        if (role === 'ALUMNI' && !idCardUrl && !degreeUrl) {
          setError(
            'Alumni registration requires uploading either an ID Card or Degree Certificate.'
          );
          toast.error(
            'Alumni registration requires uploading either an ID Card or Degree Certificate.'
          );
          setIsLoading(false);
          return;
        }

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
          {
            name: e.target.name.value,
            email: e.target.email.value,
            password: e.target.password.value,
            role,
            schoolCategory: e.target.schoolCategory.value,
            avatarUrl: avatarUrl || undefined,
            idCardUrl,
            degreeUrl,
          },
          { withCredentials: true }
        );

        e.target.reset();
        setIdCardUrl('');
        setDegreeUrl('');
        setAvatarUrl('');
        if (res.data.user?.isVerified === false) {
          setSuccess(
            'Registration request submitted! Your account is pending administrator review and approval. An administrator will verify your application soon.'
          );
          toast.info(
            'Registration submitted! Awaiting admin approval before you can log in.'
          );
          setActiveTab('login');
        } else {
          useUserStore.getState().setUser(res.data.user);
          toast.success('Registered successfully! Logging you in...');
          router.push('/');
        }
      } else {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            email: e.target.email.value,
            password: e.target.password.value,
          },
          { withCredentials: true }
        );

        e.target.reset();
        useUserStore.getState().setUser(res.data.user, res.data.sessionId);
        toast.success('Logged in successfully!');
        router.push('/');
      }
    } catch (err: any) {
      let msg = err.response?.data?.message;
      if (err.response?.status === 413 || err.status === 413) {
        msg =
          'File size is too large (HTTP 413 Request Entity Too Large). Please select smaller image files or documents.';
      }
      if (!msg) msg = 'Something went wrong';
      setError(msg);
      toast.error(msg);
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md lg:max-w-lg z-10 relative">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden relative border-t-4 border-[#d60000]">
        <div className="relative flex p-1 bg-gray-100 border-b border-gray-200">
          <div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded shadow-sm border border-gray-200 transition-all duration-300 ease-in-out"
            style={{
              transform:
                activeTab === 'login' ? 'translateX(0)' : 'translateX(100%)',
              left: activeTab === 'login' ? '4px' : 'calc(4px)',
            }}
          />
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`relative flex-1 py-3 text-center  font-bold text-sm z-10 transition-colors duration-300 ${activeTab === 'login' ? 'text-[#d60000]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`relative flex-1 py-3 text-center font-bold text-sm z-10 transition-colors duration-300 ${activeTab === 'register' ? 'text-[#d60000]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Register
          </button>
        </div>

        <div className="p-5 sm:p-8 relative">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {activeTab === 'login' ? 'Welcome Back!' : 'Join the Network'}
          </h2>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded">
              {success}
            </div>
          )}

          <form className="relative overflow-hidden" onSubmit={handleSubmit}>
            <div
              className="transition-all duration-500 ease-in-out grid"
              style={{
                gridTemplateRows: activeTab === 'register' ? '1fr' : '0fr',
                opacity: activeTab === 'register' ? 1 : 0,
                visibility: activeTab === 'register' ? 'visible' : 'hidden',
                marginBottom: activeTab === 'register' ? '1rem' : '0',
              }}
            >
              <div className="overflow-hidden space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Role
                    </label>
                    <select
                      name="role"
                      value={selectedRole}
                      onChange={(e) =>
                        setSelectedRole(e.target.value as 'USER' | 'ALUMNI')
                      }
                      className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white text-gray-700"
                    >
                      <option value="USER">Student</option>
                      <option value="ALUMNI">Alumni</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      School
                    </label>
                    <select
                      name="schoolCategory"
                      required={activeTab === 'register'}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white text-gray-700 text-sm"
                    >
                      <option value="">Select School</option>
                      <option value="School_of_Engineering">
                        School of Engineering
                      </option>
                      <option value="School_of_Sciences">
                        School of Sciences
                      </option>
                      <option value="School_of_Agriculture">
                        School of Agriculture
                      </option>
                      <option value="School_of_Business_Studies">
                        School of Business Studies
                      </option>
                      <option value="School_of_Computer_Applications">
                        School of Computer Applications
                      </option>
                      <option value="School_of_Humanities">
                        School of Humanities
                      </option>
                      <option value="School_of_Education">
                        School of Education
                      </option>
                      <option value="School_of_Law">School of Law</option>
                      <option value="School_of_Pharmacy">
                        School of Pharmacy
                      </option>
                    </select>
                  </div>
                </div>

                {/* Profile Avatar Upload (Compulsory) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Profile Avatar{' '}
                    <span className="text-[#d60000]">* Required</span>
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'avatar')}
                    className="hidden"
                    id="profile-avatar-upload"
                  />

                  {avatarUrl ? (
                    <div className="flex items-center justify-between border border-green-200 rounded-md p-2 bg-green-50/60 shadow-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewModal({
                              url: avatarUrl,
                              title: 'Profile Avatar',
                            })
                          }
                          className="relative group flex-shrink-0 cursor-pointer"
                          title="Click to view full avatar"
                        >
                          <img
                            src={avatarUrl}
                            alt="Avatar Preview"
                            className="w-10 h-10 object-cover rounded-full border border-green-300 group-hover:opacity-80 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="w-3.5 h-3.5 text-white" />
                          </div>
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-xs font-semibold text-green-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            <span className="truncate">Avatar Uploaded</span>
                          </div>
                          <span className="text-[11px] text-gray-500 block truncate">
                            Compulsory profile image set
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewModal({
                              url: avatarUrl,
                              title: 'Profile Avatar',
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <label
                          htmlFor="profile-avatar-upload"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-200/70 hover:bg-gray-200 px-2 py-1 rounded cursor-pointer transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Change
                        </label>
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="inline-flex items-center justify-center p-1 text-red-600 hover:text-red-800 bg-red-100/60 hover:bg-red-100 rounded transition-colors cursor-pointer"
                          title="Remove avatar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-300 rounded-md p-2.5 bg-gray-50 text-center hover:bg-gray-100/80 transition-colors">
                      <label
                        htmlFor="profile-avatar-upload"
                        className="cursor-pointer flex flex-col items-center justify-center gap-1"
                      >
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-600 font-medium hover:text-[#d60000]">
                          Click to upload Profile Avatar Image (JPG/PNG)
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Verification Document Uploads */}
                <div className="space-y-3 pt-1">
                  {selectedRole === 'USER' ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Student ID Card{' '}
                        <span className="text-[#d60000]">* Required</span>
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'idCard')}
                        className="hidden"
                        id="student-id-upload"
                      />

                      {idCardUrl ? (
                        <div className="flex items-center justify-between border border-green-200 rounded-md p-2 bg-green-50/60 shadow-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewModal({
                                  url: idCardUrl,
                                  title: 'Student ID Card',
                                })
                              }
                              className="relative group flex-shrink-0 cursor-pointer"
                              title="Click to view full image"
                            >
                              <img
                                src={idCardUrl}
                                alt="ID Card Preview"
                                className="w-11 h-11 object-cover rounded border border-green-300 group-hover:opacity-80 transition-opacity"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </button>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 text-xs font-semibold text-green-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                                <span className="truncate">
                                  ID Card Uploaded
                                </span>
                              </div>
                              <span className="text-[11px] text-gray-500 block truncate">
                                Ready for verification
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewModal({
                                  url: idCardUrl,
                                  title: 'Student ID Card',
                                })
                              }
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </button>
                            <label
                              htmlFor="student-id-upload"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-200/70 hover:bg-gray-200 px-2 py-1 rounded cursor-pointer transition-colors"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Change
                            </label>
                            <button
                              type="button"
                              onClick={() => setIdCardUrl('')}
                              className="inline-flex items-center justify-center p-1 text-red-600 hover:text-red-800 bg-red-100/60 hover:bg-red-100 rounded transition-colors cursor-pointer"
                              title="Remove image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed border-gray-300 rounded-md p-3 bg-gray-50 text-center hover:bg-gray-100/80 transition-colors">
                          <label
                            htmlFor="student-id-upload"
                            className="cursor-pointer flex flex-col items-center justify-center gap-1"
                          >
                            <Upload className="w-5 h-5 text-gray-400" />
                            <span className="text-xs text-gray-600 font-medium hover:text-[#d60000]">
                              Click to upload Student ID Card (JPG/PNG)
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-0.5">
                        Verification Document{' '}
                        <span className="text-[#d60000]">
                          * (ID Card or Degree)
                        </span>
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'idCard')}
                        className="hidden"
                        id="alumni-id-upload"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'degree')}
                        className="hidden"
                        id="alumni-degree-upload"
                      />

                      <div className="space-y-2">
                        {/* ID Card section */}
                        {idCardUrl ? (
                          <div className="flex items-center justify-between border border-green-200 rounded-md p-2 bg-green-50/60 shadow-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewModal({
                                    url: idCardUrl,
                                    title: 'Alumni ID Card',
                                  })
                                }
                                className="relative group flex-shrink-0 cursor-pointer"
                              >
                                <img
                                  src={idCardUrl}
                                  alt="ID Card Preview"
                                  className="w-10 h-10 object-cover rounded border border-green-300 group-hover:opacity-80 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="w-3 h-3 text-white" />
                                </div>
                              </button>
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-green-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />{' '}
                                  ID Card Attached
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewModal({
                                    url: idCardUrl,
                                    title: 'Alumni ID Card',
                                  })
                                }
                                className="px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                              <label
                                htmlFor="alumni-id-upload"
                                className="px-2 py-0.5 text-xs font-semibold text-gray-700 bg-gray-200/70 hover:bg-gray-200 rounded cursor-pointer transition-colors"
                              >
                                Change
                              </label>
                              <button
                                type="button"
                                onClick={() => setIdCardUrl('')}
                                className="p-1 text-red-600 bg-red-100/60 hover:bg-red-100 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {/* Degree section */}
                        {degreeUrl ? (
                          <div className="flex items-center justify-between border border-green-200 rounded-md p-2 bg-green-50/60 shadow-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewModal({
                                    url: degreeUrl,
                                    title: 'Degree Certificate',
                                  })
                                }
                                className="relative group flex-shrink-0 cursor-pointer"
                              >
                                <img
                                  src={degreeUrl}
                                  alt="Degree Preview"
                                  className="w-10 h-10 object-cover rounded border border-green-300 group-hover:opacity-80 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye className="w-3 h-3 text-white" />
                                </div>
                              </button>
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-green-800 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />{' '}
                                  Degree Attached
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewModal({
                                    url: degreeUrl,
                                    title: 'Degree Certificate',
                                  })
                                }
                                className="px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" /> View
                              </button>
                              <label
                                htmlFor="alumni-degree-upload"
                                className="px-2 py-0.5 text-xs font-semibold text-gray-700 bg-gray-200/70 hover:bg-gray-200 rounded cursor-pointer transition-colors"
                              >
                                Change
                              </label>
                              <button
                                type="button"
                                onClick={() => setDegreeUrl('')}
                                className="p-1 text-red-600 bg-red-100/60 hover:bg-red-100 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {/* Upload buttons grid if either/both missing */}
                        {(!idCardUrl || !degreeUrl) && (
                          <div className="grid grid-cols-2 gap-3">
                            {!idCardUrl && (
                              <div className="border border-dashed border-gray-300 rounded-md p-2.5 bg-gray-50 text-center hover:bg-gray-100/80 transition-colors">
                                <label
                                  htmlFor="alumni-id-upload"
                                  className="cursor-pointer block"
                                >
                                  <span className="text-[11px] text-gray-600 font-semibold hover:text-[#d60000] flex items-center justify-center gap-1">
                                    <Upload className="w-3.5 h-3.5 text-gray-400" />{' '}
                                    Upload ID Card
                                  </span>
                                </label>
                              </div>
                            )}
                            {!degreeUrl && (
                              <div className="border border-dashed border-gray-300 rounded-md p-2.5 bg-gray-50 text-center hover:bg-gray-100/80 transition-colors">
                                <label
                                  htmlFor="alumni-degree-upload"
                                  className="cursor-pointer block"
                                >
                                  <span className="text-[11px] text-gray-600 font-semibold hover:text-[#d60000] flex items-center justify-center gap-1">
                                    <Upload className="w-3.5 h-3.5 text-gray-400" />{' '}
                                    Upload Degree
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div
                    className={`transition-all duration-300 ${activeTab === 'login' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                    <a
                      href="#"
                      className="text-xs text-[#d60000] hover:underline font-bold"
                    >
                      Forgot?
                    </a>
                  </div>
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:ring-1 focus:ring-[#d60000] focus:border-[#d60000] outline-none transition-all bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div
              className="transition-all duration-500 ease-in-out grid"
              style={{
                gridTemplateRows: activeTab === 'register' ? '1fr' : '0fr',
                opacity: activeTab === 'register' ? 1 : 0,
                marginTop: activeTab === 'register' ? '1rem' : '0',
              }}
            >
              <div className="overflow-hidden">
                <div className="flex items-start space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required={activeTab === 'register'}
                    className="mt-1 rounded border-gray-300 text-[#d60000] focus:ring-[#d60000] w-4 h-4 cursor-pointer"
                  />
                  <label
                    htmlFor="terms"
                    className="text-xs text-gray-600 leading-relaxed cursor-pointer font-medium"
                  >
                    I agree to connect with the BFGI student network and abide
                    by the community guidelines.
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#d60000] hover:bg-[#b80000] text-white font-bold py-3 rounded-md transition-all mt-6 shadow-md uppercase tracking-wider text-sm flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {activeTab === 'login'
                      ? 'Logging in...'
                      : 'Submitting Request...'}
                  </span>
                </>
              ) : (
                <span>
                  {activeTab === 'login' ? 'Login' : 'Send Approval Request'}
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Modal for previewing uploaded verification document */}
        {previewModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setPreviewModal(null)}
          >
            <div
              className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#d60000]" />
                  {previewModal.title} Preview
                </h3>
                <button
                  type="button"
                  onClick={() => setPreviewModal(null)}
                  className="text-gray-400 hover:text-gray-700 rounded-lg p-1 hover:bg-gray-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 flex items-center justify-center bg-gray-900/5 overflow-auto flex-1">
                <img
                  src={previewModal.url}
                  alt={previewModal.title}
                  className="max-h-[60vh] max-w-full object-contain rounded shadow-lg border border-gray-200"
                />
              </div>
              <div className="p-3 border-t border-gray-100 flex justify-end bg-gray-50">
                <button
                  type="button"
                  onClick={() => setPreviewModal(null)}
                  className="px-4 py-1.5 text-xs font-bold bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
