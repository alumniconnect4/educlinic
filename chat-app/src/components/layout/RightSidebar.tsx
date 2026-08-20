import React, { useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, Flame, Sparkles, X, TrendingUp } from 'lucide-react';
import { stripHtml } from '../../utils/text';
import type { Post } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore, getAuthHeaders } from '../../store/mockData';
import { Button } from '../ui/button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const RightSidebar: React.FC = () => {
  const { currentUser } = useStore();
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [discussionPosts, setDiscussionPosts] = useState<Post[]>([]);
  const [helpPosts, setHelpPosts] = useState<Post[]>([]);
  const [isBubbleDismissed, setIsBubbleDismissed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const isProfileIncomplete = Boolean(
    currentUser &&
      (!currentUser.bio ||
        !currentUser.socialLink ||
        (!currentUser.avatarUrl && !currentUser.avatar))
  );

  const handleOpenDrawer = () => {
    setIsDrawerClosing(false);
    setIsMobileDrawerOpen(true);
  };

  const handleCloseDrawer = (onComplete?: () => void) => {
    if (isDrawerClosing) return;
    setIsDrawerClosing(true);
    setTimeout(() => {
      setIsMobileDrawerOpen(false);
      setIsDrawerClosing(false);
      if (onComplete) onComplete();
    }, 250);
  };

  useEffect(() => {
    const listener = () => handleOpenDrawer();
    window.addEventListener('open-mobile-sidebar-drawer', listener);
    return () => window.removeEventListener('open-mobile-sidebar-drawer', listener);
  }, []);

  useEffect(() => {
    if (isMobileDrawerOpen && !isDrawerClosing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen, isDrawerClosing]);

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

  const handlePostClick = (postId: string | number) => {
    if (isMobileDrawerOpen) {
      handleCloseDrawer(() => {
        navigate(`/post/${postId}`);
      });
    } else {
      navigate(`/post/${postId}`);
    }
  };

  const renderPostList = (posts: Post[], emptyMessage: string) => {
    if (posts.length === 0) {
      return (
        <div className="text-xs text-muted-foreground p-4">{emptyMessage}</div>
      );
    }

    return posts.map((post) => (
      <div
        key={post.id}
        onClick={() => handlePostClick(post.id)}
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
      {isHome && (
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
      )}

      {/* Floating Action Button for Mobile/Tablet - Shown only on Home Page */}
      {isHome && (
        <button
          onClick={handleOpenDrawer}
          className="lg:hidden fixed bottom-5 right-5 z-30 flex items-center gap-2 bg-[#3b49df] text-white px-4 py-2.5 rounded-full shadow-xl hover:bg-[#2f3ab2] active:scale-95 transition-all font-semibold text-xs border border-white/20 cursor-pointer"
        >
          <TrendingUp className="w-4 h-4 text-white" />
          <span>Trending & Profile</span>
          {isProfileIncomplete && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>
      )}

      {/* Full Mobile Bottom-Sheet Drawer */}
      {isMobileDrawerOpen && (
        <div
          className={`lg:hidden fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex flex-col justify-end transition-opacity duration-300 ${
            isDrawerClosing ? 'opacity-0 pointer-events-none' : 'opacity-100 animate-in fade-in duration-200'
          }`}
          onClick={() => handleCloseDrawer()}
        >
          <div
            className={`bg-card border-t border-border rounded-t-2xl max-h-[85vh] w-full flex flex-col shadow-2xl overflow-hidden transition-transform duration-300 ease-out transform text-foreground relative z-[100000] ${
              isDrawerClosing ? 'translate-y-full' : 'translate-y-0 animate-in slide-in-from-bottom duration-300'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Grab Bar */}
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto my-2.5 shrink-0" />

            {/* Drawer Header */}
            <div className="px-5 pb-3 pt-1 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-[#3b49df]" />
                  Trending & Profile Setup
                </h3>
                <p className="text-xs text-muted-foreground">
                  Explore hot discussions, help requests & your profile
                </p>
              </div>
              <button
                onClick={() => handleCloseDrawer()}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 overflow-y-auto space-y-4 max-h-[calc(85vh-70px)] bg-muted/10">
              {/* Complete Profile Card inside Mobile Drawer */}
              {isProfileIncomplete && (
                <div className="bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 shadow-xs text-foreground">
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#3b49df]" />
                      Complete Your Profile
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Add your bio, avatar & social links so fellow students and alumni can discover and connect with you.
                  </p>
                  <Button
                    onClick={() => {
                      handleCloseDrawer(() => {
                        navigate(`/profile?id=${currentUser?.id}`);
                      });
                    }}
                    className="bg-[#3b49df] hover:bg-[#2f3ab2] text-white rounded-lg text-xs font-semibold h-9 px-4 w-full cursor-pointer shadow-xs"
                  >
                    Complete Profile Now
                  </Button>
                </div>
              )}

              {/* Trending Posts Card */}
              <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
                <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>Trending Posts</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Hot</span>
                </div>
                <div className="divide-y divide-border/40">
                  {renderPostList(trendingPosts, 'No trending posts right now.')}
                </div>
              </div>

              {/* #discussions Card */}
              <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
                <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
                  <div
                    className="flex items-center gap-2 font-bold text-sm text-foreground cursor-pointer"
                    onClick={() => {
                      handleCloseDrawer(() => {
                        navigate('/?tag=discussions');
                      });
                    }}
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

              {/* #help Card */}
              <div className="bg-card border border-border/80 rounded-xl overflow-hidden shadow-2xs">
                <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20">
                  <div
                    className="flex items-center gap-2 font-bold text-sm text-foreground cursor-pointer"
                    onClick={() => {
                      handleCloseDrawer(() => {
                        navigate('/?tag=help');
                      });
                    }}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};
