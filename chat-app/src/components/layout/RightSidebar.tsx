import React, { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, Flame, Sparkles, X } from 'lucide-react';
import { stripHtml } from '../../utils/text';
import type { Post } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useStore, getAuthHeaders } from '../../store/mockData';
import { Button } from '../ui/button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const RightSidebar: React.FC = () => {
  const { currentUser } = useStore();
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [discussionPosts, setDiscussionPosts] = useState<Post[]>([]);
  const [helpPosts, setHelpPosts] = useState<Post[]>([]);
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);
  const navigate = useNavigate();

  const isProfileIncomplete = Boolean(
    currentUser &&
      (!currentUser.bio ||
        !currentUser.socialLink ||
        (!currentUser.avatarUrl && !currentUser.avatar))
  );

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_BASE}/posts?limit=2&sortBy=likes`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setTrendingPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Failed to fetch trending posts', err);
      }
    };

    const fetchDiscussions = async () => {
      try {
        const res = await fetch(`${API_BASE}/posts?limit=2&tag=discussions`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setDiscussionPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Failed to fetch discussion posts', err);
      }
    };

    const fetchHelp = async () => {
      try {
        const res = await fetch(`${API_BASE}/posts?limit=2&tag=help`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setHelpPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Failed to fetch help posts', err);
      }
    };

    fetchTrending();
    fetchDiscussions();
    fetchHelp();
  }, []);

  const renderPostList = (posts: Post[], emptyMessage: string) => {
    if (posts.length === 0) {
      return (
        <div className="text-xs text-muted-foreground p-4">{emptyMessage}</div>
      );
    }

    return posts.map((post) => (
      <div
        key={post.id}
        onClick={() => navigate(`/post/${post.id}`)}
        className="group cursor-pointer p-4 hover:bg-muted/40 transition-colors"
      >
        <h4 className="text-sm font-medium text-foreground group-hover:text-[#3b49df] transition-colors leading-snug line-clamp-2">
          {post.title || stripHtml(post.content)}
        </h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <span>
            {post._count?.comments || post.comments?.length || 0} comments
          </span>
        </div>
      </div>
    ));
  };

  return (
    <>
      <aside className="hidden lg:block w-[320px] shrink-0 pt-1 pl-2 sticky top-16 self-start max-h-[calc(100vh-4.5rem)] overflow-y-auto space-y-4 text-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Minimal Light Profile Completion Card in Right Free Space Column */}
        {isProfileIncomplete && !isBubbleDismissed && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-slate-800 relative mb-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3b49df]" />
                Complete your profile
              </span>
              <button
                onClick={() => setIsBubbleDismissed(true)}
                className="text-gray-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug mb-3">
              Add your bio, avatar & social links for a better experience across the community.
            </p>

            <Button
              onClick={() => navigate(`/profile?id=${currentUser?.id}`)}
              className="bg-[#3b49df] hover:bg-[#2f3ab2] text-white rounded-md text-xs font-semibold h-8 px-3 w-full cursor-pointer shadow-none"
            >
              Complete Profile
            </Button>
          </div>
        )}

        <div className="bg-card border border-border/80 rounded-md overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2 font-bold text-base text-foreground hover:text-[#3b49df] cursor-pointer transition-colors">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Trending Posts</span>
            </div>
            <span className="text-xs text-muted-foreground">Hot</span>
          </div>
          <div className="divide-y divide-border/40">
            {renderPostList(trendingPosts, 'No trending posts right now.')}
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-md overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <div
              className="flex items-center gap-2 font-bold text-base text-foreground hover:text-[#3b49df] cursor-pointer transition-colors"
              onClick={() => navigate('/?tag=discussions')}
            >
              <MessageSquare className="h-4 w-4 text-[#3b49df]" />
              <span>#discussions</span>
            </div>
            <span className="text-xs text-muted-foreground">Interact</span>
          </div>
          <div className="divide-y divide-border/40">
            {renderPostList(discussionPosts, 'No discussions active right now.')}
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-md overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <div
              className="flex items-center gap-2 font-bold text-base text-foreground hover:text-[#3b49df] cursor-pointer transition-colors"
              onClick={() => navigate('/?tag=help')}
            >
              <HelpCircle className="h-4 w-4 text-emerald-600" />
              <span>#help</span>
            </div>
            <span className="text-xs text-muted-foreground">Support</span>
          </div>
          <div className="divide-y divide-border/40">
            {renderPostList(helpPosts, 'No help requests right now.')}
          </div>
        </div>
      </aside>

      {/* Floating Bottom Right Free Space Card for Mobile/Tablet */}
      {isProfileIncomplete && !isBubbleDismissed && (
        <div className="lg:hidden fixed bottom-5 right-5 z-40 w-64 bg-white border border-gray-200 rounded-xl p-3.5 shadow-xl text-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#3b49df]" />
              Complete your profile
            </span>
            <button
              onClick={() => setIsBubbleDismissed(true)}
              className="text-gray-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug mb-2.5">
            Add bio & avatar to stand out in the network.
          </p>

          <Button
            onClick={() => navigate(`/profile?id=${currentUser?.id}`)}
            className="bg-[#3b49df] hover:bg-[#2f3ab2] text-white rounded-md text-xs font-semibold h-7 px-3 w-full cursor-pointer shadow-none"
          >
            Complete Profile
          </Button>
        </div>
      )}
    </>
  );
};
