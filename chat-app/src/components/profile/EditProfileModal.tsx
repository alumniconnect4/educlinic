import React, { useState } from 'react';
import { useStore } from '../../store/mockData';
import type { User } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getAvatarUrl } from '../../lib/utils';
import { Camera } from 'lucide-react';
import { ImageCropModal } from './ImageCropModal';

interface EditProfileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onOpenChange,
  user,
}) => {
  const { updateProfile } = useStore();
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [gender, setGender] = useState(user.gender || '');
  const [socialLink, setSocialLink] = useState(user.socialLink || '');
  const [avatarUrl, setAvatarUrl] = useState(
    user.avatarUrl || user.avatar || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Crop & Adjust Modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so user can re-select the same file if needed
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImageSrc(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCroppedAvatar = (croppedDataUrl: string) => {
    setAvatarUrl(croppedDataUrl);
    setCropModalOpen(false);
    setSelectedImageSrc(null);
  };

  const handleCloseCropModal = () => {
    setCropModalOpen(false);
    setSelectedImageSrc(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateProfile(name, bio, gender, socialLink, avatarUrl);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center space-y-2 pb-2">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-border shadow-sm">
                  <AvatarImage src={getAvatarUrl(name, avatarUrl)} />
                  <AvatarFallback className="text-xl font-bold bg-[#3b49df]/10 text-[#3b49df]">
                    {name ? name.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Change Avatar"
                >
                  <Camera className="h-6 w-6" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="avatar-upload"
                  className="text-xs font-medium text-[#3b49df] hover:underline cursor-pointer"
                >
                  Upload new picture
                </label>
              </div>
            </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio (30-40 words)</label>
            <Textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pronouns</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Pronouns</option>
              <option value="he/him">he/him</option>
              <option value="she/her">she/her</option>
              <option value="they/them">they/them</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Social Link</label>
            <Input
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Crop & Adjust Image Modal */}
    <ImageCropModal
      isOpen={cropModalOpen}
      imageSrc={selectedImageSrc || ''}
      onClose={handleCloseCropModal}
      onApplyCrop={handleApplyCroppedAvatar}
    />
  </>
);
};
