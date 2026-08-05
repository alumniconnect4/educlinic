import React, { useState, useEffect, useCallback } from 'react';
import type { Post } from '../../types';
import {
  FileText,
  Heart,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  Users,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/mockData';
import { Toast } from '../ui/Toast';
import { PostSkeleton } from '../feed/PostSkeleton';
import { stripHtml } from '../../utils/text';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getAvatarUrl } from '../../lib/utils';
import { Button } from '../ui/button';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export type ProfileTab = 'posts' | 'followers' | 'following';

interface ProfilePostListProps {
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
  isMe: boolean;
  profileUserId: number;
  setTotalPosts: (count: number) => void;
}

export const ProfilePostList: React.FC<ProfilePostListProps> = ({
  activeTab,
  setActiveTab,
  isMe,
  profileUserId,
  setTotalPosts,
}) => {
  const navigate = useNavigate();
  const { deletePost } = useStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [followUsers, setFollowUsers] = useState<any[]>([]);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchFollowData = useCallback(
    async (type: 'followers' | 'following') => {
      try {
        setFollowLoading(true);
        const apiUrl =
          import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const res = await fetch(`${apiUrl}/follow/${profileUserId}/${type}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setFollowUsers(data[type] || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFollowLoading(false);
      }
    },
    [profileUserId]
  );

  const fetchPosts = useCallback(
    async (pageNum: number, isInitial = false) => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/posts?authorId=${profileUserId}&page=${pageNum}&limit=5`,
          {
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          setPosts((prev) =>
            isInitial ? data.posts : [...prev, ...data.posts]
          );
          setHasMore(data.hasMore);
          setTotalPosts(data.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [profileUserId, setTotalPosts]
  );

  useEffect(() => {
    if (activeTab === 'posts') {
      setPage(1);
      fetchPosts(1, true);
    } else if (activeTab === 'followers' || activeTab === 'following') {
      fetchFollowData(activeTab);
    }
  }, [fetchPosts, fetchFollowData, activeTab]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleDelete = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    const success = await deletePost(postId);
    if (success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setToastMessage('Post deleted successfully');
      setTotalPosts(posts.length - 1);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center sm:justify-start border-b border-border/60 gap-6 sm:gap-8">
        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 font-semibold text-base transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === 'posts'
              ? 'border-[#3b49df] text-[#3b49df]'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" /> Posts
        </button>
        {isMe && (
          <>
            <button
              onClick={() => setActiveTab('followers')}
              className={`pb-3 font-semibold text-base transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'followers'
                  ? 'border-[#3b49df] text-[#3b49df]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4" /> Followers
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`pb-3 font-semibold text-base transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
                activeTab === 'following'
                  ? 'border-[#3b49df] text-[#3b49df]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserCheck className="h-4 w-4" /> Following
            </button>
          </>
        )}
      </div>

      <div className="space-y-4 sm:space-y-5 relative">
        {activeTab === 'posts' && (
          <>
            {posts.length > 0
              ? posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-card border border-border/80 rounded-md p-5 shadow-2xs hover:border-[#3b49df]/50 cursor-pointer transition-colors relative group"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="text-xl font-extrabold text-foreground hover:text-[#3b49df] transition-colors mb-2 flex-1">
                        {post.title || stripHtml(post.content)}
                      </h3>
                      {isMe && (
                        <div className="relative">
                          <button
                            className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(
                                openMenuId === post.id ? null : post.id
                              );
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {openMenuId === post.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                }}
                              />
                              <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border/60 rounded-md shadow-lg z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={(e) => {
                                    setOpenMenuId(null);
                                    handleDelete(e, post.id);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm text-black hover:text-black/60 cursor-pointer flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {stripHtml(post.content)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5 text-red-500" />{' '}
                          {post._count?.likes ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />{' '}
                          {post._count?.comments ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              : !loading && (
                  <div className="text-center p-12 bg-card rounded-md border border-dashed border-border/80">
                    <p className="text-muted-foreground text-sm">
                      No posts published yet.
                    </p>
                  </div>
                )}

            {loading && (
              <div className="space-y-4">
                <PostSkeleton />
                <PostSkeleton />
              </div>
            )}

            {hasMore && !loading && (
              <div className="flex justify-center mt-6 mb-4">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 bg-muted text-foreground hover:bg-muted/80 rounded-md text-sm font-medium transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}

        {(activeTab === 'followers' || activeTab === 'following') && (
          <div className="flex flex-col gap-4">
            {followLoading ? (
              [1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-card border border-border/80 rounded-md h-20 animate-pulse"
                />
              ))
            ) : followUsers.length > 0 ? (
              followUsers.map((user) => (
                <FollowUserItem key={user.id} user={user} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-muted-foreground bg-card border border-dashed border-border/80 rounded-md">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          visible={true}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </>
  );
};

const FollowUserItem: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const { fetchFollowCounts, toggleFollow, latestFollowUpdate, currentUser } =
    useStore();
  const [followStatus, setFollowStatus] = useState<{
    isFollowing: boolean;
    isFollowingMe: boolean;
  } | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    fetchFollowCounts(user.id).then((res) => setFollowStatus(res));
  }, [user.id, fetchFollowCounts]);

  useEffect(() => {
    if (latestFollowUpdate && followStatus) {
      if (
        latestFollowUpdate.followerId === user.id &&
        latestFollowUpdate.followingId === currentUser?.id
      ) {
        setFollowStatus((prev) =>
          prev
            ? { ...prev, isFollowingMe: latestFollowUpdate.isFollowing }
            : null
        );
      }
      if (
        latestFollowUpdate.followerId === currentUser?.id &&
        latestFollowUpdate.followingId === user.id
      ) {
        setFollowStatus((prev) =>
          prev ? { ...prev, isFollowing: latestFollowUpdate.isFollowing } : null
        );
      }
    }
  }, [latestFollowUpdate, user.id, currentUser?.id]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!followStatus) return;
    setIsToggling(true);
    try {
      await toggleFollow(user.id, followStatus.isFollowing);
      const updated = await fetchFollowCounts(user.id);
      setFollowStatus(updated);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className="bg-card border border-border/80 rounded-md p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/profile?id=${user.id}`)}
    >
      <Avatar className="h-14 w-14 shrink-0">
        <AvatarImage src={getAvatarUrl(user.name, user.avatarUrl || user.avatar)} />
        <AvatarFallback className="bg-muted font-bold">
          {user.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className="font-bold text-foreground hover:text-[#3b49df] truncate transition-colors text-base">
          {user.name}
        </h3>
        <p className="text-xs text-muted-foreground truncate">
          {user.schoolCategory?.replace(/_/g, ' ') || 'Student at EduClinic'}
        </p>
      </div>

      {user.id !== currentUser?.id &&
        (followStatus ? (
          <Button
            variant={followStatus.isFollowing ? 'secondary' : 'default'}
            size="sm"
            onClick={handleToggle}
            disabled={isToggling}
            className="shrink-0 rounded-full min-w-[100px] font-medium"
          >
            {isToggling
              ? '...'
              : followStatus.isFollowing
                ? 'Following'
                : followStatus.isFollowingMe
                  ? 'Follow Back'
                  : 'Follow'}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0 rounded-full min-w-[100px]"
            disabled
          >
            ...
          </Button>
        ))}
      {user.id === currentUser?.id && (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile?id=${user.id}`);
          }}
          className="shrink-0 rounded-full"
        >
          View Profile
        </Button>
      )}
    </div>
  );
};
