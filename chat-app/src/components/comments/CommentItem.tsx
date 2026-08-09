import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Heart,
  MessageSquare,
  Trash2,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';
import { Toast } from '../ui/Toast';
import { getAvatarUrl } from '../../lib/utils';
import type { Comment } from '../../types';
import { useStore, getAuthHeaders } from '../../store/mockData';

interface CommentItemProps {
  comment: Comment;
  postId: number;
  postOwnerId?: number;
  depth?: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  postOwnerId,
  depth = 0,
}) => {
  const { addComment, deleteComment, currentUser } = useStore();
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.isLiked ?? false);
  const [likeCount, setLikeCount] = useState<number>(
    (comment as any)._count?.likes ?? 0
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const initialReplyCount = Number(
    (comment as any).replyCount ??
      (comment as any)._count?.replies ??
      comment.replies?.length ??
      0
  );
  const [replyCountLocal, setReplyCountLocal] =
    useState<number>(initialReplyCount);
  const [loadedReplies, setLoadedReplies] = useState<Comment[]>(
    comment.replies ?? []
  );
  const [repliesPage, setRepliesPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(
    initialReplyCount > loadedReplies.length
  );
  const [loadingReplies, setLoadingReplies] = useState(false);

  const maxDepth = 3;

  const canDelete = Boolean(
    currentUser &&
    (currentUser.id === comment.author.id ||
      (postOwnerId && currentUser.id === postOwnerId))
  );

  const formatTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  useEffect(() => {
    if (isReplying) {
      const mention = `@${comment.author.name} `;
      setReplyContent(mention);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const len = mention.length;
          textareaRef.current.setSelectionRange(len, len);
        }
      }, 50);
    }
  }, [isReplying, comment.author.name]);

  const handleReplySubmit = async () => {
    const trimmed = replyContent.trim();
    if (!trimmed) return;
    setIsSubmitting(true);
    const newReply = await addComment(postId, trimmed, comment.id);
    if (newReply) {
      setLoadedReplies((prev) => [...prev, newReply]);
      setReplyCountLocal((prev) => prev + 1);
    }
    setReplyContent('');
    setIsReplying(false);
    setShowReplies(true);
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    setShowMenu(false);
    setIsDeleting(true);
    setShowToast(true);

    const success = await deleteComment(comment.id);
    if (!success) {
      setIsDeleting(false);
      setShowToast(false);
    } else {
      setIsDeleted(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleReplySubmit();
    }
    if (e.key === 'Escape') {
      setIsReplying(false);
    }
  };

  const handleLikeToggle = async () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      await fetch(`${API_BASE}/posts/comments/${comment.id}/like`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
      });
    } catch (error) {
      setIsLiked((prev) => !prev);
      setLikeCount((prev) => (isLiked ? prev + 1 : prev - 1));
      console.error('Failed to toggle comment like', error);
    }
  };

  const loadReplies = async (pageToLoad: number) => {
    try {
      setLoadingReplies(true);
      const res = await fetch(
        `${API_BASE}/posts/comments/${comment.id}/replies?page=${pageToLoad}&limit=5`,
        { 
          headers: getAuthHeaders(),
          credentials: 'include' 
        }
      );
      if (res.ok) {
        const data = await res.json();
        setLoadedReplies((prev) => {
          const existingIds = new Set(prev.map((r) => r.id));
          const newReplies = data.replies.filter(
            (r: any) => !existingIds.has(r.id)
          );
          return [...prev, ...newReplies];
        });
        setHasMoreReplies(data.hasMore);
        setRepliesPage(pageToLoad);
      }
    } catch (err) {
      console.error('Failed to load replies', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const toggleShowReplies = () => {
    if (!showReplies && loadedReplies.length === 0 && replyCountLocal > 0) {
      loadReplies(1);
    }
    setShowReplies((prev) => !prev);
  };

  if (isDeleted) {
    return (
      <Toast
        message="Comment deleted successfully"
        visible={showToast}
        onDismiss={() => setShowToast(false)}
      />
    );
  }

  if (isDeleting) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground animate-pulse">
        Deleting comment...
      </div>
    );
  }

  return (
    <div
      className={`space-y-2.5 ${depth > 0 ? 'pl-4 sm:pl-6 border-l-2 border-border/40 ml-3 sm:ml-4 my-3' : 'my-4'}`}
    >
      <div className="space-y-1.5 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 shrink-0 border border-border/50">
              <AvatarImage
                src={getAvatarUrl(
                  comment.author.name,
                  comment.author.avatarUrl || comment.author.avatar
                )}
              />
              <AvatarFallback className="text-xs">
                {comment.author.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground hover:text-[#3b49df] cursor-pointer transition-colors">
                {comment.author.name}
              </span>
              {currentUser?.id === comment.author.id && (
                <span className="text-[10px] bg-[#3b49df]/10 text-[#3b49df] font-medium px-1.5 py-0.5 rounded">
                  you
                </span>
              )}
              {postOwnerId && comment.author.id === postOwnerId && (
                <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium px-1.5 py-0.5 rounded">
                  Author
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                • {formatTime(comment.createdAt)}
              </span>
            </div>
          </div>

          {canDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                title="More options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border/60 rounded-md shadow-lg py-1 z-20 animate-in fade-in slide-in-from-top-2">
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-3 py-2 text-sm text-black hover:text-black/60 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="text-sm text-foreground/90 leading-relaxed pl-[42px] whitespace-pre-wrap">
          {comment.content}
        </div>

        <div className="flex items-center gap-5 pl-[42px] text-[13px] text-muted-foreground pt-1 pb-1">
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer select-none ${
              isLiked ? 'text-red-500 font-medium' : ''
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 transition-transform active:scale-125 ${isLiked ? 'fill-current' : ''}`}
            />
            <span>
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </span>
          </button>

          <button
            onClick={() => setIsReplying((prev) => !prev)}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
              isReplying ? 'text-[#3b49df] font-medium' : 'hover:text-[#3b49df]'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{isReplying ? 'Cancel' : 'Reply'}</span>
          </button>
        </div>
      </div>

      {isReplying && (
        <div className="flex gap-2.5 pl-10 pt-1 animate-in slide-in-from-top-2 duration-150">
          <Avatar className="h-7 w-7 shrink-0 border border-border/50 mt-1">
            <AvatarImage
              src={getAvatarUrl(
                currentUser?.name,
                currentUser?.avatarUrl || currentUser?.avatar
              )}
            />
            <AvatarFallback className="text-xs">
              {currentUser?.name?.substring(0, 2).toUpperCase() || 'ME'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <textarea
              ref={textareaRef}
              className="w-full min-h-[76px] p-2.5 text-xs sm:text-sm rounded-md border border-border/80 bg-background resize-y focus:outline-none focus:ring-2 focus:ring-[#3b49df]/30 text-foreground placeholder:text-muted-foreground/60 transition-shadow"
              placeholder={`Reply to ${comment.author.name}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="flex items-center gap-2 justify-between">
              <span className="text-[11px] text-muted-foreground hidden sm:block">
                Ctrl+Enter to submit · Esc to cancel
              </span>
              <div className="flex gap-2 ml-auto">
                <button
                  className="text-xs text-muted-foreground hover:text-foreground py-1 px-3 rounded-md border border-border/60 hover:border-border transition-colors cursor-pointer"
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-[#3b49df] text-white text-xs px-4 py-1.5 rounded-md font-medium hover:bg-[#2f3ab2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  disabled={!replyContent.trim() || isSubmitting}
                  onClick={handleReplySubmit}
                >
                  {isSubmitting ? 'Posting…' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {replyCountLocal > 0 && (
        <div className="flex justify-center pt-3 pb-1">
          <button
            onClick={toggleShowReplies}
            className="flex items-center justify-center gap-2 text-[13px] font-semibold text-muted-foreground hover:text-[#3b49df] transition-colors cursor-pointer group"
          >
            <span className="w-8 h-[1px] bg-border/80 group-hover:bg-[#3b49df]/70 transition-colors" />
            <span>
              {showReplies
                ? `Hide ${replyCountLocal} ${replyCountLocal === 1 ? 'reply' : 'replies'}`
                : `View ${replyCountLocal} ${replyCountLocal === 1 ? 'reply' : 'replies'}`}
            </span>
            <span className="w-8 h-[1px] bg-border/80 group-hover:bg-[#3b49df]/70 transition-colors" />
          </button>
        </div>
      )}

      {showReplies && (
        <div className="space-y-4 pt-2">
          {loadedReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              postOwnerId={postOwnerId}
              depth={Math.min(depth + 1, maxDepth)}
            />
          ))}

          {loadingReplies && (
            <div className="flex items-center gap-2 pl-10 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading
              replies...
            </div>
          )}

          {hasMoreReplies && !loadingReplies && (
            <div className="flex justify-center pt-2 pb-2">
              <button
                onClick={() => loadReplies(repliesPage + 1)}
                className="text-[13px] font-semibold text-muted-foreground hover:text-[#3b49df] transition-colors cursor-pointer flex items-center gap-2 group"
              >
                <span className="w-6 h-[1px] bg-border/80 group-hover:bg-[#3b49df]/70 transition-colors" />
                Load more replies...
                <span className="w-6 h-[1px] bg-border/80 group-hover:bg-[#3b49df]/70 transition-colors" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
