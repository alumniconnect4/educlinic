import React, { useState } from 'react';
import type { User } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  Calendar,
  Link as LinkIcon,
  MessageSquare,
  UserCheck,
  Users,
  Ban,
  Share2,
  GraduationCap,
  Eye,
} from 'lucide-react';
import { getAvatarUrl } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/mockData';
import { Toast } from '../ui/Toast';
import { EditProfileModal } from './EditProfileModal';
import { ProfilePictureModal } from './ProfilePictureModal';
import { VerifiedBadge, DeveloperBadge } from '../../pages/ConnectPage';

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

const formatSocialLink = (url: string) => {
  if (!url) return '';
  return url
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');
};

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
  const { startDirectMessage, currentUser } = useStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

    const isElevatedUser = (u?: Partial<User> | null) =>
      Boolean(
        u?.isDeveloper || u?.role === 'ADMIN' || u?.role === 'SUPER_ADMIN'
      );

    const canMessageWithoutFollow =
      isElevatedUser(currentUser) || isElevatedUser(profileUser);

    if (!isFollowing && !canMessageWithoutFollow) {
      setToastMessage('You must follow this user to send a message.');
      setShowToast(true);
      return;
    }

    startDirectMessage({
      id: profileUser.id,
      name: profileUser.name,
      avatarUrl: profileUser.avatarUrl || profileUser.avatar,
      avatar: profileUser.avatarUrl || profileUser.avatar,
      role: profileUser.role,
      isDeveloper: profileUser.isDeveloper,
      bio: profileUser.bio,
    });
    navigate(`/chat?userId=${profileUser.id}`);
  };

  return (
    <div className="bg-card border border-border/80 rounded-md shadow-2xs overflow-hidden">
      {/* Banner */}
      <div
        className="h-32 sm:h-48 w-full bg-gradient-to-r from-slate-900 via-zinc-900 to-neutral-900 relative"
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

      <div className="px-4 sm:px-6 pb-6 relative pt-0">
        {/* Top bar: Avatar and Action buttons */}
        <div className="flex items-end justify-between -mt-10 sm:-mt-16 mb-4 gap-2 sm:gap-4">
          <div
            className="relative group cursor-pointer shrink-0 select-none"
            onClick={() => setIsPreviewOpen(true)}
            title="Click to view profile picture"
          >
            {/* Instagram story gradient ring on hover */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 opacity-0 group-hover:opacity-100 blur-[2px] transition-all duration-300" />
            <Avatar className="relative h-20 w-20 sm:h-28 sm:w-28 border-4 border-card ring-2 ring-border/50 shadow-md bg-card transition-all duration-200 group-hover:scale-105 group-hover:ring-rose-500/50">
              <AvatarImage
                src={getAvatarUrl(
                  profileUser.name,
                  profileUser.avatarUrl || profileUser.avatar
                )}
                className="object-cover"
              />
              <AvatarFallback className="text-xl sm:text-2xl font-bold bg-[#3b49df]/10 text-[#3b49df]">
                {profileUser.name ? profileUser.name.substring(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 drop-shadow" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 shrink-0 pb-1">
            {!isMe && (
              <>
                <Button
                  onClick={handleMessageClick}
                  variant="outline"
                  size="sm"
                  className={`border-border/80 gap-1.5 text-xs sm:text-sm font-medium ${blockedByMe || hasBlockedMe ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Message
                </Button>

                {blockedByMe ? (
                  <Button
                    onClick={onBlockToggle}
                    disabled={blockLoading}
                    variant="destructive"
                    size="sm"
                    className="gap-1.5 text-xs sm:text-sm font-medium"
                  >
                    <Ban className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Unblock
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={onFollowToggle}
                      disabled={followLoading || hasBlockedMe}
                      size="sm"
                      className={`text-xs sm:text-sm font-medium ${isFollowing
                        ? 'bg-muted text-foreground border border-border/80 hover:bg-red-50 hover:text-red-600 hover:border-red-300 font-medium transition-colors'
                        : 'bg-[#3b49df] hover:bg-[#2f3ab2] text-white font-medium'
                        }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> Following
                        </>
                      ) : (
                        'Follow'
                      )}
                    </Button>
                    <Button
                      onClick={onBlockToggle}
                      disabled={blockLoading}
                      variant="outline"
                      size="sm"
                      className="border-border/80 text-muted-foreground hover:text-red-500 hover:border-red-200 transition-colors px-2"
                      title="Block User"
                    >
                      <Ban className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </>
                )}
              </>
            )}
            {isMe && (
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outline"
                size="sm"
                className="border-border/80 font-medium text-xs sm:text-sm"
              >
                Edit Profile
              </Button>
            )}
            <Button
              onClick={handleShareProfile}
              variant="outline"
              size="sm"
              className="border-border/80 text-muted-foreground hover:text-[#3b49df] hover:border-[#3b49df]/50 transition-colors px-2.5 sm:px-3"
              title="Share Profile"
            >
              <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* Identity & Bio Body */}
        <div className="space-y-2.5">
          {/* Identity & Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
              <span>{profileUser.name}</span>
              {profileUser.isDeveloper && (
                <VerifiedBadge size={20} className="sm:w-[22px] sm:h-[22px]" />
              )}
            </h1>

            {/* Role Badge */}
            <span
              className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0 shadow-2xs ${profileUser.role === 'SUPER_ADMIN'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700/60'
                : profileUser.role === 'ADMIN'
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-700/60'
                  : profileUser.role === 'ALUMNI'
                    ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700/60'
                    : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700/60'
                }`}
            >
              {profileUser.role === 'USER'
                ? 'STUDENT'
                : profileUser.role === 'ALUMNI'
                  ? 'ALUMNI'
                  : profileUser.role === 'SUPER_ADMIN'
                    ? 'SUPER ADMIN'
                    : profileUser.role?.toUpperCase() || 'STUDENT'}
            </span>

            {/* Developer Tag (if developer) */}
            {profileUser.isDeveloper && (
              <DeveloperBadge
                title={profileUser.developerTitle || 'DEVELOPER'}
              />
            )}
          </div>

          {/* Bio Section - Connected & Refined */}
          {profileUser.bio ? (
            <div className="pt-0.5">
              <p className="text-[13.5px] sm:text-[15px] text-foreground/90 font-normal leading-relaxed break-words whitespace-pre-wrap max-w-2xl">
                {profileUser.bio}
              </p>
            </div>
          ) : isMe ? (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground/80 pt-0.5">
              <span className="italic">No bio added yet.</span>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-[#3b49df] hover:underline font-semibold not-italic inline-flex items-center gap-1 cursor-pointer"
              >
                Add a bio
              </button>
            </div>
          ) : null}

          {/* Metadata Labels below bio */}
          <div className="flex flex-wrap items-center gap-x-3.5 sm:gap-x-4 gap-y-2 text-muted-foreground text-xs sm:text-[13px] pt-1 min-w-0 w-full">
            {profileUser.schoolCategory && (
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80 shrink-0 max-w-full">
                <GraduationCap className="h-4 w-4 text-[#3b49df] shrink-0" />
                <span className="truncate">{profileUser.schoolCategory.replace(/_/g, ' ')}</span>
              </span>
            )}

            {profileUser.gender && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted/80 border border-border/70 text-foreground/80 font-medium text-[11px] sm:text-xs shrink-0">
                {profileUser.gender}
              </span>
            )}

            {profileUser.createdAt && (
              <span className="inline-flex items-center gap-1.5 font-medium shrink-0">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3b49df] shrink-0" />
                <span>
                  Joined{' '}
                  {new Date(profileUser.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </span>
            )}

            {profileUser.socialLink && (
              <a
                href={
                  profileUser.socialLink.startsWith('http://') ||
                    profileUser.socialLink.startsWith('https://')
                    ? profileUser.socialLink
                    : `https://${profileUser.socialLink}`
                }
                target="_blank"
                rel="noopener noreferrer"
                title={profileUser.socialLink}
                className="inline-flex items-center gap-1.5 font-medium text-[#3b49df] hover:text-[#2f3ab2] dark:text-blue-400 hover:underline transition-colors min-w-0 max-w-full group"
              >
                <LinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3b49df] dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[200px] sm:max-w-[280px] md:max-w-xs group-hover:underline inline-block">
                  {formatSocialLink(profileUser.socialLink)}
                </span>
              </a>
            )}
          </div>

          {/* Incomplete profile banner for isMe */}
          {isMe &&
            (!profileUser.bio ||
              !profileUser.gender ||
              !profileUser.socialLink) && (
              <div className="mt-3 p-2.5 sm:p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-between gap-3 text-xs sm:text-sm text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-[#3b49df] animate-pulse shrink-0" />
                  <span className="truncate">Your profile is incomplete (missing bio, pronouns, or social link).</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="font-semibold text-[#3b49df] dark:text-blue-400 hover:underline shrink-0 text-xs sm:text-sm cursor-pointer"
                >
                  Complete now
                </button>
              </div>
            )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 border-t border-border/60 mt-5 pt-4 text-center">
          <div
            className="cursor-pointer hover:text-[#3b49df] transition-colors group py-1"
            onClick={() => setActiveTab('posts')}
          >
            <div className="text-lg sm:text-xl font-bold text-foreground group-hover:text-[#3b49df] transition-colors">
              {userPostsCount}
            </div>
            <div className="text-[11px] sm:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Posts
            </div>
          </div>
          <div
            className={`group py-1 ${isMe ? 'cursor-pointer hover:text-[#3b49df] transition-colors' : ''}`}
            onClick={() => isMe && setActiveTab('followers')}
          >
            <div
              className={`text-lg sm:text-xl font-bold text-foreground flex items-center justify-center gap-1 ${isMe ? 'group-hover:text-[#3b49df]' : ''
                } transition-colors`}
            >
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-[#3b49df] transition-colors" />
              {followersCount}
            </div>
            <div className="text-[11px] sm:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
              Followers
            </div>
          </div>
          <div
            className={`group py-1 ${isMe ? 'cursor-pointer hover:text-[#3b49df] transition-colors' : ''}`}
            onClick={() => isMe && setActiveTab('following')}
          >
            <div
              className={`text-lg sm:text-xl font-bold text-foreground flex items-center justify-center gap-1 ${isMe ? 'group-hover:text-[#3b49df]' : ''
                } transition-colors`}
            >
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground group-hover:text-[#3b49df] transition-colors" />
              {followingCount}
            </div>
            <div className="text-[11px] sm:text-xs text-muted-foreground uppercase font-semibold tracking-wider">
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

      <ProfilePictureModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        user={profileUser}
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
