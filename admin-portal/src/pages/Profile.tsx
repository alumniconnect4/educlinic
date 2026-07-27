import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../utils/api.ts';
import { 
  Mail, 
  Shield, 
  BookOpen, 
  Edit3, 
  CheckCircle, 
  Loader2, 
  Link as LinkIcon,
  FileText,
  AlertCircle
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable fields
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    gender: user?.gender || '',
    socialLink: user?.socialLink || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await apiRequest<{ user: any }>('/users/profile', {
        method: 'PUT',
        bodyData: formData,
      });
      
      updateUser(response.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">Admin Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your administrative profile and settings.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-border bg-white text-secondary hover:text-primary hover:border-primary/20 text-sm font-bold shadow-sm transition-all"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-primary p-4 rounded-r-lg flex items-start space-x-3 text-red-800 text-sm animate-shake">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-start space-x-3 text-emerald-800 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Success</p>
            <p className="opacity-90">{success}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Overview Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center font-black text-primary text-3xl shadow-inner">
                {user.name?.[0]?.toUpperCase()}
              </div>
            </div>

            <h3 className="text-xl font-extrabold text-secondary">{user.name}</h3>
            <p className="text-xs text-primary font-bold uppercase tracking-wider mt-1">{user.role}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>

            <div className="mt-6 pt-6 border-t border-gray-100 text-left space-y-4 text-sm text-secondary">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{user.role.replace('_', ' ').toLowerCase()} Privilege</span>
              </div>
              {user.schoolCategory && (
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user.schoolCategory.replace(/_/g, ' ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Edit/View details form */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-secondary border-b border-gray-50 pb-3">Update Personal Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-border placeholder-muted-foreground text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="rounded-xl block w-full px-3 py-3 border border-border text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  LinkedIn or Personal Website Link
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <LinkIcon className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="url"
                    name="socialLink"
                    value={formData.socialLink}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-border placeholder-muted-foreground text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Professional Bio
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-muted-foreground">
                    <FileText className="h-5 w-5" />
                  </div>
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself, your department, and your administrative duties."
                    className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-border placeholder-muted-foreground text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: user.name || '',
                      bio: user.bio || '',
                      gender: user.gender || '',
                      socialLink: user.socialLink || '',
                    });
                    setIsEditing(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-border hover:bg-gray-50 text-sm font-semibold text-secondary transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-secondary border-b border-gray-50 pb-3">Personal Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</p>
                  <p className="mt-1 text-sm text-secondary leading-relaxed whitespace-pre-line">
                    {user.bio || <span className="text-muted-foreground italic">No bio provided yet. Click edit to add a bio.</span>}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gender</p>
                    <p className="mt-1 text-sm text-secondary font-medium">
                      {user.gender || <span className="text-muted-foreground italic">Not specified</span>}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LinkedIn / Social Link</p>
                    <p className="mt-1 text-sm">
                      {user.socialLink ? (
                        <a 
                          href={user.socialLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary font-bold hover:underline inline-flex items-center space-x-1"
                        >
                          <span>{user.socialLink}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground italic">No link provided</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
