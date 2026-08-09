import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Post, Chat, Message, Comment } from '../types';
import { getSocket, connectSocket, disconnectSocket } from '../lib/socket';
import { handleChatAuthError } from '../utils/authRedirect';

interface StoreState {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  chats: Chat[];
  isLoading: boolean;
  addPost: (
    title: string,
    content: string,
    coverImage: string,
    tags: string[]
  ) => Promise<Post | undefined>;
  toggleLike: (postId: number) => Promise<void>;
  addComment: (
    postId: number,
    content: string,
    parentId?: number
  ) => Promise<Comment | undefined>;
  deletePost: (postId: number) => Promise<boolean>;
  deleteComment: (commentId: number) => Promise<boolean>;
  toggleFollow: (userId: number, currentlyFollowing: boolean) => Promise<void>;
  fetchFollowCounts: (userId: number) => Promise<{
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
    isFollowingMe: boolean;
    blockedByMe: boolean;
    hasBlockedMe: boolean;
  }>;
  blockUser: (userId: number) => Promise<void>;
  unblockUser: (userId: number) => Promise<void>;
  clearChat: (partnerId: number) => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessagesWithUser: (
    partnerId: number,
    cursor?: number
  ) => Promise<Message[]>;
  sendMessage: (receiverId: number, content: string) => Promise<void>;
  markAsRead: (partnerId: number) => Promise<void>;
  startDirectMessage: (partnerUser: User) => Chat;
  updateProfile: (
    name: string,
    bio: string,
    gender: string,
    socialLink: string,
    avatarUrl?: string
  ) => Promise<void>;
  editMessage: (messageId: number, content: string) => Promise<void>;
  deleteMessage: (messageId: number) => Promise<void>;
  latestFollowUpdate: {
    followerId: number;
    followingId: number;
    isFollowing: boolean;
  } | null;
  connectUsersCache: any[];
  setConnectUsersCache: React.Dispatch<React.SetStateAction<any[]>>;
  connectTotalCache: number;
  setConnectTotalCache: React.Dispatch<React.SetStateAction<number>>;
}

