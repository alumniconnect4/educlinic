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

      <div className="px-4 sm:px-6 pb-6 relative pt-0">
        <div className="flex items-end justify-between -mt-12 sm:-mt-20 mb-3 sm:mb-4 gap-2 sm:gap-4">
          <Avatar className="h-20 w-20 sm:h-32 sm:w-32 border-4 border-card ring-2 ring-border/40 shadow-md bg-card shrink-0">
            <AvatarImage
              src={getAvatarUrl(
                profileUser.name,
                profileUser.avatarUrl || profileUser.avatar
              )}
            />
            <AvatarFallback>{profileUser.name.substring(0, 2)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 shrink-0 pb-1">
            {!isMe && (
              <>
                <Button
                  onClick={handleMessageClick}
                  variant="outline"
                  size="sm"
                  className={`border-border/80 gap-1.5 text-xs sm:text-sm font-medium ${blockedByMe || hasBlockedMe ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      className={`text-xs sm:text-sm font-medium ${
                        isFollowing
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

        <div className="space-y-3">
          {/* Identity & Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
              {profileUser.name}
              {profileUser.isDeveloper && <VerifiedBadge size={20} className="sm:w-[22px] sm:h-[22px]" />}
            </h1>

            {/* Role Badge */}
            <span
              className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${
                profileUser.role === 'SUPER_ADMIN'
                  ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                  : profileUser.role === 'ADMIN'
                    ? 'bg-red-50 text-red-800 border-red-200/80'
                    : profileUser.role === 'ALUMNI'
                      ? 'bg-purple-50 text-purple-800 border-purple-200/80'
                      : 'bg-blue-50 text-blue-800 border-blue-200/80'
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

          {/* Bio Section */}
          {profileUser.bio ? (
            <p className="text-sm sm:text-base text-foreground/90 font-normal leading-relaxed break-words whitespace-pre-wrap max-w-2xl">
              {profileUser.bio}
            </p>
          ) : isMe ? (
            <p className="text-xs sm:text-sm text-muted-foreground/70 italic flex items-center gap-1.5">
              <span>No bio added yet.</span>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-[#3b49df] hover:underline font-medium not-italic"
              >
                Add a bio
              </button>
            </p>
          ) : null}

          {/* Metadata Labels below bio */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-xs sm:text-sm pt-0.5">
            {profileUser.schoolCategory && (
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80 shrink-0">
                <GraduationCap className="h-4 w-4 text-[#3b49df] shrink-0" />{' '}
                <span>{profileUser.schoolCategory.replace(/_/g, ' ')}</span>
              </span>
            )}
            {profileUser.gender && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-muted/80 border border-border/70 text-foreground/80 font-medium text-xs shrink-0">
                {profileUser.gender}
              </span>
            )}
            {profileUser.createdAt && (
              <span className="inline-flex items-center gap-1.5 font-medium shrink-0">
                <Calendar className="h-4 w-4 text-[#3b49df] shrink-0" /> Joined{' '}
                {new Date(profileUser.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  year: 'numeric',
                })}
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
                className="inline-flex items-center gap-1.5 font-medium hover:text-[#3b49df] transition-colors max-w-full group shrink-0 min-w-0"
              >
                <LinkIcon className="h-4 w-4 text-[#3b49df] shrink-0 group-hover:scale-110 transition-transform" />{' '}
                <span className="truncate max-w-[190px] xs:max-w-[240px] sm:max-w-[280px] md:max-w-xs group-hover:underline">
                  {profileUser.socialLink
                    .replace(/^https?:\/\//, '')
                    .replace(/^www\./, '')
                    .replace(/\/$/, '')}
                </span>
              </a>
            )}
          </div>

          {/* Complete profile banner for incomplete profiles */}
          {isMe &&
            (!profileUser.bio ||
              !profileUser.gender ||
              !profileUser.socialLink) && (
              <div className="mt-2.5 p-2.5 sm:p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3 text-xs sm:text-sm text-blue-900">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-2 w-2 rounded-full bg-[#3b49df] animate-pulse shrink-0" />
                  <span className="truncate">Your profile is incomplete (missing bio, pronouns, or social link).</span>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="font-semibold text-[#3b49df] hover:underline shrink-0 text-xs sm:text-sm"
                >
                  Complete now
                </button>
              </div>
            )}
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
