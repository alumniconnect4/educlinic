import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore, getAuthHeaders } from '../store/mockData';
import { PostCard } from '../components/feed/PostCard';
import { PostSkeleton } from '../components/feed/PostSkeleton';
import type { Post } from '../types';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const FeedPage: React.FC = () => {
  const { users, currentUser, addComment, addPost } = useStore();
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

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTag = searchParams.get('tag');
  const activeSearch = searchParams.get('search');

  const observerTarget = useRef<HTMLDivElement>(null);

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
          const currentlyLiked = post.isLiked;
          const count = post._count?.likes ?? 0;
          return {
            ...post,
            isLiked: !currentlyLiked,
            _count: {
              ...post._count,
              likes: currentlyLiked ? count - 1 : count + 1,
              comments: post._count?.comments ?? 0,
            },
          };
        }
        return post;
      })
    );

    try {
      await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
    } catch (err) {
      console.error(err);
    }
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
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [activeTag, activeSearch]
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
            const authorUser = post.author
              ? users.find((u) => u.id === post.author?.id) || post.author
              : post.createdBy;
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
