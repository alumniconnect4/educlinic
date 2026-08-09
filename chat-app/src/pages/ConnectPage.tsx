import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
}

export const ConnectPage: React.FC = () => {
  const {
    toggleFollow,
    startDirectMessage,
    connectUsersCache,
    setConnectUsersCache,
    connectTotalCache,
    setConnectTotalCache,
  } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [users, setUsers] = useState<ConnectUser[]>(connectUsersCache);
  const [loading, setLoading] = useState(connectUsersCache.length === 0);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(connectTotalCache);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setSkip(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    if (connectUsersCache.length === 0 || skip > 0 || debouncedSearch !== '') {
      setLoading(true);
    }
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const res = await fetch(
        `${apiUrl}/users?limit=16&skip=${skip}&search=${encodeURIComponent(debouncedSearch)}`,
        {
          headers: getAuthHeaders(),
          credentials: 'include',
        }
      );
      if (res.ok) {
        const data = await res.json();
        const fetchedUsers = data.users || [];
        const fetchedTotal = data.total || 0;
        setUsers(fetchedUsers);
        setTotal(fetchedTotal);
        if (!debouncedSearch && skip === 0) {
          setConnectUsersCache(fetchedUsers);
          setConnectTotalCache(fetchedTotal);
        }
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    skip,
    connectUsersCache.length,
    setConnectUsersCache,
    setConnectTotalCache,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefreshPeople = () => {
    if (skip + 16 >= total && total > 0) {
      setSkip(0);
    } else {
      setSkip((prev) => prev + 16);
    }
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
      setConnectUsersCache((prev) =>
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

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-card border border-border/80 rounded-md p-6 shadow-2xs">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold mb-1">
            Connect with Students
          </h1>
          <p className="text-muted-foreground text-sm">
            Discover and follow peers from various schools and departments.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 w-full">
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
            className="h-11 gap-2 rounded-md shrink-0 px-3 sm:px-4"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh People</span>
          </Button>
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-card border border-border/80 rounded-md overflow-hidden relative flex flex-col h-[280px]"
            >
              <div className="h-20 bg-muted/60 animate-pulse w-full shrink-0" />

              <div className="absolute top-10 left-4">
                <div className="h-20 w-20 rounded-full border-4 border-card bg-muted/60 animate-pulse" />
              </div>

              <div className="pt-12 px-5 pb-5 flex-1 flex flex-col">
                <div className="h-6 bg-muted/60 rounded animate-pulse w-1/2 mb-1" />
                <div className="h-4 bg-muted/60 rounded animate-pulse w-1/3 mb-4" />

                <div className="space-y-2 mb-4 flex-1 mt-1">
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-full" />
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-4/5" />
                </div>

                <div className="h-10 bg-muted/60 rounded-full animate-pulse w-full shrink-0 mt-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {users.map((user) => {
            const isFollowing = user.isFollowed;
            const isFollowLoading = loadingIds.has(user.id);

            return (
              <div
                key={user.id}
                className="bg-card border border-border/80 rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col relative"
                onClick={() => navigate(`/profile?id=${user.id}`)}
              >
                <div className="h-20 bg-[#1a1a1a] w-full" />

                <div className="absolute top-10 left-4">
                  <Avatar className="h-20 w-20 border-4 border-card bg-card">
                    <AvatarImage
                      src={getAvatarUrl(
                        user.name,
                        user.avatarUrl || user.avatar
                      )}
                    />
                    <AvatarFallback className="bg-[#3b49df]/10 text-[#3b49df] text-xl font-bold">
                      {user.name
                        ? user.name.substring(0, 2).toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="pt-12 px-5 pb-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-base text-foreground hover:text-[#3b49df] truncate transition-colors">
                      {user.name}
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-gray-300 bg-white text-gray-700 shadow-2xs uppercase tracking-wider shrink-0">
                      {user.role === 'USER'
                        ? 'Student'
                        : user.role === 'ALUMNI'
                          ? 'Alumni'
                          : user.role === 'SUPER_ADMIN'
                            ? 'Super Admin'
                            : user.role || 'Student'}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate mb-1">
                    {user.schoolCategory?.replace(/_/g, ' ')}
                  </p>
                  <p className="hidden sm:block text-sm text-muted-foreground line-clamp-2 mt-2 mb-4 flex-1">
                    {user.bio || ''}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      onClick={(e) =>
                        handleFollowToggle(e, user.id, isFollowing)
                      }
                      disabled={isFollowLoading}
                      className={
                        isFollowing
                          ? 'bg-muted text-foreground border border-border/80 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors flex-1 rounded-full'
                          : 'bg-[#3b49df] hover:bg-[#2f3ab2] text-white flex-1 rounded-full'
                      }
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-1.5" /> Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1.5" /> Follow
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && users.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground bg-card border border-dashed border-border/80 rounded-md">
              No users found matching "{searchQuery}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
