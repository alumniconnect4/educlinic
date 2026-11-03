import React, { useState, useCallback } from 'react';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { Toast } from '../ui/Toast';

interface PostDetailSidebarProps {
  postId: number;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  onLike: () => void;
}

export const PostDetailSidebar: React.FC<PostDetailSidebarProps> = ({
  postId,
  isLiked,
  likesCount,
  commentsCount,
  onLike,
}) => {
  const [toastVisible, setToastVisible] = useState(false);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url).then(() => setToastVisible(true));
  }, [postId]);

  return (
    <>
      <aside className="hidden lg:flex flex-col items-center gap-6 w-14 shrink-0 pt-6 sticky top-16 self-start max-h-[calc(100vh-4.5rem)] overflow-y-auto text-muted-foreground [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={onLike}
          className="flex flex-col items-center gap-1 group cursor-pointer"
          title="Like post"
        >
          <div
            className={`p-3 rounded-full transition-colors ${isLiked ? 'bg-red-500/10 text-red-500' : 'hover:bg-muted group-hover:text-red-500'}`}
          >
            <Heart
              className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
            />
          </div>
          <span className="text-xs font-semibold">{likesCount}</span>
        </button>

        <button
          onClick={() =>
            document
              .getElementById('comments')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
          className="flex flex-col items-center gap-1 group cursor-pointer"
          title="Jump to comments"
        >
          <div className="p-3 rounded-full hover:bg-muted group-hover:text-[#3b49df] transition-colors">
            <MessageSquare className="h-6 w-6" />
          </div>
          <span className="text-xs font-semibold">{commentsCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 group cursor-pointer"
          title="Share post link"
        >
          <div className="p-3 rounded-full hover:bg-muted group-hover:text-[#3b49df] transition-colors">
            <Share2 className="h-6 w-6" />
          </div>
        </button>
      </aside>

      <Toast
        message="Share link copied!"
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </>
  );
};
