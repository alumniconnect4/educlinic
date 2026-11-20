import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore, getAuthHeaders } from '../store/mockData';
import { PostCard } from '../components/feed/PostCard';
import { PostSkeleton } from '../components/feed/PostSkeleton';
import type { Post } from '../types';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { X, Sparkles } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const FeedPage: React.FC = () => {
  const { users, currentUser, addComment, addPost, posts, toggleLike, upsertPosts } = useStore();
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>(
    {}
  );
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);

  const isProfileIncomplete = Boolean(
    currentUser &&
    (!currentUser.bio ||
      !currentUser.socialLink ||
      (!currentUser.avatarUrl && !currentUser.avatar))
  );

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTag = searchParams.get('tag');
  const activeSearch = searchParams.get('search');

  const observerTarget = useRef<HTMLDivElement>(null);

  // Keep feedPosts in sync whenever store posts change (e.g. liked on PostDetailPage or other views)
  useEffect(() => {
    if (posts.length > 0) {
      setFeedPosts((prevFeedPosts) => {
        let changed = false;
        const next = prevFeedPosts.map((fp) => {
          const matching = posts.find((p) => p.id === fp.id);
          if (
            matching &&
            (matching.isLiked !== fp.isLiked ||
              (matching._count?.likes ?? matching.likes) !==
                (fp._count?.likes ?? fp.likes))
          ) {
            changed = true;
            return {
              ...fp,
              isLiked: matching.isLiked,
              _count: {
                ...fp._count,
                likes: matching._count?.likes ?? matching.likes ?? 0,
                comments: matching._count?.comments ?? fp._count?.comments ?? 0,
              },
              likes: matching._count?.likes ?? matching.likes ?? 0,
            };
          }
          return fp;
        });
        return changed ? next : prevFeedPosts;
      });
    }
  }, [posts]);

  const handleComment = (postId: number) => {
    const content = commentInputs[postId];
    if (content && content.trim()) {
      addComment(postId, content);
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    }
  };

  const handleLike = async (postId: number) => {
    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const currentlyLiked = post.isLiked ?? false;
          const count = post._count?.likes ?? post.likes ?? 0;
          const nextLiked = !currentlyLiked;
          const nextCount = currentlyLiked ? Math.max(0, count - 1) : count + 1;
          return {
            ...post,
            isLiked: nextLiked,
            _count: {
              ...post._count,
              likes: nextCount,
              comments: post._count?.comments ?? 0,
            },
            likes: nextCount,
          };
        }
        return post;
      })
    );

    await toggleLike(postId);
  };

  const fetchPosts = useCallback(
    async (pageNum: number, isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        else setIsFetchingMore(true);

        const tagQuery = activeTag
          ? `&tag=${encodeURIComponent(activeTag)}`
          : '';
        const searchQuery = activeSearch
          ? `&search=${encodeURIComponent(activeSearch)}`
          : '';
        const res = await fetch(
          `${API_BASE}/posts?page=${pageNum}&limit=5${tagQuery}${searchQuery}`,
          {
            headers: getAuthHeaders(),
            credentials: 'include',
          }
        );
        if (res.ok) {
          const data = await res.json();
          setFeedPosts((prev) =>
            isInitial ? data.posts : [...prev, ...data.posts]
          );
          setHasMore(data.hasMore);
          upsertPosts(data.posts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [activeTag, activeSearch, upsertPosts]
  );

  useEffect(() => {
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts, activeTag, activeSearch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading &&
          !isFetchingMore
        ) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, isFetchingMore, page, fetchPosts]);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {(activeTag || activeSearch) && (
        <div className="bg-card border border-border/80 rounded-md p-4 shadow-2xs flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">
              {activeTag ? (
                <>
                  Showing posts for{' '}
                  <span className="text-[#3b49df]">#{activeTag}</span>
                </>
              ) : (
                <>
                  Search results for "
                  <span className="text-[#3b49df]">{activeSearch}</span>"
                </>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              Discover what the community is saying.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filter
          </Button>
        </div>
      )}

      {loading ? (
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : (
        <>
          {feedPosts.map((post) => {
            const rawAuthor = post.author || post.createdBy;
            const authorUser =
              rawAuthor?.id &&
              currentUser?.id &&
              rawAuthor.id === currentUser.id
                ? { ...rawAuthor, ...currentUser }
                : users.find((u) => u.id === rawAuthor?.id) || rawAuthor;
            return (
              <PostCard
                key={post.id}
                post={post}
                authorUser={authorUser}
                currentUser={currentUser}
                commentInput={commentInputs[post.id] || ''}
                showComments={showComments[post.id] || false}
                onLike={() => handleLike(post.id)}
                onCommentToggle={() =>
                  setShowComments((prev) => ({
                    ...prev,
                    [post.id]: !prev[post.id],
                  }))
                }
                onCommentChange={(val) =>
                  setCommentInputs((prev) => ({ ...prev, [post.id]: val }))
                }
                onCommentSubmit={() => handleComment(post.id)}
              />
            );
          })}

          <div ref={observerTarget} className="h-10 w-full" />

          {isFetchingMore && (
            <div className="pt-2">
              <PostSkeleton />
            </div>
          )}

          {!hasMore && feedPosts.length > 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm font-medium">
              You've caught up with the latest posts!
            </div>
          )}
        </>
      )}
    </div>
  );
};
