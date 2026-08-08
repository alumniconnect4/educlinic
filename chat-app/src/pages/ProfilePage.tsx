import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/mockData';
import type { User } from '../types';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfilePostList } from '../components/profile/ProfilePostList';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from '../components/ui/skeleton';

interface ProfilePageProps {
  userId?: number;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userId: propsUserId,
}) => {
  const {
    currentUser,
    toggleFollow,
    fetchFollowCounts,
    blockUser,
    unblockUser,
  } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlUserId = searchParams.get('id')
    ? parseInt(searchParams.get('id')!)
    : undefined;

  const targetId = propsUserId || urlUserId || currentUser?.id;
  const isMe = targetId === currentUser?.id;

  const urlTab = searchParams.get('tab') as
    | 'posts'
    | 'followers'
    | 'following'
    | null;
  const initialTab =
    urlTab && ['posts', 'followers', 'following'].includes(urlTab)
      ? urlTab
      : 'posts';

  const [activeTab, setActiveTabState] = useState<
    'posts' | 'followers' | 'following'
  >(isMe ? initialTab : 'posts');

  useEffect(() => {
    const currentUrlTab = searchParams.get('tab') as
      | 'posts'
      | 'followers'
      | 'following'
      | null;
    const tabToSet =
      currentUrlTab &&
      ['posts', 'followers', 'following'].includes(currentUrlTab)
        ? currentUrlTab
        : 'posts';
    setActiveTabState(isMe ? tabToSet : 'posts');
  }, [searchParams, isMe]);

  const setActiveTab = (tab: 'posts' | 'followers' | 'following') => {
    setActiveTabState(tab);
    setSearchParams((prev) => {
      if (tab === 'posts') {
        prev.delete('tab');
      } else {
        prev.set('tab', tab);
      }
      return prev;
    });
  };

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [blockedByMe, setBlockedByMe] = useState(false);
  const [hasBlockedMe, setHasBlockedMe] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  const [fetchedUser, setFetchedUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (targetId && targetId !== currentUser?.id) {
        setIsLoadingUser(true);
        try {
          const apiUrl =
            import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
          const res = await fetch(`${apiUrl}/users/${targetId}`, {
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            setFetchedUser(data.user);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingUser(false);
        }
      } else {
        setFetchedUser(null);
      }
    };
    fetchUser();
  }, [targetId, currentUser]);

  const profileUser: User | null = isMe ? currentUser : fetchedUser;

  const loadCounts = useCallback(async () => {
    if (!targetId) return;
    const counts = await fetchFollowCounts(targetId);
    setFollowersCount(counts.followersCount);
    setFollowingCount(counts.followingCount);
    setIsFollowing(counts.isFollowing);
    setBlockedByMe(counts.blockedByMe);
    setHasBlockedMe(counts.hasBlockedMe);
  }, [targetId, fetchFollowCounts]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  if (isLoadingUser) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 p-4">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-card p-6 rounded-xl border shadow-sm">
          <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
          <div className="flex-1 space-y-4 text-center md:text-left w-full">
            <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
            <div className="flex justify-center md:justify-start gap-6 pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex justify-center md:justify-start gap-3 pt-4">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </div>
        </div>
        <div className="space-y-4 pt-4">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profileUser) return null;

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    setFollowersCount((c) => (wasFollowing ? c - 1 : c + 1));
    await toggleFollow(profileUser.id, wasFollowing);
    await loadCounts();
    setFollowLoading(false);
  };

  const handleBlockToggle = async () => {
    setBlockLoading(true);
    if (blockedByMe) {
      await unblockUser(profileUser.id);
    } else {
      await blockUser(profileUser.id);
    }
    await loadCounts();
    setBlockLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <ProfileHeader
        profileUser={profileUser}
        isMe={isMe}
        isFollowing={isFollowing}
        blockedByMe={blockedByMe}
        hasBlockedMe={hasBlockedMe}
        followLoading={followLoading}
        blockLoading={blockLoading}
        followersCount={followersCount}
        followingCount={followingCount}
        userPostsCount={totalPosts}
        onFollowToggle={handleFollowToggle}
        onBlockToggle={handleBlockToggle}
        setActiveTab={setActiveTab}
      />
      <ProfilePostList
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMe={isMe}
        profileUserId={profileUser.id}
        setTotalPosts={setTotalPosts}
      />
    </div>
  );
};
