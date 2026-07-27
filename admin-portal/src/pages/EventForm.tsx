import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiRequest } from '../utils/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  MapPin, 
  User, 
  AlignLeft, 
  Image as ImageIcon, 
  ChevronLeft, 
  Loader2, 
  UploadCloud, 
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';

interface EventFormProps {
  mode: 'create' | 'edit';
}

export const EventForm: React.FC<EventFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Other admin profiles
  const [admins, setAdmins] = useState<any[]>([]);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organizedBy: '',
    place: '',
    eventType: 'OFFLINE' as 'OFFLINE' | 'ONLINE',
    visibility: 'GLOBAL' as 'GLOBAL' | 'DEPARTMENTAL',
    startDate: '',
    endDate: '',
    imageUrl: '',
    permissionMode: 'NONE' as 'NONE' | 'HYBRID',
    permittedAdminIds: [] as number[],
  });

  // Image preview state
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load other admins list
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await apiRequest<{ users: any[] }>('/users?role=ADMIN');
        if (response?.users) {
          setAdmins(response.users.filter((u: any) => u.id !== user?.id));
        }
      } catch (err) {
        console.error('Failed to fetch admins list:', err);
      }
    };

    if (user) {
      fetchAdmins();
    }
  }, [user]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      const fetchEvent = async () => {
        try {
          const response = await apiRequest<{ event: any }>(`/events/${id}`);
          const event = response.event;
          
          // Format dates to YYYY-MM-DDTHH:MM for datetime-local input
          const formatDate = (dateStr: string) => {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            const pad = (num: number) => String(num).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          };

          setFormData({
            name: event.name || '',
            description: event.description || '',
            organizedBy: event.organizedBy || '',
            place: event.place || '',
            eventType: event.eventType || 'OFFLINE',
            visibility: event.visibility || 'GLOBAL',
            startDate: formatDate(event.startDate),
            endDate: formatDate(event.endDate),
            imageUrl: event.imageUrl || '',
            permissionMode: event.permissionMode || 'NONE',
            permittedAdminIds: event.permittedAdminIds || [],
          });

          if (event.imageUrl) {
            setImagePreview(event.imageUrl);
          }
        } catch (err: any) {
          console.error(err);
          setError('Failed to fetch event details.');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchEvent();
    }
  }, [mode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({
          ...prev,
          imageUrl: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setImagePreview(url || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate inputs
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Please provide valid start and end dates.');
      return;
    }

    if (end <= start) {
      setError('Event End Date must be after the Start Date.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'create') {
        await apiRequest('/events/create', {
          method: 'POST',
          bodyData: formData,
        });
        setSuccess('Event created successfully! Redirecting...');
        setTimeout(() => {
          navigate('/events');
        }, 1500);
      } else {
        // Update Event
        await apiRequest(`/events/update/${id}`, {
          method: 'PATCH',
          bodyData: formData,
        });
        setSuccess('Event updated successfully! Redirecting...');
        setTimeout(() => {
          navigate('/events');
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while saving the event.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back Button and Title */}
      <div className="flex items-center space-x-3">
        <Link 
          to="/events" 
          className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm text-secondary hover:text-primary transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {mode === 'create' ? 'Fill in details to host a new event.' : 'Update the event details.'}
          </p>
        </div>
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

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Details */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Event Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alumni Networking Seminar"
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-border placeholder-muted-foreground text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Organized By *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="organizedBy"
                  required
                  value={formData.organizedBy}
                  onChange={handleChange}
                  placeholder="e.g. Department of Engineering"
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-border placeholder-muted-foreground text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Location / Place *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="place"
                  required
                  value={formData.place}
                  onChange={handleChange}
                  placeholder="e.g. Auditorium B or Zoom Link"
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-border placeholder-muted-foreground text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Event Type *
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="rounded-xl block w-full px-3 py-3 border border-border text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
                >
                  <option value="OFFLINE">OFFLINE</option>
                  <option value="ONLINE">ONLINE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Visibility *
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="rounded-xl block w-full px-3 py-3 border border-border text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
                >
                  <option value="GLOBAL">GLOBAL (Public)</option>
                  <option value="DEPARTMENTAL">DEPARTMENTAL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Co-Authoring Permission
              </label>
              <select
                name="permissionMode"
                value={formData.permissionMode}
                onChange={handleChange}
                className="rounded-xl block w-full px-3 py-3 border border-border text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
              >
                <option value="NONE">NONE (Only Creator can Edit/Delete)</option>
                <option value="HYBRID">HYBRID (Grant Edit access to selected Admins)</option>
              </select>
            </div>

            {formData.permissionMode === 'HYBRID' && (
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-150">
                <p className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center">
                  <Shield className="h-4 w-4 mr-1.5 text-primary" /> Select Admins with Edit/Delete Access
                </p>
                {admins.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No other administrators found to share access with.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {admins.map((admin) => {
                      const isChecked = formData.permittedAdminIds.includes(admin.id);
                      return (
                        <label key={admin.id} className="flex items-center space-x-3 text-sm text-secondary bg-white p-2.5 rounded-lg border border-gray-200 cursor-pointer hover:border-primary/20 transition-all">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const updatedIds = isChecked
                                ? formData.permittedAdminIds.filter(id => id !== admin.id)
                                : [...formData.permittedAdminIds, admin.id];
                              setFormData(prev => ({
                                ...prev,
                                permittedAdminIds: updatedIds
                              }));
                            }}
                            className="rounded border-border text-primary focus:ring-primary/20 h-4 w-4"
                          />
                          <div className="truncate">
                            <span className="font-semibold block text-xs">{admin.name}</span>
                            <span className="text-[10px] text-muted-foreground block">{admin.email}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="rounded-xl block w-full px-3 py-3 border border-border text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  className="rounded-xl block w-full px-3 py-3 border border-border text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Image and Description */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Event Description
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-muted-foreground">
                  <AlignLeft className="h-5 w-5" />
                </div>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide details about the schedule, agenda, speakers, etc."
                  className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-3 border border-border placeholder-muted-foreground text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            {/* Banner Image Upload / Link */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Event Banner Image
              </label>
              
              <div className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors relative">
                  {imagePreview ? (
                    <div className="relative h-44 rounded-xl overflow-hidden group">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <label className="px-4 py-2 bg-white text-secondary font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all">
                          Change Image
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center py-6">
                      <UploadCloud className="h-10 w-10 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-bold text-secondary">Upload a file</span>
                      <span className="text-xs text-muted-foreground mt-1">Drag and drop or browse (Max 10MB)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

                {/* Paste URL Optional */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                    onChange={handleUrlImageChange}
                    placeholder="Or paste an image URL instead"
                    className="appearance-none rounded-xl relative block w-full pl-10 pr-3 py-2.5 border border-border placeholder-muted-foreground text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-gray-50/50 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
          <Link
            to="/events"
            className="px-5 py-3 rounded-xl border border-border hover:bg-gray-50 text-sm font-semibold text-secondary transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/95 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              mode === 'create' ? 'Create Event' : 'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
