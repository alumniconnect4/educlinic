import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import {
  Send,
  MessageSquare,
  Paperclip,
  Search,
  MoreVertical,
  Loader2,
  X,
  Check,
  Edit2,
  Ban,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../ui/button';
import type { Chat, User, Message } from '../../types';
import { getAvatarUrl } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { ChatMessage } from './ChatMessage';
import { Skeleton } from '../ui/skeleton';
import { useStore } from '../../store/mockData';

interface ChatAreaProps {
  activeChat: Chat | undefined;
  currentUser: User | null;
  newMessage: string;
  setNewMessage: (msg: string) => void;
  handleSend: () => void;
  isLoading?: boolean;
  className?: string;
  onBack?: () => void;
  hasChats?: boolean;
}

export const formatDividerDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0 && now.getDate() === date.getDate()) {
    return 'TODAY';
  } else if (
    diffDays === 1 ||
    (diffDays === 0 && now.getDate() !== date.getDate())
  ) {
    return 'YESTERDAY';
  } else {
    return date
      .toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      .toUpperCase();
  }
};

export const ChatArea: React.FC<ChatAreaProps> = ({
  activeChat,
  currentUser,
  newMessage,
  setNewMessage,
  handleSend,
  isLoading,
  className,
  onBack,
  hasChats,
}) => {
  const {
    fetchMessagesWithUser,
    editMessage,
    unblockUser,
    blockUser,
    clearChat,
    fetchFollowCounts,
    toggleFollow,
    latestFollowUpdate,
  } = useStore();
  const observerTarget = useRef<HTMLDivElement>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [followStatus, setFollowStatus] = useState<{
    isFollowing: boolean;
    isFollowingMe: boolean;
  } | null>(null);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  useEffect(() => {
    if (activeChat?.participant.id) {
      setFollowStatus(null);
      fetchFollowCounts(activeChat.participant.id).then((res) => {
        setFollowStatus({
          isFollowing: res.isFollowing,
          isFollowingMe: res.isFollowingMe,
        });
      });
    }
  }, [activeChat?.participant.id, fetchFollowCounts]);

  useEffect(() => {
    if (latestFollowUpdate && activeChat?.participant.id) {
      if (
        latestFollowUpdate.followerId === activeChat.participant.id &&
        latestFollowUpdate.followingId === currentUser?.id
      ) {
        setFollowStatus((prev) => ({
          isFollowing: prev?.isFollowing ?? false,
          isFollowingMe: latestFollowUpdate.isFollowing,
        }));
      }
      if (
        latestFollowUpdate.followerId === currentUser?.id &&
        latestFollowUpdate.followingId === activeChat.participant.id
      ) {
        setFollowStatus((prev) => ({
          isFollowing: latestFollowUpdate.isFollowing,
          isFollowingMe: prev?.isFollowingMe ?? false,
        }));
      }
    }
  }, [latestFollowUpdate, activeChat?.participant.id, currentUser?.id]);

  const handleToggleFollow = async () => {
    if (!activeChat || !followStatus) return;
    setIsTogglingFollow(true);
    try {
      await toggleFollow(activeChat.participant.id, followStatus.isFollowing);
      const updatedStatus = await fetchFollowCounts(activeChat.participant.id);
      setFollowStatus({
        isFollowing: updatedStatus.isFollowing,
        isFollowingMe: updatedStatus.isFollowingMe,
      });
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditInit = (msg: Message) => {
    setEditingMessageId(msg.id);
    setNewMessage(msg.content);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setNewMessage('');
  };

  const onSendWrapper = () => {
    if (editingMessageId) {
      editMessage(editingMessageId, newMessage);
      setEditingMessageId(null);
      setNewMessage('');
    } else {
      handleSend();
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          activeChat?.nextCursor &&
          !isFetchingMore
        ) {
          setIsFetchingMore(true);
          fetchMessagesWithUser(activeChat.id, activeChat.nextCursor).finally(
            () => {
              setIsFetchingMore(false);
            }
          );
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [
    activeChat?.nextCursor,
    activeChat?.id,
    isFetchingMore,
    fetchMessagesWithUser,
  ]);

  const groupedMessages: { date: string; messages: Message[] }[] = [];
  if (activeChat) {
    let currentDate = '';
    const filteredMessages = activeChat.messages.filter((msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredMessages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groupedMessages.push({ date: msg.createdAt, messages: [msg] });
      } else {
        groupedMessages[groupedMessages.length - 1].messages.push(msg);
      }
    });
  }

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.id, activeChat?.messages?.length, scrollToBottom]);

  if (isLoading) {
    return (
      <div
        className={
          className ||
          'flex-1 flex flex-col h-full bg-background overflow-hidden relative'
        }
      >
        {/* Chat Header Skeleton */}
        <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between bg-background shrink-0 z-10">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-20 rounded-full hidden sm:block" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>

        {/* Message History Skeleton - 5 alternating chat message bubbles on both sides */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 bg-slate-50/50 flex flex-col justify-end space-y-4">
          {/* Message 1: Incoming message (Left side) */}
          <div className="flex items-end gap-2 max-w-[80%] sm:max-w-[70%]">
            <Skeleton className="h-8 w-8 rounded-full shrink-0 mb-1" />
            <div className="space-y-1">
              <Skeleton className="h-10 w-48 sm:w-56 rounded-2xl rounded-bl-xs bg-muted/60" />
              <Skeleton className="h-2.5 w-12 ml-1" />
            </div>
          </div>

          {/* Message 2: Outgoing message (Right side) */}
          <div className="flex items-end justify-end gap-2 self-end max-w-[80%] sm:max-w-[70%]">
            <div className="space-y-1 flex flex-col items-end">
              <Skeleton className="h-12 w-56 sm:w-72 rounded-2xl rounded-br-xs bg-[#3b82f6]/25 dark:bg-[#3b82f6]/30" />
              <Skeleton className="h-2.5 w-10 mr-1" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full shrink-0 mb-1" />
          </div>

          {/* Message 3: Incoming message (Left side - multi-line) */}
          <div className="flex items-end gap-2 max-w-[80%] sm:max-w-[70%]">
            <Skeleton className="h-8 w-8 rounded-full shrink-0 mb-1" />
            <div className="space-y-1">
              <Skeleton className="h-16 w-64 sm:w-80 rounded-2xl rounded-bl-xs bg-muted/60" />
              <Skeleton className="h-2.5 w-12 ml-1" />
            </div>
          </div>

          {/* Message 4: Outgoing message (Right side) */}
          <div className="flex items-end justify-end gap-2 self-end max-w-[80%] sm:max-w-[70%]">
            <div className="space-y-1 flex flex-col items-end">
              <Skeleton className="h-10 w-40 sm:w-52 rounded-2xl rounded-br-xs bg-[#3b82f6]/25 dark:bg-[#3b82f6]/30" />
              <Skeleton className="h-2.5 w-10 mr-1" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full shrink-0 mb-1" />
          </div>

          {/* Message 5: Incoming message (Left side) */}
          <div className="flex items-end gap-2 max-w-[80%] sm:max-w-[70%]">
            <Skeleton className="h-8 w-8 rounded-full shrink-0 mb-1" />
            <div className="space-y-1">
              <Skeleton className="h-12 w-52 sm:w-64 rounded-2xl rounded-bl-xs bg-muted/60" />
              <Skeleton className="h-2.5 w-12 ml-1" />
            </div>
          </div>
        </div>

        {/* Static Input Bar (Always visible at bottom) */}
        <div className="p-4 pt-2 bg-slate-50/50 flex flex-col gap-2 border-t border-border/20 shrink-0">
          <div className="flex-1 relative flex items-center">
            <button disabled className="absolute left-4 text-muted-foreground/40 z-10">
              <Paperclip className="h-5 w-5" />
            </button>
            <Input
              disabled
              placeholder="Message"
              className="h-12 pl-12 pr-12 text-sm bg-background border border-border/50 rounded-full shadow-sm w-full cursor-not-allowed opacity-70"
            />
            <button disabled className="absolute right-4 text-muted-foreground/40 z-10">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        className || 'flex-1 bg-background overflow-hidden flex flex-col'
      }
    >
      {activeChat ? (
        <>
          <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between bg-background z-10">
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() =>
                navigate(`/profile?id=${activeChat.participant.id}`)
              }
            >
              {onBack && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBack();
                  }}
                  className="md:hidden mr-1 text-muted-foreground hover:text-foreground p-1"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={getAvatarUrl(
                    activeChat.participant.name,
                    activeChat.participant.avatarUrl || activeChat.participant.avatar
                  )}
                />
                <AvatarFallback className="font-semibold bg-muted">
                  {activeChat.participant.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="font-semibold text-base text-foreground hover:text-[#3b49df] transition-colors">
                  {activeChat.participant.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-muted-foreground">
              {followStatus && (
                <Button
                  variant={followStatus.isFollowing ? 'secondary' : 'default'}
                  size="sm"
                  onClick={handleToggleFollow}
                  disabled={isTogglingFollow}
                  className="hidden sm:flex h-8 w-[100px] text-xs rounded-full font-medium"
                >
                  {isTogglingFollow ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : followStatus.isFollowing ? (
                    'Following'
                  ) : followStatus.isFollowingMe ? (
                    'Follow Back'
                  ) : (
                    'Follow'
                  )}
                </Button>
              )}
              {isSearchOpen ? (
                <div className="flex items-center bg-muted/50 rounded-full px-3 py-1">
                  <Search className="h-4 w-4 text-muted-foreground mr-2" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm w-32 focus:ring-0 text-foreground"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="ml-1 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="hover:text-foreground transition-colors flex items-center justify-center"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
              <div
                className="relative flex items-center justify-center"
                ref={dropdownRef}
              >
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="hover:text-foreground transition-colors flex items-center justify-center"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-md shadow-lg border border-border/50 py-1 z-50">
                    {!activeChat.blockedByMe && (
                      <button
                        onClick={() => {
                          blockUser(activeChat.participant.id);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-muted/50 flex items-center gap-2"
                      >
                        <Ban className="h-4 w-4" /> Block User
                      </button>
                    )}
                    <button
                      onClick={() => {
                        clearChat(activeChat.participant.id);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> Clear Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="flex-1 min-h-0 overflow-y-auto px-6 py-4 bg-slate-50/50 flex flex-col-reverse gap-6 scroll-smooth"
          >
            {activeChat.messages.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground my-8">
                No previous messages. Say hi to {activeChat.participant.name}!
              </div>
            ) : (
              groupedMessages.map((group, groupIdx) => (
                <div key={groupIdx} className="flex flex-col-reverse gap-1">
                  {group.messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      isMe={msg.senderId === currentUser?.id}
                      onEdit={handleEditInit}
                    />
                  ))}
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1 bg-muted/30 rounded-full text-[10px] font-semibold tracking-wider text-muted-foreground">
                      {formatDividerDate(group.date)}
                    </span>
                  </div>
                </div>
              ))
            )}

            {activeChat.nextCursor && (
              <div
                ref={observerTarget}
                className="py-4 flex justify-center w-full shrink-0"
              >
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="p-4 pt-2 bg-slate-50/50 flex flex-col gap-2 border-t border-border/20">
            {activeChat.blockedByMe ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 h-20 bg-muted/20 border border-border/50 rounded-lg text-sm text-muted-foreground p-4">
                <span>You have blocked this user.</span>
                <button
                  onClick={() => unblockUser(activeChat.participant.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-colors"
                >
                  <Ban className="h-4 w-4" /> Unblock User
                </button>
              </div>
            ) : activeChat.hasBlockedMe ? (
              <div className="flex-1 flex items-center justify-center h-12 bg-muted/30 border border-border/50 rounded-full text-sm text-muted-foreground">
                You cannot send or receive messages anymore due to a block.
              </div>
            ) : !followStatus ? (
              <div className="flex-1 relative flex items-center">
                <button disabled className="absolute left-4 text-muted-foreground/40 z-10">
                  <Paperclip className="h-5 w-5" />
                </button>
                <Input
                  disabled
                  placeholder="Checking permissions..."
                  className="h-12 pl-12 pr-12 text-sm bg-muted/30 border border-border/40 rounded-full w-full cursor-not-allowed opacity-70"
                />
                <button disabled className="absolute right-4 text-muted-foreground/40 z-10">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            ) : !followStatus.isFollowing || !followStatus.isFollowingMe ? (
              <div className="flex-1 flex items-center justify-center h-12 bg-muted/30 border border-border/50 rounded-full text-sm font-medium text-muted-foreground">
                Both users must follow each other to chat.
              </div>
            ) : (
              <>
                {editingMessageId && (
                  <div className="flex items-center justify-between bg-muted/30 px-4 py-2 rounded-lg text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Edit2 className="h-4 w-4" /> Editing message
                    </span>
                    <button
                      onClick={cancelEdit}
                      className="hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex-1 relative flex items-center">
                  <button className="absolute left-4 text-muted-foreground hover:text-foreground transition-colors z-10">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <Input
                    placeholder="Message"
                    className="h-12 pl-12 pr-12 text-sm bg-background border border-border/50 rounded-full shadow-sm focus-visible:ring-1 focus-visible:ring-border w-full"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSendWrapper();
                    }}
                  />
                  <button
                    onClick={onSendWrapper}
                    disabled={!newMessage.trim()}
                    className="absolute right-4 text-muted-foreground hover:text-[#3b82f6] transition-colors disabled:opacity-50 disabled:hover:text-muted-foreground z-10"
                  >
                    {editingMessageId ? (
                      <Check className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6">
          <MessageSquare className="h-12 w-12 mb-4 text-muted-foreground/30" />
          <p className="text-base font-medium text-center">
            {hasChats
              ? 'Select a chat to start messaging'
              : 'You have no messages yet. Start a conversation!'}
          </p>
        </div>
      )}
    </div>
  );
};
