import React, { useState, useCallback } from 'react';
import type { Post, User } from '../../types';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Heart, MessageSquare, Share2, Send } from 'lucide-react';
import { getAvatarUrl } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { stripHtml } from '../../utils/text';
import { Toast } from '../ui/Toast';

interface PostCardProps {
  post: Post;
  authorUser: User | undefined;
  currentUser: User | null;
  commentInput: string;
  showComments: boolean;
  onLike: () => void;
  onCommentToggle: () => void;
  onCommentChange: (val: string) => void;
  onCommentSubmit: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  authorUser,
  currentUser,
  commentInput,
  showComments,
  onLike,
  onCommentToggle,
  onCommentChange,
  onCommentSubmit,
}) => {
  const navigate = useNavigate();
  const [toastVisible, setToastVisible] = useState(false);

  const coverImg = post.coverImage || post.imageUrl;
  const hasCover = Boolean(coverImg);
  const likesCount = post._count?.likes ?? post.likes ?? 0;
  const commentsCount = post.comments?.length ?? 0;

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => setToastVisible(true));
  }, [post.id]);

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <article className="bg-card border border-border/70 rounded-lg overflow-hidden shadow-2xs hover:shadow-xs transition-shadow">
        {hasCover && (
          <div
            className="w-full h-48 sm:h-60 bg-muted cursor-pointer hover:opacity-95 transition-opacity"
            style={{
              backgroundImage: `url(${coverImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onClick={() => navigate(`/post/${post.id}`)}
          />
        )}

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative shrink-0">
              <Avatar
                className="h-10 w-10 border border-border/50 cursor-pointer transition-transform hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation();
                  if (authorUser?.id) navigate(`/profile?id=${authorUser.id}`);
                  else navigate('/profile');
                }}
              >
                <AvatarImage
                  src={getAvatarUrl(authorUser?.name, authorUser?.avatarUrl || authorUser?.avatar)}
                />
                <AvatarFallback>
                  {authorUser?.name?.substring(0, 2) || 'DE'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="font-semibold text-sm text-foreground hover:text-[#3b49df] cursor-pointer transition-colors leading-tight"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (authorUser?.id)
                      navigate(`/profile?id=${authorUser.id}`);
                    else navigate('/profile');
                  }}
                >
                  {authorUser?.name || 'DEV Contributor'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {formattedDate}
              </div>
            </div>
          </div>

          <div className="pl-0 sm:pl-12 space-y-2">
            <h2
              className="text-xl sm:text-2xl font-bold text-foreground hover:text-[#3b49df] cursor-pointer transition-colors leading-snug tracking-tight"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              {post.title || stripHtml(post.content)}
            </h2>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 py-1">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-muted-foreground hover:text-foreground hover:bg-[#3b49df]/10 hover:border-[#3b49df]/30 px-2 py-0.5 rounded transition-colors cursor-pointer border border-transparent font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/30 text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={onLike}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                    post.isLiked
                      ? 'bg-red-500/10 text-red-600 font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span>
                    {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                  </span>
                </button>

                <button
                  onClick={onCommentToggle}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    {commentsCount > 0
                      ? `${commentsCount} comments`
                      : 'Add Comment'}
                  </span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-[#3b49df] hover:bg-[#3b49df]/10 transition-colors cursor-pointer"
                  title="Share post link"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              <div className="text-xs text-muted-foreground font-normal">
                {Math.floor(Math.random() * 6) + 1} min read
              </div>
            </div>

            {showComments && (
              <div className="w-full space-y-3 pt-4 border-t border-border/60 mt-4">
                <div className="flex gap-2">
                  <Avatar className="h-8 w-8 shrink-0 border border-border/50">
                    <AvatarImage
                      src={getAvatarUrl(currentUser?.name, currentUser?.avatarUrl || currentUser?.avatar)}
                    />
                    <AvatarFallback className="text-xs">
                      {currentUser?.name?.substring(0, 2).toUpperCase() || 'ME'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Add to the discussion..."
                      className="h-9 text-xs sm:text-sm bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-[#3b49df]"
                      value={commentInput}
                      onChange={(e) => onCommentChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onCommentSubmit();
                      }}
                    />
                    <Button
                      size="sm"
                      className="bg-[#3b49df] hover:bg-[#2f3ab2] text-white h-9 px-4"
                      onClick={onCommentSubmit}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-2 text-xs sm:text-sm"
                    >
                      <Avatar className="h-7 w-7 shrink-0 border border-border/50">
                        <AvatarImage
                          src={getAvatarUrl(
                            comment.author.name,
                            comment.author.avatarUrl || comment.author.avatar
                          )}
                        />
                        <AvatarFallback className="text-[10px]">
                          {comment.author.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/50 p-3 rounded-md border border-border/60">
                        <div className="font-semibold text-xs mb-1 text-foreground">
                          {comment.author.name}
                        </div>
                        <div className="text-foreground/90 leading-relaxed">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      <Toast
        message="Share link copied!"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </>
  );
};