export const StoreContext = createContext<StoreState | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const getAuthHeaders = (): Record<string, string> => {
  const session = localStorage.getItem('chatSessionId');
  return session ? { Authorization: `Bearer ${session}` } : {};
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [latestFollowUpdate, setLatestFollowUpdate] = useState<{
    followerId: number;
    followingId: number;
    isFollowing: boolean;
  } | null>(null);
  const [connectUsersCache, setConnectUsersCache] = useState<any[]>([]);
  const [connectTotalCache, setConnectTotalCache] = useState<number>(0);

  useEffect(() => {
    const initStore = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionFromUrl = urlParams.get('session');
        if (sessionFromUrl) {
          localStorage.setItem('chatSessionId', sessionFromUrl);
          urlParams.delete('session');
          const newSearch = urlParams.toString();
          const newUrl =
            window.location.pathname +
            (newSearch ? `?${newSearch}` : '') +
            window.location.hash;
          window.history.replaceState(null, '', newUrl);
        }

        const storedSession = localStorage.getItem('chatSessionId');
        const headers: Record<string, string> = storedSession
          ? { Authorization: `Bearer ${storedSession}` }
          : {};

        const userRes = await fetch(`${API_BASE}/auth/me`, {
          credentials: 'include',
          headers,
        });
        if (!userRes.ok) {
          handleChatAuthError();
          return;
        }
        const userData = await userRes.json();
        if (userData.sessionId) {
          localStorage.setItem('chatSessionId', userData.sessionId);
        }
        setCurrentUser(userData.user);

        const postsRes = await fetch(`${API_BASE}/posts`, {
          credentials: 'include',
          headers: getAuthHeaders(),
        });
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || postsData);
        }
      } catch (err) {
        console.error('Failed to init store', err);
        handleChatAuthError();
      } finally {
        setIsLoading(false);
      }
    };
    initStore();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat/conversations`, {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const apiChats: Chat[] = (data.conversations || []).map(
          (conv: any) => ({
            id: conv.id,
            participant: conv.participant,
            messages: conv.lastMessage ? [conv.lastMessage] : [],
            lastMessage: conv.lastMessage,
            unreadCount: conv.unreadCount || 0,
            blockedByMe: conv.blockedByMe || false,
            hasBlockedMe: conv.hasBlockedMe || false,
          })
        );
        setChats(apiChats);
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
      connectSocket();

      const socket = getSocket();

      const handleReceiveMessage = (msg: Message) => {
        setChats((prevChats) => {
          const partnerId =
            msg.senderId === currentUser.id ? msg.receiverId! : msg.senderId;
          const existingChatIndex = prevChats.findIndex(
            (c) => c.id === partnerId
          );

          if (existingChatIndex !== -1) {
            const updated = [...prevChats];
            const [chat] = updated.splice(existingChatIndex, 1);
            const updatedMessages = chat.messages.filter((m) => {
              if (msg.tempId && m.id === msg.tempId) return false;
              if (
                !msg.tempId &&
                typeof m.id === 'number' &&
                m.id > 1000000000000 &&
                m.content === msg.content &&
                m.senderId === msg.senderId
              ) {
                return false;
              }
              return true;
            });
            const exists = updatedMessages.some((m) => m.id === msg.id);
            const finalMessages = exists
              ? updatedMessages
              : [msg, ...updatedMessages];

            const unreadInc =
              msg.senderId !== currentUser.id && !msg.isRead ? 1 : 0;

            const updatedChat = {
              ...chat,
              messages: finalMessages,
              lastMessage: msg,
              unreadCount: (chat.unreadCount || 0) + unreadInc,
            };
            return [updatedChat, ...updated];
          } else {
            const partnerName =
              msg.senderId === currentUser.id
                ? msg.receiver?.name || 'User'
                : msg.sender?.name || 'User';

            const newChat: Chat = {
              id: partnerId,
              participant: {
                id: partnerId,
                name: partnerName,
              },
              messages: [msg],
              lastMessage: msg,
              unreadCount: msg.senderId !== currentUser.id ? 1 : 0,
            };
            return [newChat, ...prevChats];
          }
        });
      };

      const handleEditMessage = (msg: Message) => {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.messages.some((m) => m.id === msg.id)) {
              return {
                ...chat,
                messages: chat.messages.map((m) => (m.id === msg.id ? msg : m)),
                lastMessage:
                  chat.lastMessage?.id === msg.id ? msg : chat.lastMessage,
              };
            }
            return chat;
          })
        );
      };

      const handleDeleteMessage = ({
        messageId,
        receiverId,
        senderId,
      }: {
        messageId: number;
        receiverId: number;
        senderId: number;
      }) => {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.id === receiverId || chat.id === senderId) {
              const updatedMessages = chat.messages.filter(
                (m) => m.id !== messageId
              );
              return {
                ...chat,
                messages: updatedMessages,
                lastMessage:
                  chat.lastMessage?.id === messageId
                    ? updatedMessages[0]
                    : chat.lastMessage,
              };
            }
            return chat;
          })
        );
      };

      const handleChatBlocked = ({
        blockerId,
        blockedId,
      }: {
        blockerId: number;
        blockedId: number;
      }) => {
        console.log('Received chat_blocked event:', {
          blockerId,
          blockedId,
          currentUserId: currentUser?.id,
        });
        setChats((prevChats) => {
          const newChats = prevChats.map((chat) => {
            if (chat.id === blockedId && currentUser?.id === blockerId) {
              console.log('Setting blockedByMe for chat:', chat.id);
              return { ...chat, blockedByMe: true };
            }
            if (chat.id === blockerId && currentUser?.id === blockedId) {
              console.log('Setting hasBlockedMe for chat:', chat.id);
              return { ...chat, hasBlockedMe: true };
            }
            return chat;
          });
          return newChats;
        });
      };

      const handleChatUnblocked = ({
        blockerId,
        blockedId,
      }: {
        blockerId: number;
        blockedId: number;
      }) => {
        console.log('Received chat_unblocked event:', {
          blockerId,
          blockedId,
          currentUserId: currentUser?.id,
        });
        setChats((prev) =>
          prev.map((chat) => {
            if (currentUser) {
              if (chat.id === blockedId && currentUser?.id === blockerId) {
                console.log('Clearing blockedByMe for chat:', chat.id);
                return { ...chat, blockedByMe: false };
              }
              if (chat.id === blockerId && currentUser?.id === blockedId) {
                console.log('Clearing hasBlockedMe for chat:', chat.id);
                return { ...chat, hasBlockedMe: false };
              }
            }
            return chat;
          })
        );
      };

      const handleChatCleared = ({ partnerId }: { partnerId: number }) => {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === partnerId ? { ...chat, messages: [] } : chat
          )
        );
      };

      const handleFollowUpdated = (data: {
        followerId: number;
        followingId: number;
        isFollowing: boolean;
      }) => {
        setLatestFollowUpdate(data);
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('message_edited', handleEditMessage);
      socket.on('message_deleted', handleDeleteMessage);
      socket.on('chat_blocked', handleChatBlocked);
      socket.on('chat_unblocked', handleChatUnblocked);
      socket.on('chat_cleared', handleChatCleared);
      socket.on('follow_updated', handleFollowUpdated);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('message_edited', handleEditMessage);
        socket.off('message_deleted', handleDeleteMessage);
        socket.off('chat_blocked', handleChatBlocked);
        socket.off('chat_unblocked', handleChatUnblocked);
        socket.off('chat_cleared', handleChatCleared);
        socket.off('follow_updated', handleFollowUpdated);
      };
    } else {
      disconnectSocket();
    }
  }, [currentUser]);

  const fetchMessagesWithUser = async (
    partnerId: number,
    cursor?: number
  ): Promise<Message[]> => {
    try {
      const url = new URL(`${API_BASE}/chat/messages/${partnerId}`);
      if (cursor) url.searchParams.append('cursor', cursor.toString());

      const res = await fetch(url.toString(), {
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const fetchedMsgs: Message[] = data.messages || [];
        const nextCursor: number | null = data.nextCursor || null;

        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === partnerId) {
              return {
                ...chat,
                messages: cursor
                  ? [...chat.messages, ...fetchedMsgs]
                  : fetchedMsgs,
                unreadCount: cursor ? chat.unreadCount : 0,
                nextCursor,
              };
            }
            return chat;
          })
        );

        return fetchedMsgs;
      }
    } catch (err) {
      console.error('Failed to fetch messages with user', err);
    }
    return [];
  };

  const markAsRead = async (partnerId: number) => {
    try {
      await fetch(`${API_BASE}/chat/read/${partnerId}`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === partnerId) {
            return { ...chat, unreadCount: 0 };
          }
          return chat;
        })
      );
    } catch (err) {
      console.error('Failed to mark messages as read', err);
    }
  };

  const sendMessage = async (receiverId: number, content: string) => {
    if (!content.trim()) return;

    const tempMsgId = Date.now();
    const optimisticMsg: Message = {
      id: tempMsgId,
      senderId: currentUser?.id || 0,
      receiverId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
      isEdited: false,
    };

    setChats((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === receiverId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        const [chat] = updated.splice(existingIndex, 1);
        return [
          {
            ...chat,
            messages: [optimisticMsg, ...chat.messages],
            lastMessage: optimisticMsg,
          },
          ...updated,
        ];
      }
      return prev;
    });

    const socket = getSocket();
    if (socket.connected) {
      socket.emit('send_message', {
        receiverId,
        content: content.trim(),
        tempId: tempMsgId,
      });
    } else {
      try {
        const res = await fetch(`${API_BASE}/chat/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ receiverId, content: content.trim() }),
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.message) {
            const msg: Message = data.message;
            setChats((prev) => {
              const existingIndex = prev.findIndex((c) => c.id === receiverId);
              if (existingIndex !== -1) {
                const updated = [...prev];
                const [chat] = updated.splice(existingIndex, 1);
                const filteredMessages = chat.messages.filter(
                  (m) => m.id !== tempMsgId
                );
                const exists = filteredMessages.some((m) => m.id === msg.id);
                return [
                  {
                    ...chat,
                    messages: exists
                      ? filteredMessages
                      : [msg, ...filteredMessages],
                    lastMessage: msg,
                  },
                  ...updated,
                ];
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error('Failed to send message via HTTP', err);
      }
    }
  };

  const startDirectMessage = (partnerUser: User): Chat => {
    const existing = chats.find((c) => c.id === partnerUser.id);
    if (existing) return existing;

    const newChat: Chat = {
      id: partnerUser.id,
      participant: partnerUser,
      messages: [],
      unreadCount: 0,
    };
    setChats((prev) => [newChat, ...prev]);
    return newChat;
  };

  const editMessage = async (messageId: number, content: string) => {
    if (messageId > 2147483647) {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.messages.some((m) => m.id === messageId)) {
            return {
              ...chat,
              messages: chat.messages.map((m) =>
                m.id === messageId
                  ? { ...m, content: content.trim(), isEdited: true }
                  : m
              ),
              lastMessage:
                chat.lastMessage?.id === messageId
                  ? {
                      ...chat.lastMessage,
                      content: content.trim(),
                      isEdited: true,
                    }
                  : chat.lastMessage,
            };
          }
          return chat;
        })
      );
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ content: content.trim() }),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const msg = data.message;
        setChats((prevChats) =>
          prevChats.map((chat) => {
            if (chat.messages.some((m) => m.id === msg.id)) {
              return {
                ...chat,
                messages: chat.messages.map((m) => (m.id === msg.id ? msg : m)),
                lastMessage:
                  chat.lastMessage?.id === msg.id ? msg : chat.lastMessage,
              };
            }
            return chat;
          })
        );
      }
    } catch (err) {
      console.error('Failed to edit message', err);
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (messageId > 2147483647) {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          const updatedMessages = chat.messages.filter(
            (m) => m.id !== messageId
          );
          if (chat.messages.length !== updatedMessages.length) {
            return {
              ...chat,
              messages: updatedMessages,
              lastMessage:
                chat.lastMessage?.id === messageId
                  ? updatedMessages[0]
                  : chat.lastMessage,
            };
          }
          return chat;
        })
      );
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/chat/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setChats((prevChats) =>
          prevChats.map((chat) => {
            const updatedMessages = chat.messages.filter(
              (m) => m.id !== messageId
            );
            if (chat.messages.length !== updatedMessages.length) {
              return {
                ...chat,
                messages: updatedMessages,
                lastMessage:
                  chat.lastMessage?.id === messageId
                    ? updatedMessages[0]
                    : chat.lastMessage,
              };
            }
            return chat;
          })
        );
      }
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const addPost = async (
    title: string,
    content: string,
    coverImage: string,
    tags: string[]
  ): Promise<Post | undefined> => {
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ title, content, imageUrl: coverImage, tags }),
        credentials: 'include',
      });
      if (res.ok) {
        const newPost = await res.json();
        setPosts((prev) => [newPost, ...prev]);
        return newPost;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleLike = async (postId: number) => {
    try {
      setPosts(
        posts.map((post) => {
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

      const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const postsRes = await fetch(`${API_BASE}/posts`, {
          credentials: 'include',
          headers: getAuthHeaders(),
        });
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData.posts || postsData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addComment = async (
    postId: number,
    content: string,
    parentId?: number
  ) => {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ content, parentId }),
        credentials: 'include',
      });
      if (res.ok) {
        const createdComment = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  _count: {
                    ...p._count,
                    comments: (p._count?.comments ?? 0) + 1,
                    likes: p._count?.likes ?? 0,
                  },
                }
              : p
          )
        );
        return createdComment;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      const res = await fetch(`${API_BASE}/posts/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => ({
            ...p,
            _count: {
              ...p._count,
              comments: Math.max(0, (p._count?.comments ?? 1) - 1),
              likes: p._count?.likes ?? 0,
            },
          }))
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('deleteComment error', err);
      return false;
    }
  };

  const deletePost = async (postId: number) => {
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('deletePost error', err);
      return false;
    }
  };

  const toggleFollow = async (userId: number, currentlyFollowing: boolean) => {
    try {
      if (currentlyFollowing) {
        await fetch(`${API_BASE}/follow`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ toUnfollowUserId: userId }),
          credentials: 'include',
        });
      } else {
        await fetch(`${API_BASE}/follow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ toFollowUserId: userId }),
          credentials: 'include',
        });
      }
    } catch (err) {
      console.error('toggleFollow error', err);
    }
  };

  const fetchFollowCounts = useCallback(async (userId: number) => {
    const res = await fetch(`${API_BASE}/follow/${userId}/counts`, {
      credentials: 'include',
      headers: getAuthHeaders(),
    });
    if (!res.ok)
      return {
        followersCount: 0,
        followingCount: 0,
        isFollowing: false,
        isFollowingMe: false,
        blockedByMe: false,
        hasBlockedMe: false,
      };
    return res.json() as Promise<{
      followersCount: number;
      followingCount: number;
      isFollowing: boolean;
      isFollowingMe: boolean;
      blockedByMe: boolean;
      hasBlockedMe: boolean;
    }>;
  }, []);

  const blockUser = async (userId: number) => {
    try {
      await fetch(`${API_BASE}/users/${userId}/block`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.error('blockUser error', err);
    }
  };

  const unblockUser = async (userId: number) => {
    try {
      await fetch(`${API_BASE}/users/${userId}/unblock`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
    } catch (err) {
      console.error('unblockUser error', err);
    }
  };

  const clearChat = async (partnerId: number) => {
    try {
      await fetch(`${API_BASE}/chat/clear/${partnerId}`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });
      setChats((prev) =>
        prev.map((c) => (c.id === partnerId ? { ...c, messages: [] } : c))
      );
    } catch (err) {
      console.error('clearChat error', err);
    }
  };

  const updateProfile = async (
    name: string,
    bio: string,
    gender: string,
    socialLink: string,
    avatarUrl?: string
  ) => {
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ name, bio, gender, socialLink, avatarUrl }),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        users,
        posts,
        chats,
        isLoading,
        addPost,
        toggleLike,
        addComment,
        deletePost,
        deleteComment,
        toggleFollow,
        fetchFollowCounts,
        blockUser,
        unblockUser,
        clearChat,
        fetchConversations,
        fetchMessagesWithUser,
        sendMessage,
        markAsRead,
        startDirectMessage,
        updateProfile,
        editMessage,
        deleteMessage,
        latestFollowUpdate,
        connectUsersCache,
        setConnectUsersCache,
        connectTotalCache,
        setConnectTotalCache,
      }}
    >
      {isLoading ? (
        <div className="flex h-screen items-center justify-center">
          Loading...
        </div>
      ) : (
        children
      )}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
