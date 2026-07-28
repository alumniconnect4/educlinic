import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/mockData';
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
  } = useStore();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const post = posts.find((p) => p.id === postId);

  const authorUser = post?.author
    ? users.find((u) => u.id === post.author?.id) || post.author
    : post?.createdBy;

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

  if (!post) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="text-xl font-bold">Post not found</div>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to feed
        </Button>
      </div>
    );
  }

  const handleFollowToggle = async () => {
    if (!authorUser || isMe) return;
    setFollowLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    await toggleFollow(authorUser.id, wasFollowing);
    await loadFollowState();
    setFollowLoading(false);
  };

  const isLiked = post.isLiked;
  const likesCount = post._count?.likes ?? post.likes ?? 0;
  const commentsCount = post._count?.comments ?? post.comments?.length ?? 0;

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mx-auto w-full max-w-[1240px]">
      <PostDetailSidebar
        postId={post.id}
        isLiked={isLiked}
        likesCount={likesCount}
        commentsCount={commentsCount}
        onLike={() => toggleLike(post.id)}
      />

      <article className="flex-1 min-w-0 bg-card rounded-md border border-border/80 overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-8 pb-0 md:px-12 md:pt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar
                className="h-11 w-11 border border-border/60 cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <AvatarImage
                  src={getAvatarUrl(authorUser?.name, authorUser?.avatarUrl || authorUser?.avatar)}
                />
                <AvatarFallback>
                  {authorUser?.name?.substring(0, 2) || 'DEV'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div
                  className="font-bold text-base text-foreground hover:text-[#3b49df] cursor-pointer transition-colors"
                  onClick={() => navigate('/profile')}
                >
                  {authorUser?.name || 'DEV Contributor'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Posted on{' '}
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
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
                className={`rounded-md font-medium text-sm hidden sm:flex ${
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

        <PostContent post={post} />
        <div className="lg:hidden flex items-center justify-around py-3 border-t border-border/60 bg-muted/20 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleLike(post.id)}
            className={isLiked ? 'text-red-500 font-semibold' : ''}
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
          >
            <MessageSquare className="h-5 w-5 mr-1" /> {commentsCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShareMobile}>
            <Share2 className="h-5 w-5 mr-1" /> Share
          </Button>
        </div>

        <div className="border-t border-border/60">
          <CommentSection
            postId={post.id}
            postOwnerId={authorId}
            comments={post.comments || []}
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
