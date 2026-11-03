import React from 'react';
import type { User } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/mockData';

interface PostMoreFromAuthorProps {
  authorUser: User | undefined;
}

export const PostMoreFromAuthor: React.FC<PostMoreFromAuthorProps> = ({
  authorUser,
}) => {
  const navigate = useNavigate();
  const { posts } = useStore();

  const authorPosts = posts
    .filter(
      (p) =>
        p.createdBy?.id === authorUser?.id || p.author?.id === authorUser?.id
    )
    .slice(0, 3);

  return (
    <div className="bg-card border border-border/80 rounded-md overflow-hidden shadow-2xs">
      <div className="p-4 border-b border-border/60 font-bold text-sm bg-muted/20">
        More from{' '}
        <span className="text-[#3b49df]">{authorUser?.name || 'Author'}</span>
      </div>
      <div className="divide-y divide-border/40">
        {authorPosts.length > 0 ? (
          authorPosts.map((item) => (
            <a
              key={item.id}
              className="p-4 block hover:bg-muted/40 cursor-pointer transition-colors group"
              onClick={() => navigate(`/post/${item.id}`)}
            >
              <div className="text-sm font-medium text-foreground group-hover:text-[#3b49df] transition-colors leading-snug">
                {item.title}
              </div>
              <div className="text-xs text-muted-foreground mt-2 font-mono">
                {item.tags && item.tags.length > 0
                  ? `#${item.tags[0]}`
                  : '#post'}
              </div>
            </a>
          ))
        ) : (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No more posts by this user
          </div>
        )}
      </div>
    </div>
  );
};
