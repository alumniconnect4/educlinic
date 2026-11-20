import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { getAvatarUrl } from '../../lib/utils';
import { X, Sparkles } from 'lucide-react';

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rawAvatar = user.avatarUrl || user.avatar;
  const highResAvatar = getAvatarUrl(user.name, rawAvatar, 800);
  const hasPhoto = Boolean(rawAvatar && rawAvatar.trim() !== '');

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Clean Close Cross Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white transition-all cursor-pointer backdrop-blur-sm z-50 focus:outline-none"
        title="Close (Esc)"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Pure Borderless Profile Picture */}
      <div
        className="relative w-72 h-72 sm:w-96 sm:h-96 md:w-[420px] md:h-[420px] aspect-square rounded-full overflow-hidden shadow-2xl bg-zinc-950 flex items-center justify-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {hasPhoto ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 animate-pulse">
                <Sparkles className="h-8 w-8 text-zinc-600 animate-spin" />
              </div>
            )}
            <img
              src={highResAvatar}
              alt={user.name}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#3b49df]/30 to-purple-900/40 text-white">
            <span className="text-7xl sm:text-8xl font-black tracking-tight">
              {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
