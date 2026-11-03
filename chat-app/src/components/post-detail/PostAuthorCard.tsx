import React from 'react';
import type { User } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { getAvatarUrl } from '../../lib/utils';
import { Calendar, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PostAuthorCardProps {
  authorUser: User | undefined;
  isMe: boolean;
  isFollowing: boolean;
  followLoading: boolean;
  onFollowToggle: () => void;
}

export const PostAuthorCard: React.FC<PostAuthorCardProps> = ({
  authorUser,
  isMe,
  isFollowing,
  followLoading,
  onFollowToggle,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border/80 rounded-md overflow-hidden shadow-2xs">
      <div className="h-12 bg-black w-full" />
      <div className="p-5 pt-0">
        <div className="flex items-end gap-3 -mt-8 mb-4">
          <Avatar
            className="relative z-10 h-16 w-16 border-4 border-card bg-card shadow-xs cursor-pointer"
            onClick={() => navigate('/profile')}
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
          <h3
            className="font-bold text-xl text-foreground hover:text-[#3b49df] cursor-pointer transition-colors pb-0.5"
            onClick={() => navigate('/profile')}
          >
            {authorUser?.name || 'DEV Contributor'}
          </h3>
        </div>

        {!isMe && (
          <Button
            onClick={onFollowToggle}
            disabled={followLoading}
            className={`w-full font-medium mb-4 rounded-md ${
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

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {authorUser?.bio}
        </p>

        <div className="space-y-2 text-xs text-muted-foreground border-t border-border/40 pt-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Joined BFGI network on{' '}
              {(authorUser as any)?.createdAt
                ? new Date((authorUser as any).createdAt).toLocaleDateString(
                    'en-US',
                    { month: 'short', day: 'numeric', year: 'numeric' }
                  )
                : 'Jan 15, 2024'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
