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

      <div className="px-6 pb-6 relative pt-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
          <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-card ring-2 ring-border/40 shadow-md bg-card shrink-0">
            <AvatarImage
              src={getAvatarUrl(
                profileUser.name,
                profileUser.avatarUrl || profileUser.avatar
              )}
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

        <div className="space-y-3 mt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                {profileUser.name}
                {profileUser.isDeveloper && <VerifiedBadge size={22} />}
              </h1>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap shrink-0">
              {/* Default Role Tag */}
              <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-600 uppercase tracking-wider shrink-0">
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
          </div>

          {profileUser.bio && (
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {profileUser.bio}
            </p>
          )}

          {/* Metadata Labels below buttons & name */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-muted-foreground text-xs sm:text-sm pt-1">
            {profileUser.schoolCategory && (
              <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                <GraduationCap className="h-4 w-4 text-[#3b49df]" />{' '}
                {profileUser.schoolCategory.replace(/_/g, ' ')}
              </span>
            )}
            {profileUser.gender && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/60 border border-border/60 text-foreground/80 font-semibold text-xs">
                {profileUser.gender}
              </span>
            )}
            {profileUser.createdAt && (
              <span className="flex items-center gap-1.5 font-medium">
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
                className="flex items-center gap-1.5 font-medium hover:text-[#3b49df] transition-colors"
              >
                <LinkIcon className="h-4 w-4 text-[#3b49df]" />{' '}
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
