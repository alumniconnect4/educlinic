import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../store/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { CommentItem } from './CommentItem';
import { getAvatarUrl } from '../../lib/utils';
import type { Comment } from '../../types';
import { MessageSquare, ShieldAlert, Loader2 } from 'lucide-react';

interface CommentSectionProps {
  postId: number;
  postOwnerId?: number;
  comments: Comment[];
  commentsCount: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  postOwnerId,
  commentsCount,
}) => {
  const { currentUser, addComment } = useStore();
  const [commentInput, setCommentInput] = useState('');

  const [loadedComments, setLoadedComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastCommentElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    setLoadedComments([]);
    setPage(1);
    setHasMore(true);
    setInitialLoad(true);
  }, [postId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/posts/${postId}/comments?page=${page}&limit=10`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const data = await res.json();
          setLoadedComments((prev) => {
            const existingIds = new Set(prev.map((c) => c.id));
            const newComments = data.comments.filter(
              (c: any) => !existingIds.has(c.id)
            );
            return [...prev, ...newComments];
          });
          setHasMore(data.hasMore);
        }
      } catch (error) {
        console.error('Failed to fetch comments', error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    if (hasMore) {
      fetchComments();
    }
  }, [postId, page, hasMore]);

  const handleCommentSubmit = async () => {
    if (commentInput.trim()) {
      const newComment = await addComment(postId, commentInput);
      if (newComment) {
        setLoadedComments((prev) => [newComment, ...prev]);
      }
      setCommentInput('');
    }
  };

  return (
    <div id="comments" className="p-4 sm:p-8 md:p-12 space-y-6">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#3b49df]" />
          <span>Top comments ({commentsCount})</span>
        </h2>
        <a
          href="#code-of-conduct"
          className="text-xs text-muted-foreground hover:text-[#3b49df] flex items-center gap-1"
        >
          <ShieldAlert className="h-3.5 w-3.5" /> Code of Conduct
        </a>
      </div>

      <div className="flex gap-3 sm:gap-4">
        <Avatar className="h-9 w-9 shrink-0 border border-border/60">
          <AvatarImage
            src={getAvatarUrl(currentUser?.name, currentUser?.avatarUrl || currentUser?.avatar)}
          />
          <AvatarFallback>
            {currentUser?.name?.substring(0, 2) || 'ME'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3 min-w-0">
          <textarea
            className="w-full min-h-[90px] p-3 text-sm rounded-md border border-border/80 bg-background resize-y focus:outline-none focus:ring-2 focus:ring-[#3b49df]/30 text-foreground placeholder:text-muted-foreground/60"
            placeholder="Add to the discussion..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleCommentSubmit}
              disabled={!commentInput.trim()}
              size="sm"
              className="bg-[#3b49df] hover:bg-[#2f3ab2] text-white rounded-md px-5 font-medium cursor-pointer"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/30 pt-2 space-y-4">
        {loadedComments.map((comment, index) => {
          if (loadedComments.length === index + 1) {
            return (
              <div ref={lastCommentElementRef} key={comment.id}>
                <CommentItem
                  comment={comment}
                  postId={postId}
                  postOwnerId={postOwnerId}
                />
              </div>
            );
          } else {
            return (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                postOwnerId={postOwnerId}
              />
            );
          }
        })}

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!initialLoad && loadedComments.length === 0 && (
          <div className="text-center text-muted-foreground py-8 text-sm bg-muted/20 rounded-md border border-dashed border-border/60">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
};
