import React from 'react';
import {
  Home,
  MessageSquare,
  User as UserIcon,
  Bookmark,
  Users,
  Code2,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/mockData';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  hideOnDesktop?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  hideOnDesktop,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useStore();

  const isProfileIncomplete = Boolean(
    currentUser &&
    (!currentUser.bio ||
      !currentUser.socialLink ||
      (!currentUser.avatarUrl && !currentUser.avatar))
  );

  const mainNavItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Connect', icon: Users, path: '/connect' },
    { name: 'Direct Messages', icon: MessageSquare, path: '/chat' },
    { name: 'My Profile', icon: UserIcon, path: '/profile' },
  ];

  const popularTags = [
    'campus',
    'events',
    'coding',
    'sports',
    'placements',
    'hackathon',
    'clubs',
    'interview',
    'experience',
    'roadmap',
    'information',
    'ai',
    'discussions',
    'projects',
    'internships',
    'research',
    'opportunities',
    'help',
    'announcements',
  ];

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-md z-40 md:hidden transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar content */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 md:top-16 z-50 md:z-0
          h-screen md:max-h-[calc(100vh-4.5rem)]
          w-[280px] md:w-[240px] shrink-0
          bg-background md:bg-transparent
          border-r md:border-none border-border/60
          pt-4 md:pt-1 px-4 md:px-0 md:pr-2
          overflow-y-auto space-y-5 text-sm
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${hideOnDesktop ? 'md:hidden' : 'md:block'}
          [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
        `}
      >
        <div className="flex md:hidden items-center justify-between mb-3 pb-2 border-b border-border/60">
          <span className="font-bold text-lg">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="-mr-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {!currentUser && (
          <div className="bg-card border border-border/80 rounded-md p-4 space-y-3 shadow-2xs">
            <h2 className="font-bold text-base leading-tight">
              EduClinic is our college's internal community
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A place for students to connect, share resources, and grow
              together.
            </p>
            <div className="space-y-2 pt-1">
              <Button
                className="w-full bg-[#3b49df] hover:bg-[#2f3ab2] text-white font-medium shadow-xs"
                size="sm"
              >
                Create account
              </Button>
              <Button
                variant="ghost"
                className="w-full text-foreground hover:bg-muted"
                size="sm"
              >
                Log in
              </Button>
            </div>
          </div>
        )}

        <nav className="flex flex-col space-y-0.5">
          {mainNavItems.map((item) => {
            let isActive = location.pathname === item.path;

            // If it's the profile tab, it should only be active if we are viewing our OWN profile
            if (item.path === '/profile' && isActive) {
              const searchParams = new URLSearchParams(location.search);
              const profileId = searchParams.get('id');
              if (profileId && profileId !== String(currentUser?.id)) {
                isActive = false;
              }
            }

            return (
              <Button
                key={item.name}
                variant="ghost"
                className={`justify-start w-full font-normal h-10 px-3 hover:bg-[#3b49df]/10 hover:text-[#3b49df] transition-colors rounded-md ${
                  isActive
                    ? 'font-bold bg-[#3b49df]/10 text-[#3b49df]'
                    : 'text-foreground/90'
                }`}
                onClick={() => {
                  navigate(item.path);
                  onClose?.();
                }}
              >
                <item.icon
                  className="mr-3 h-5 w-5 shrink-0"
                  strokeWidth={isActive ? 2.2 : 1.75}
                />
                <span className="truncate flex-1 text-left">{item.name}</span>
                {item.name === 'My Profile' && isProfileIncomplete && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full  text-blue-800 border-blue-800 border-1">
                    Incomplete
                  </span>
                )}
              </Button>
            );
          })}
        </nav>

        <div className="pt-2">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Trending Topics
            </h3>
          </div>
          <div className="flex flex-col space-y-0.5">
            {popularTags.map((tag) => (
              <div
                key={tag}
                onClick={() => {
                  navigate(`/?tag=${tag}`);
                  onClose?.();
                }}
                className="flex items-center justify-between px-3 py-1.5 rounded-md text-foreground/80 hover:text-[#3b49df] hover:bg-[#3b49df]/10 transition-colors group cursor-pointer"
              >
                <span className="font-mono text-sm group-hover:underline">
                  #{tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-3 pt-4 border-t border-border/60 text-xs text-muted-foreground space-y-2 leading-relaxed">
          <p className="flex items-center gap-1">
            <Code2 className="h-3.5 w-3.5 text-[#3b49df]" />
            <span>EduClinic &copy; {new Date().getFullYear()}</span>
          </p>
          <p>Built for our college community.</p>
        </div>
      </aside>
    </>
  );
};
