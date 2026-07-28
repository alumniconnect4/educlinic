import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Search, Home, Paperclip } from 'lucide-react';
import type { Chat } from '../../types';
import { getAvatarUrl } from '../../lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Link, useNavigate } from 'react-router-dom';

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: number | null | undefined;
  setActiveChatId: (id: number) => void;
  isLoading?: boolean;
  className?: string;
}

const formatShortTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)}s`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}d`;
  } catch {
    return '';
  }
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChatId,
  setActiveChatId,
  isLoading,
  className,
}) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredChats = chats.filter((chat) =>
    chat.participant.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={
        className ||
        'w-80 shrink-0 bg-background border-r border-border/40 overflow-hidden flex flex-col h-full'
      }
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Chats
        </h1>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Link
            to="/"
            className="hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
          >
            <Home className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm bg-background border border-border/60 rounded-full shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3">
        <div className="space-y-0.5 pb-2">
          {isLoading ? (
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              {search ? 'No matching conversations' : 'No conversations yet.'}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const lastMsg =
                chat.lastMessage ||
                (chat.messages.length > 0
                  ? chat.messages[chat.messages.length - 1]
                  : null);
              const unread = chat.unreadCount || 0;
              const isActive = activeChatId === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={`flex items-center p-3 mb-1 mx-2 rounded-2xl cursor-pointer transition-all group relative border ${
                    isActive
                      ? 'bg-primary/7 border-primary/20 shadow-sm'
                      : 'hover:bg-muted/50 border-transparent'
                  }`}
                >
                  <div
                    className="shrink-0 mr-3 z-10 hover:scale-105 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile?id=${chat.participant.id}`);
                    }}
                  >
                    <Avatar className="h-12 w-12 border border-border/20 shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
                      <AvatarImage
                        src={getAvatarUrl(
                          chat.participant.name,
                          chat.participant.avatarUrl || chat.participant.avatar
                        )}
                      />
                      <AvatarFallback className="bg-muted text-foreground font-semibold">
                        {chat.participant.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 overflow-hidden min-w-0 pr-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={`text-sm truncate ${unread > 0 ? 'font-bold text-foreground' : 'font-medium text-foreground/90'}`}
                      >
                        {chat.participant.name}
                      </span>
                      {lastMsg && (
                        <span className="text-[10px] text-muted-foreground/80 shrink-0 ml-2">
                          {formatShortTime(lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[13px] truncate ${unread > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                      >
                        {lastMsg ? (
                          <>
                            {lastMsg.senderId !== chat.participant.id && (
                              <span className="font-semibold mr-1 text-foreground/70">
                                You:
                              </span>
                            )}
                            {lastMsg.content.length > 0 ? (
                              lastMsg.content
                            ) : (
                              <span className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" /> Attachment
                              </span>
                            )}
                          </>
                        ) : (
                          'No messages yet'
                        )}
                      </span>
                    </div>
                  </div>

                  {unread > 0 && !isActive && (
                    <div className="h-2 w-2 rounded-full bg-[#3b82f6] absolute right-4 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
