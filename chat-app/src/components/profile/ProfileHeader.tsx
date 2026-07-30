import React, { useState } from 'react';
import type { User } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  MapPin,
  Calendar,
  Link as LinkIcon,
  MessageSquare,
  UserCheck,
  Users,
  Ban,
  Share2,
  GraduationCap,
} from 'lucide-react';
import { getAvatarUrl } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/mockData';
import { Toast } from '../ui/Toast';
import { EditProfileModal } from './EditProfileModal';

interface ProfileHeaderProps {
  profileUser: User;
  isMe: boolean;
  isFollowing: boolean;
  blockedByMe: boolean;
  hasBlockedMe: boolean;
  followLoading: boolean;
  blockLoading: boolean;
  followersCount: number;
  followingCount: number;
  userPostsCount: number;
  onFollowToggle: () => void;
  onBlockToggle: () => void;
  setActiveTab: (tab: 'posts' | 'followers' | 'following') => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileUser,
  isMe,
  isFollowing,
  blockedByMe,
  hasBlockedMe,
  followLoading,
  blockLoading,
  followersCount,
  followingCount,
  userPostsCount,
  onFollowToggle,
  onBlockToggle,
  setActiveTab,
}) => {
  const navigate = useNavigate();
  const { startDirectMessage } = useStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleShareProfile = async () => {
    try {
      const url = `${window.location.origin}/profile?id=${profileUser.id}`;
      await navigator.clipboard.writeText(url);
      setToastMessage('Profile URL copied to clipboard!');
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleMessageClick = () => {
    if (blockedByMe || hasBlockedMe) {
      setToastMessage('You cannot message this user due to a block.');
      setShowToast(true);
      return;
    }
    if (!isFollowing) {
      setToastMessage('You must follow this user to send a message.');
      setShowToast(true);
      return;
    }

    startDirectMessage({
      id: profileUser.id,
      name: profileUser.name,
      avatar: profileUser.avatar,
      bio: profileUser.bio,
    });
    navigate(`/chat?userId=${profileUser.id}`);
  };

  return (
    <div className="bg-card border border-border/80 rounded-md shadow-2xs overflow-hidden">
      <div
        className="h-36 sm:h-48 w-full bg-black relative"
        style={
          profileUser.coverImage
            ? {
                backgroundImage: `url(${profileUser.coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      />

      <div className="px-6 pb-6 relative pt-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
          <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-card ring-2 ring-border/40 shadow-md bg-card shrink-0">
            <AvatarImage
              src={getAvatarUrl(profileUser.name, profileUser.avatarUrl || profileUser.avatar)}
            />
            <AvatarFallback>{profileUser.name.substring(0, 2)}</AvatarFallback>
          </Avatar>

          <div className="flex gap-2 shrink-0">
            {!isMe && (
              <>
                <Button
                  onClick={handleMessageClick}
                  variant="outline"
                  className={`border-border/80 gap-2 ${blockedByMe || hasBlockedMe ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <MessageSquare className="h-4 w-4" /> Message
                </Button>

                {blockedByMe ? (
                  <Button
                    onClick={onBlockToggle}
                    disabled={blockLoading}
                    variant="destructive"
                    className="gap-2 font-medium"
                  >
                    <Ban className="h-4 w-4" /> Unblock
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={onFollowToggle}
                      disabled={followLoading || hasBlockedMe}
                      className={
                        isFollowing
                          ? 'bg-muted text-foreground border border-border/80 hover:bg-red-50 hover:text-red-600 hover:border-red-300 font-medium transition-colors'
                          : 'bg-[#3b49df] hover:bg-[#2f3ab2] text-white font-medium'
                      }
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" /> Following
                        </>
                      ) : (
                        'Follow'
                      )}
                    </Button>
                    <Button
                      onClick={onBlockToggle}
                      disabled={blockLoading}
                      variant="outline"
                      className="border-border/80 text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors px-2"
                      title="Block User"
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </>
            )}
            {isMe &&
              (!profileUser.bio ||
                !profileUser.gender ||
                !profileUser.socialLink) && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-sm font-medium text-[#3b49df] hover:text-[#2f3ab2] transition-colors flex items-center gap-1.5 mr-1"
                >
                  <div className="h-2 w-2 rounded-full bg-[#3b49df] animate-pulse" />
                  Complete your profile
                </button>
              )}
            {isMe && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outline"
                className="border-border/80 font-medium"
              >
                Edit Profile
              </Button>
            )}
            <Button
              onClick={handleShareProfile}
              variant="outline"
              className="border-border/80 text-muted-foreground hover:text-[#3b49df] hover:border-[#3b49df]/50 transition-colors px-3"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-left mt-2">
          <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {profileUser.name}
            </h1>
            <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded border border-gray-300 bg-white text-gray-700 shadow-2xs uppercase tracking-wider shrink-0 my-auto">
              {profileUser.role === 'USER' ? 'Student' : profileUser.role === 'ALUMNI' ? 'Alumni' : profileUser.role === 'SUPER_ADMIN' ? 'Super Admin' : profileUser.role || 'Student'}
            </span>
          </div>
          {profileUser.bio && (
            <p className="text-base text-muted-foreground max-w-2xl leading-relaxed mt-2">
              {profileUser.bio}
            </p>
          )}

          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-muted-foreground text-xs sm:text-sm pt-2">
            {profileUser.gender && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/50 text-foreground/80 font-medium">
                {profileUser.gender}
              </span>
            )}
            {profileUser.schoolCategory && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-[#3b49df]" />{' '}
                {profileUser.schoolCategory.replace('_', ' ')}
              </span>
            )}
            {profileUser.createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#3b49df]" /> Joined{' '}
                {new Date(profileUser.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
            {profileUser.socialLink && (
              <a
                href={profileUser.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#3b49df] transition-colors"
              >
                <LinkIcon className="h-4 w-4" />{' '}
                {profileUser.socialLink.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-border/60 mt-6 pt-4 text-center">
          <div
            className="cursor-pointer hover:text-[#3b49df] transition-colors group"
            onClick={() => setActiveTab('posts')}
          >
            <div className="text-xl font-bold text-foreground group-hover:text-[#3b49df]">
              {userPostsCount}
            </div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">
              Posts
            </div>
          </div>
          <div
            className={`group ${isMe ? 'cursor-pointer hover:text-[#3b49df] transition-colors' : ''}`}
            onClick={() => isMe && setActiveTab('followers')}
          >
            <div
              className={`text-xl font-bold text-foreground flex items-center justify-center gap-1 ${isMe ? 'group-hover:text-[#3b49df]' : ''}`}
            >
              <Users className="h-4 w-4" />
              {followersCount}
            </div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">
              Followers
            </div>
          </div>
          <div
            className={`group ${isMe ? 'cursor-pointer hover:text-[#3b49df] transition-colors' : ''}`}
            onClick={() => isMe && setActiveTab('following')}
          >
            <div
              className={`text-xl font-bold text-foreground flex items-center justify-center gap-1 ${isMe ? 'group-hover:text-[#3b49df]' : ''}`}
            >
              <Users className="h-4 w-4" />
              {followingCount}
            </div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">
              Following
            </div>
          </div>
        </div>
      </div>
      <Toast
        message={toastMessage}
        visible={showToast}
        onDismiss={() => setShowToast(false)}
      />
      {isMe && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          user={profileUser}
        />
      )}
    </div>
  );
};
