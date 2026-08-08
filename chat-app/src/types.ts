export interface User {
  id: number;
  name: string;
  role?: string;
  avatar?: string;
  avatarUrl?: string;
  isFollowed?: boolean;
  bio?: string;
  coverImage?: string;
  followersCount?: number;
  followingCount?: number;
  gender?: string | null;
  socialLink?: string | null;
  schoolCategory?: string;
  createdAt?: string;
}

export interface Comment {
  id: number;
  author: User;
  content: string;
  createdAt: string;
  isLiked?: boolean;
  replies?: Comment[];
}

export interface Post {
  id: number;
  author?: User;
  createdBy?: User;
  title?: string;
  content: string;
  imageUrl?: string;
  coverImage?: string;
  tags?: string[];
  likes?: number;
  _count?: { likes: number; comments: number };
  isLiked: boolean;
  comments: Comment[];
  createdAt: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId?: number;
  content: string;
  isRead?: boolean;
  isEdited?: boolean;
  createdAt: string;
  sender?: { id: number; name: string };
  receiver?: { id: number; name: string };
  tempId?: number;
}

export interface Chat {
  id: number;
  participant: User;
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
  blockedByMe?: boolean;
  hasBlockedMe?: boolean;
  nextCursor?: number | null;
}
