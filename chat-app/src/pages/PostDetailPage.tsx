import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, getAuthHeaders } from '../store/mockData';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Heart,
  MessageSquare,
  Share2,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';
import { getAvatarUrl } from '../lib/utils';
import { CommentSection } from '../components/comments/CommentSection';
import { PostDetailSidebar } from '../components/post-detail/PostDetailSidebar';
import { PostContent } from '../components/post-detail/PostContent';
import { PostAuthorCard } from '../components/post-detail/PostAuthorCard';
import { PostMoreFromAuthor } from '../components/post-detail/PostMoreFromAuthor';
import { Toast } from '../components/ui/Toast';
import { Skeleton } from '../components/ui/skeleton';
import type { Post } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);
  const {
    posts,
    users,
    toggleLike,
    toggleFollow,
    fetchFollowCounts,
    currentUser,
    upsertPost,
  } = useStore();

  const storePost = posts.find((p) => p.id === postId);
  const [currentPost, setCurrentPost] = useState<Post | null>(storePost || null);
  const [loading, setLoading] = useState<boolean>(!storePost);
  const [notFound, setNotFound] = useState<boolean>(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Sync with store if store updates for this post
  useEffect(() => {
    const sp = posts.find((p) => p.id === postId);
    if (sp) {
      setCurrentPost((prev) => {
        if (!prev) return sp;
        // Only update if like status or count changed in store
        if (
          prev.isLiked !== sp.isLiked ||
          (prev._count?.likes ?? prev.likes) !== (sp._count?.likes ?? sp.likes)
        ) {
          return {
            ...prev,
            isLiked: sp.isLiked,
            _count: {
              ...prev._count,
              likes: sp._count?.likes ?? sp.likes ?? 0,
              comments: prev._count?.comments ?? sp._count?.comments ?? 0,
            },
            likes: sp._count?.likes ?? sp.likes ?? 0,
          };
        }
        return prev;
      });
    }
  }, [posts, postId]);

  // Fetch fresh post data from backend
  useEffect(() => {
    let isMounted = true;
    const fetchPost = async () => {
      if (!posts.find((p) => p.id === postId)) {
        setLoading(true);
      }
      setNotFound(false);

      try {
        const res = await fetch(`${API_BASE}/posts/${postId}`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        if (res.ok) {
          const data: Post = await res.json();
          if (isMounted) {
            setCurrentPost(data);
            upsertPost(data);
            setLoading(false);
          }
        } else if (res.status === 404) {
          if (isMounted) {
            setNotFound(true);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch post detail', err);
        if (isMounted) {
          if (!currentPost) setNotFound(true);
          setLoading(false);
        }
      }
    };

    if (postId) {
      fetchPost();
    }

    return () => {
      isMounted = false;
    };
  }, [postId, upsertPost]);

  const rawAuthor = currentPost?.author || currentPost?.createdBy;
  const authorUser =
    rawAuthor?.id && currentUser?.id && rawAuthor.id === currentUser.id
      ? { ...rawAuthor, ...currentUser }
      : users.find((u) => u.id === rawAuthor?.id) || rawAuthor;

  const authorId = authorUser?.id;
  const isMe = authorId === currentUser?.id;

  const loadFollowState = useCallback(async () => {
    if (!authorId || isMe) return;
    const counts = await fetchFollowCounts(authorId);
    setIsFollowing(counts.isFollowing);
  }, [authorId, isMe, fetchFollowCounts]);

  useEffect(() => {
    loadFollowState();
  }, [loadFollowState]);

  const handleShareMobile = useCallback(() => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url).then(() => setToastVisible(true));
  }, [postId]);

  const handleLike = async () => {
    if (!currentPost) return;
    const currentlyLiked = currentPost.isLiked ?? false;
    const count = currentPost._count?.likes ?? currentPost.likes ?? 0;
    const nextLiked = !currentlyLiked;
    const nextCount = currentlyLiked ? Math.max(0, count - 1) : count + 1;

    // Optimistic local update
    setCurrentPost((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        isLiked: nextLiked,
        _count: {
          ...prev._count,
          likes: nextCount,
          comments: prev._count?.comments ?? prev.comments?.length ?? 0,
        },
        likes: nextCount,
      };
    });

    // Global store & backend API call
    await toggleLike(currentPost.id);
  };

  const handleFollowToggle = async () => {
    if (!authorUser || isMe) return;
    setFollowLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    await toggleFollow(authorUser.id, wasFollowing);
    await loadFollowState();
    setFollowLoading(false);
  };

  if (loading && !currentPost) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mx-auto w-full max-w-[1240px] animate-pulse">
        <div className="hidden lg:flex flex-col items-center gap-6 w-14 shrink-0 pt-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="flex-1 min-w-0 bg-card rounded-md border border-border/80 p-6 sm:p-12 space-y-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
        <div className="hidden lg:flex flex-col gap-4 w-80 shrink-0">
          <Skeleton className="h-48 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (notFound || !currentPost) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="text-xl font-bold">Post not found</div>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to feed
        </Button>
      </div>
    );
  }

  const isLiked = currentPost.isLiked ?? false;
  const likesCount = currentPost._count?.likes ?? currentPost.likes ?? 0;
  const commentsCount =
    currentPost._count?.comments ?? currentPost.comments?.length ?? 0;

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mx-auto w-full max-w-[1240px]">
      <PostDetailSidebar
        postId={currentPost.id}
        isLiked={isLiked}
        likesCount={likesCount}
        commentsCount={commentsCount}
        onLike={handleLike}
      />

      <article className="flex-1 min-w-0 bg-card rounded-md border border-border/80 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-8 pb-0 md:px-12 md:pt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar
                className="h-11 w-11 border border-border/60 cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                  if (authorId) {
                    navigate(isMe ? '/profile' : `/profile?id=${authorId}`);
                  } else {
                    navigate('/profile');
                  }
                }}
              >
                <AvatarImage
                  src={getAvatarUrl(
                    authorUser?.name,
                    authorUser?.avatarUrl || authorUser?.avatar
                  )}
                />
                <AvatarFallback>
                  {authorUser?.name?.substring(0, 2) || 'DEV'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div
                  className="font-bold text-base text-foreground hover:text-[#3b49df] cursor-pointer transition-colors"
                  onClick={() => {
                    if (authorId) {
                      navigate(isMe ? '/profile' : `/profile?id=${authorId}`);
                    } else {
                      navigate('/profile');
                    }
                  }}
                >
                  {authorUser?.name || 'DEV Contributor'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Posted on{' '}
                  {new Date(currentPost.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  • 4 min read
                </div>
              </div>
            </div>

            {!isMe && (
              <Button
                onClick={handleFollowToggle}
                disabled={followLoading}
                size="sm"
                className={`rounded-md font-medium text-sm hidden sm:flex cursor-pointer ${
                  isFollowing
                    ? 'bg-muted text-foreground border border-border/80 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                    : 'bg-[#3b49df] hover:bg-[#2f3ab2] text-white'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-1" />
                    Following
                  </>
                ) : (
                  'Follow'
                )}
              </Button>
            )}
          </div>
        </div>

        <PostContent post={currentPost} />

        <div className="lg:hidden flex items-center justify-around py-3 border-t border-border/60 bg-muted/20 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`cursor-pointer ${isLiked ? 'text-red-500 font-semibold' : ''}`}
          >
            <Heart
              className={`h-5 w-5 mr-1 ${isLiked ? 'fill-current' : ''}`}
            />{' '}
            {likesCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              document
                .getElementById('comments')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="cursor-pointer"
          >
            <MessageSquare className="h-5 w-5 mr-1" /> {commentsCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShareMobile}
            className="cursor-pointer"
          >
            <Share2 className="h-5 w-5 mr-1" /> Share
          </Button>
        </div>

        <div className="border-t border-border/60">
          <CommentSection
            postId={currentPost.id}
            postOwnerId={authorId}
            comments={currentPost.comments || []}
            commentsCount={commentsCount}
          />
        </div>
      </article>

      <aside className="hidden lg:flex flex-col gap-4 w-80 shrink-0 sticky top-16 self-start max-h-[calc(100vh-4.5rem)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <PostAuthorCard
          authorUser={authorUser}
          isMe={isMe}
          isFollowing={isFollowing}
          followLoading={followLoading}
          onFollowToggle={handleFollowToggle}
        />
        <PostMoreFromAuthor authorUser={authorUser} />
      </aside>

      <Toast
        message="Share link copied!"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </div>
  );
};
