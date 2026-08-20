import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useStore, getAuthHeaders } from '../store/mockData';
import { getAvatarUrl } from '../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Search,
  UserCheck,
  UserPlus,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Code2,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { MdVerified } from 'react-icons/md';

interface ConnectUser {
  id: number;
  name: string;
  email: string;
  role: string;
  schoolCategory: string | null;
  isFollowed: boolean;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
  socialLink?: string;
  isVerified?: boolean;
  isDeveloper?: boolean;
  developerTitle?: string;
}

// Filled Blue Tick Verified Badge Component using react-icons/md (MdVerified)
export const VerifiedBadge: React.FC<{ size?: number; className?: string }> = ({
  size = 18,
  className = '',
}) => (
  <span
    className={`inline-flex items-center justify-center text-[#0095f6] shrink-0 ${className}`}
    title="Verified Profile"
  >
    <MdVerified size={size} />
  </span>
);

// Developer Tag Badge Component
export const DeveloperBadge: React.FC<{
  title?: string;
  className?: string;
}> = ({ title = 'DEVELOPER', className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50/80 text-indigo-600 uppercase tracking-wider shrink-0 ${className}`}
  >
    <Sparkles className="w-3 h-3 text-indigo-600" />
    {title ? title.toUpperCase() : 'DEVELOPER'}
  </span>
);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const ConnectPage: React.FC = () => {
  const {
    currentUser,
    toggleFollow,
    startDirectMessage,
    connectUsersCache,
    setConnectUsersCache,
    connectTotalCache,
    setConnectTotalCache,
  } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ALUMNI'>('ALL');
  const [users, setUsers] = useState<ConnectUser[]>(connectUsersCache);
  const [developers, setDevelopers] = useState<ConnectUser[]>([]);
  const [shuffledDevelopers, setShuffledDevelopers] = useState<ConnectUser[]>([]);
  const [loading, setLoading] = useState(connectUsersCache.length === 0);
  const [loadingDevs, setLoadingDevs] = useState(true);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [showDevModal, setShowDevModal] = useState(false);
  const [devModalSearch, setDevModalSearch] = useState('');
  const navigate = useNavigate();

  // Fetch developers list and shuffle for random single row display
  const fetchDevelopers = useCallback(async () => {
    try {
      setLoadingDevs(true);
      const res = await fetch(`${API_BASE}/users/developers`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const list: ConnectUser[] = data.developers || (Array.isArray(data) ? data : []);
        setDevelopers(list);
        const shuffled = [...list].sort(() => Math.random() - 0.5);
        setShuffledDevelopers(shuffled);
      }
    } catch (err) {
      console.error('Failed to fetch developers', err);
    } finally {
      setLoadingDevs(false);
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch user directory
  const fetchUsers = useCallback(
    async (search: string, role: string) => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          limit: '16',
          skip: '0',
          excludeDevs: 'true',
          ...(role !== 'ALL' ? { role } : {}),
          ...(search ? { search } : {}),
        });

        const res = await fetch(`${API_BASE}/users?${queryParams}`, {
          headers: getAuthHeaders(),
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to fetch users');

        const data = await res.json();
        const fetchedUsers = data.users || [];
        const fetchedTotal = data.total || 0;

        setUsers(fetchedUsers);
        if (!search && role === 'ALL') {
          setConnectUsersCache(fetchedUsers);
          setConnectTotalCache(fetchedTotal);
        }
      } catch (err) {
        console.error('Error fetching connect users:', err);
      } finally {
        setLoading(false);
      }
    },
    [setConnectUsersCache, setConnectTotalCache]
  );

  // Fetch developers once on mount
  useEffect(() => {
    fetchDevelopers();
  }, [fetchDevelopers]);

  // Fetch users when search query or role filter changes
  useEffect(() => {
    fetchUsers(debouncedSearch, roleFilter);
  }, [fetchUsers, debouncedSearch, roleFilter]);

  // Lock body scroll when developer directory modal is open
  useEffect(() => {
    if (showDevModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDevModal]);

  const handleRefreshPeople = () => {
    fetchUsers(debouncedSearch, roleFilter);
  };

  const handleFollowToggle = async (
    e: React.MouseEvent,
    userId: number,
    isFollowing: boolean
  ) => {
    e.stopPropagation();
    setLoadingIds((prev) => new Set(prev).add(userId));
    try {
      await toggleFollow(userId, isFollowing);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isFollowed: !isFollowing } : u
        )
      );
      setDevelopers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isFollowed: !isFollowing } : u
        )
      );
      setShuffledDevelopers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isFollowed: !isFollowing } : u
        )
      );
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleDirectMessage = async (e: React.MouseEvent, user: ConnectUser) => {
    e.stopPropagation();
    try {
      const chat = startDirectMessage({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || user.avatar || undefined,
        avatar: user.avatarUrl || user.avatar || undefined,
        isDeveloper: user.isDeveloper,
        developerTitle: user.developerTitle,
        schoolCategory: user.schoolCategory,
      });
      navigate(`/chat?userId=${chat.id}`);
    } catch (err) {
      console.error('Failed to start chat', err);
    }
  };

  const displayedDevelopers = (shuffledDevelopers.length > 0 ? shuffledDevelopers : developers).slice(0, 2);
  const filteredDevModalList = developers.filter((d) =>
    d.name.toLowerCase().includes(devModalSearch.toLowerCase()) ||
    (d.developerTitle && d.developerTitle.toLowerCase().includes(devModalSearch.toLowerCase()))
  );

  // Exclude developers from the general users grid unless searching
  const displayedGeneralUsers = debouncedSearch.trim() !== ''
    ? users
    : users.filter((u) => !u.isDeveloper);

  return (
    <div className="space-y-8 pb-8">
      {/* 🔍 SEARCH AND REFRESH BAR AT TOP */}
      <div className="bg-card border border-border/80 rounded-lg p-6 shadow-2xs">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold mb-1">
            Connect with Students & Alumni
          </h2>
          <p className="text-muted-foreground text-sm">
            Discover and follow peers from various schools and departments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 sm:gap-4 flex-1">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 text-base bg-muted/40 border-border/60 focus-visible:ring-1 focus-visible:ring-[#3b49df]"
              />
            </div>
            <Button
              onClick={handleRefreshPeople}
              variant="outline"
              className="h-11 gap-2 rounded-md shrink-0 px-3 sm:px-4 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh People</span>
            </Button>
          </div>

          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg shrink-0 self-start sm:self-auto">
            {(['ALL', 'USER', 'ALUMNI'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${roleFilter === r
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {r === 'ALL' ? 'All' : r === 'USER' ? 'Students' : 'Alumni'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🚀 CORE BUILDERS SECTION (MINIMALIST & SLEEK) */}
      <div className="bg-card border border-border/80 rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#3b49df]" />
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Developers Team
            </h2>
          </div>

          {developers.length > 0 && (
            <Button
              onClick={() => setShowDevModal(true)}
              variant="ghost"
              className="text-xs font-semibold text-[#3b49df] hover:bg-indigo-50 px-3 py-1 h-8 rounded-md flex items-center gap-1"
            >
              <span>View All ({developers.length})</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Developers Cards Grid - Single Row of 2 Cards */}
        {loadingDevs ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-card border border-border/80 rounded-lg overflow-hidden relative flex flex-col h-[200px] sm:h-[260px]"
              >
                <div className="h-14 sm:h-20 bg-muted/60 animate-pulse w-full shrink-0" />
                <div className="absolute top-7 sm:top-10 left-3 sm:left-4">
                  <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full border-4 border-card bg-muted/60 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedDevelopers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayedDevelopers.map((dev) => {
              return (
                <div
                  key={dev.id}
                  className="bg-card border border-border/80 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col relative"
                  onClick={() => navigate(`/profile?id=${dev.id}`)}
                >
                  <div className="h-14 sm:h-20 bg-[#1a1a1a] w-full" />

                  <div className="absolute top-7 sm:top-10 left-3 sm:left-4">
                    <Avatar className="h-14 w-14 sm:h-20 sm:w-20 border-4 border-card bg-card">
                      <AvatarImage
                        src={getAvatarUrl(
                          dev.name,
                          dev.avatarUrl || dev.avatar,
                          160
                        )}
                        loading="eager"
                        decoding="async"
                        width={80}
                        height={80}
                      />
                      <AvatarFallback className="bg-[#3b49df]/10 text-[#3b49df] text-base sm:text-xl font-bold">
                        {dev.name ? dev.name.substring(0, 2).toUpperCase() : 'DEV'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="pt-9 sm:pt-12 px-3 sm:px-5 pb-3 sm:pb-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 mb-1">
                      <h3 className="font-bold text-xs sm:text-base text-foreground hover:text-[#3b49df] truncate transition-colors">
                        {dev.name}
                      </h3>
                      <VerifiedBadge size={16} />
                    </div>

                    <div className="mb-1.5 sm:mb-2">
                      <DeveloperBadge title={dev.developerTitle || 'DEVELOPER'} />
                    </div>

                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate mb-2 sm:mb-3">
                      {dev.schoolCategory
                        ? dev.schoolCategory.replace(/_/g, ' ')
                        : 'EduClinic Tech Team'}
                    </p>

                    <div className="flex items-center gap-1.5 sm:gap-2 mt-auto">
                      {currentUser?.id === dev.id ? (
                        <Button
                          onClick={() => navigate(`/profile?id=${dev.id}`)}
                          variant="outline"
                          className="w-full border-border/80 text-foreground hover:bg-muted rounded-full text-[10px] sm:text-xs font-semibold h-7 sm:h-9 cursor-pointer px-1 sm:px-3"
                        >
                          View Profile
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={(e) => handleDirectMessage(e, dev)}
                            variant="outline"
                            className="border-border/80 hover:bg-muted text-foreground rounded-full h-7 w-7 sm:h-9 sm:w-9 p-0 flex items-center justify-center shrink-0 cursor-pointer"
                            title="Message Developer"
                          >
                            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3b49df]" />
                          </Button>

                          <Button
                            onClick={(e) => handleFollowToggle(e, dev.id, dev.isFollowed)}
                            disabled={loadingIds.has(dev.id)}
                            className={
                              dev.isFollowed
                                ? 'bg-muted text-foreground border border-border/80 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors flex-1 rounded-full text-[10px] sm:text-xs font-semibold h-7 sm:h-9 cursor-pointer px-1 sm:px-3'
                                : 'bg-[#3b49df] hover:bg-[#2f3ab2] text-white flex-1 rounded-full text-[10px] sm:text-xs font-semibold h-7 sm:h-9 cursor-pointer px-1 sm:px-3'
                            }
                          >
                            {dev.isFollowed ? (
                              <>
                                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 shrink-0" />
                                <span className="truncate">Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 shrink-0" />
                                <span className="truncate">Follow</span>
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground border border-dashed border-border/80 rounded-md bg-muted/20">
            <p className="font-semibold text-xs text-foreground">No Core Builders designated yet</p>
          </div>
        )}
      </div>

      {/* CORE BUILDERS FULL MODAL (MOUNTED TO BODY VIA PORTAL FOR 100% SCREEN COVERAGE) */}
      {showDevModal && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-hidden animate-in fade-in duration-200"
          onClick={() => setShowDevModal(false)}
        >
          <div
            className="bg-card border border-border/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-foreground relative z-[100000]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-foreground tracking-tight">
                    Developers Team
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Complete team directory ({developers.length} members)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDevModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Filter */}
            <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-border bg-card">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search builders by name..."
                  value={devModalSearch}
                  onChange={(e) => setDevModalSearch(e.target.value)}
                  className="pl-9 h-9 bg-muted/40 border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-[#3b49df] text-xs sm:text-sm rounded-lg"
                />
              </div>
            </div>

            {/* Modal Content Grid */}
            <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-muted/10">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                {filteredDevModalList.map((dev) => {
                  const isFollowing = dev.isFollowed;
                  const isFollowLoading = loadingIds.has(dev.id);

                  return (
                    <div
                      key={dev.id}
                      className="bg-card border border-border/80 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col relative"
                      onClick={() => {
                        setShowDevModal(false);
                        navigate(`/profile?id=${dev.id}`);
                      }}
                    >
                      <div className="h-12 sm:h-16 bg-[#1a1a1a] w-full" />

                      <div className="absolute top-6 sm:top-8 left-2.5 sm:left-4">
                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-4 border-card bg-card">
                          <AvatarImage
                            src={getAvatarUrl(
                              dev.name,
                              dev.avatarUrl || dev.avatar,
                              160
                            )}
                          />
                          <AvatarFallback className="bg-[#3b49df]/10 text-[#3b49df] text-xs sm:text-base font-bold">
                            {dev.name ? dev.name.substring(0, 2).toUpperCase() : 'DEV'}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="pt-7 sm:pt-10 px-2.5 sm:px-4 pb-2.5 sm:pb-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 mb-1">
                          <h3 className="font-bold text-xs sm:text-sm text-foreground hover:text-[#3b49df] truncate transition-colors">
                            {dev.name}
                          </h3>
                          <VerifiedBadge size={14} />
                        </div>

                        <div className="mb-1.5">
                          <DeveloperBadge title={dev.developerTitle || 'DEVELOPER'} />
                        </div>

                        <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate mb-2 sm:mb-3">
                          {dev.schoolCategory?.replace(/_/g, ' ') || 'EduClinic Tech Team'}
                        </p>

                        <div className="flex items-center gap-1.5 sm:gap-2 mt-auto">
                          {currentUser?.id === dev.id ? (
                            <Button
                              onClick={() => {
                                setShowDevModal(false);
                                navigate(`/profile?id=${dev.id}`);
                              }}
                              variant="outline"
                              className="w-full border-border/80 text-foreground hover:bg-muted rounded-full text-[10px] sm:text-xs font-semibold h-7 sm:h-8 cursor-pointer px-1 sm:px-3"
                            >
                              View Profile
                            </Button>
                          ) : (
                            <>
                              <Button
                                onClick={(e) => {
                                  setShowDevModal(false);
                                  handleDirectMessage(e, dev);
                                }}
                                variant="outline"
                                className="border-border/80 hover:bg-muted text-foreground rounded-full h-7 w-7 sm:h-8 sm:w-8 p-0 flex items-center justify-center shrink-0 cursor-pointer"
                                title="Message Developer"
                              >
                                <MessageSquare className="h-3.5 w-3.5 text-[#3b49df]" />
                              </Button>

                              <Button
                                onClick={(e) => handleFollowToggle(e, dev.id, isFollowing)}
                                disabled={isFollowLoading}
                                className={
                                  isFollowing
                                    ? 'bg-muted text-foreground border border-border/80 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors flex-1 rounded-full text-[10px] sm:text-xs font-semibold h-7 sm:h-8 cursor-pointer px-1 sm:px-3'
                                    : 'bg-[#3b49df] hover:bg-[#2f3ab2] text-white flex-1 rounded-full text-[10px] sm:text-xs font-semibold h-7 sm:h-8 cursor-pointer px-1 sm:px-3'
                                }
                              >
                                {isFollowing ? (
                                  <>
                                    <UserCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1 shrink-0" />
                                    <span className="truncate">Following</span>
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1 shrink-0" />
                                    <span className="truncate">Follow</span>
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredDevModalList.length === 0 && (
                  <div className="col-span-full py-12 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-xl bg-card">
                    No builders found matching "{devModalSearch}".
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* GENERAL USERS GRID WITH VERIFIED BLUE TICKS & DEVELOPER BADGES */}
      {loading && displayedGeneralUsers.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-card border border-border/80 rounded-lg overflow-hidden relative flex flex-col h-[200px] sm:h-[260px]"
            >
              <div className="h-14 sm:h-20 bg-muted/60 animate-pulse w-full shrink-0" />
              <div className="absolute top-7 sm:top-10 left-3 sm:left-4">
                <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full border-4 border-card bg-muted/60 animate-pulse" />
              </div>
              <div className="pt-9 sm:pt-12 px-3 sm:px-5 pb-3 sm:pb-5 flex-1 flex flex-col">
                <div className="h-5 sm:h-6 bg-muted/60 rounded animate-pulse w-1/2 mb-1" />
                <div className="h-3 sm:h-4 bg-muted/60 rounded animate-pulse w-1/3 mb-4" />
                <div className="h-7 sm:h-10 bg-muted/60 rounded-full animate-pulse w-full shrink-0 mt-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {displayedGeneralUsers.map((user, index) => {
            const isFollowing = user.isFollowed;
            const isFollowLoading = loadingIds.has(user.id);
            const isAboveTheFold = index < 4;

            return (
              <div
                key={user.id}
                className="bg-card border border-border/80 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col relative"
                onClick={() => navigate(`/profile?id=${user.id}`)}
              >
                <div className="h-14 sm:h-20 bg-[#1a1a1a] w-full" />

                <div className="absolute top-7 sm:top-10 left-3 sm:left-4">
                  <Avatar className="h-14 w-14 sm:h-20 sm:w-20 border-4 border-card bg-card">
                    <AvatarImage
                      src={getAvatarUrl(
                        user.name,
                        user.avatarUrl || user.avatar,
                        160
                      )}
                      loading={isAboveTheFold ? 'eager' : 'lazy'}
                      fetchPriority={isAboveTheFold ? 'high' : 'auto'}
                      decoding="async"
                      width={80}
                      height={80}
                    />
                    <AvatarFallback className="bg-[#3b49df]/10 text-[#3b49df] text-base sm:text-xl font-bold">
                      {user.name
                        ? user.name.substring(0, 2).toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="pt-9 sm:pt-12 px-3 sm:px-5 pb-3 sm:pb-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 mb-1">
                    <h3 className="font-bold text-xs sm:text-base text-foreground hover:text-[#3b49df] truncate transition-colors">
                      {user.name}
                    </h3>
                    {user.isDeveloper && <VerifiedBadge size={16} />}
                  </div>

                  <div className="mb-1.5 sm:mb-2">
                    {user.isDeveloper ? (
                      <DeveloperBadge
                        title={user.developerTitle || 'DEVELOPER'}
                      />
                    ) : (
                      <span className="inline-flex items-center text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600 uppercase tracking-wider shrink-0">
                        {user.role === 'USER'
                          ? 'STUDENT'
                          : user.role === 'ALUMNI'
                            ? 'ALUMNI'
                            : user.role === 'SUPER_ADMIN'
                              ? 'SUPER ADMIN'
                              : user.role?.toUpperCase() || 'STUDENT'}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate mb-2 sm:mb-3">
                    {user.schoolCategory?.replace(/_/g, ' ') || 'EduClinic Member'}
                  </p>

                  <div className="flex gap-2 mt-auto">
                    {currentUser?.id === user.id ? (
                      <Button
                        onClick={() => navigate(`/profile?id=${user.id}`)}
                        variant="outline"
                        className="w-full border-border/80 text-foreground hover:bg-muted rounded-full text-[10px] sm:text-xs font-semibold h-7 sm:h-9 cursor-pointer px-1 sm:px-3"
                      >
                        View Profile
                      </Button>
                    ) : (
                      <Button
                        onClick={(e) =>
                          handleFollowToggle(e, user.id, isFollowing)
                        }
                        disabled={isFollowLoading}
                        className={
                          isFollowing
                            ? 'bg-muted text-foreground border border-border/80 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors flex-1 rounded-full text-[10px] sm:text-xs font-semibold h-7 sm:h-9 cursor-pointer px-1 sm:px-3'
                            : 'bg-[#3b49df] hover:bg-[#2f3ab2] text-white flex-1 rounded-full text-[10px] sm:text-xs font-semibold h-7 sm:h-9 cursor-pointer px-1 sm:px-3'
                        }
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1.5 shrink-0" />
                            <span className="truncate">Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1.5 shrink-0" />
                            <span className="truncate">Follow</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && displayedGeneralUsers.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground bg-card border border-dashed border-border/80 rounded-md">
              No users found matching "{searchQuery}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
