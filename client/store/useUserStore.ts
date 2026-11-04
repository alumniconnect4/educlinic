import { create } from 'zustand';
import axios from 'axios';

export interface UserStore {
  user: any;
  sessionId: string | null;
  isAuthenticated: boolean;
  setUser: (user: any, sessionId?: string) => void;
  clearUser: () => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  fetchUser: () => Promise<void>;
  validateOrRefreshSession: () => Promise<string | null>;
}

export const useUserStore = create<UserStore>()((set, get) => ({
  user: null,
  sessionId:
    typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null,
  isAuthenticated: false,

  setUser: (user: any, sessionId?: string) => {
    if (sessionId && typeof window !== 'undefined') {
      localStorage.setItem('sessionId', sessionId);
    }
    set({
      user,
      sessionId:
        sessionId ||
        get().sessionId ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('sessionId')
          : null),
      isAuthenticated: true,
    });
  },

  clearUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionId');
      localStorage.removeItem('chatSessionId');
      document.cookie =
        'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure';
      document.cookie =
        'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure';
    }
    set({ user: null, sessionId: null, isAuthenticated: false });
  },

  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),

  fetchUser: async () => {
    try {
      const storedSession =
        typeof window !== 'undefined'
          ? localStorage.getItem('sessionId')
          : null;

      const headers: Record<string, string> = storedSession
        ? { Authorization: `Bearer ${storedSession}` }
        : {};

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          headers,
          withCredentials: true,
        }
      );

      const returnedSession = res.data?.sessionId || storedSession;
      if (returnedSession && typeof window !== 'undefined') {
        localStorage.setItem('sessionId', returnedSession);
      }

      set({
        user: res.data.user,
        sessionId: returnedSession,
        isAuthenticated: true,
      });
    } catch (err) {
      get().clearUser();
    }
  },

  validateOrRefreshSession: async (): Promise<string | null> => {
    try {
      const storedSession =
        get().sessionId ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('sessionId')
          : null);

      const headers: Record<string, string> = storedSession
        ? { Authorization: `Bearer ${storedSession}` }
        : {};

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          headers,
          withCredentials: true,
        }
      );

      const validSession = res.data?.sessionId || storedSession;
      if (validSession && typeof window !== 'undefined') {
        localStorage.setItem('sessionId', validSession);
      }

      set({
        user: res.data.user,
        sessionId: validSession,
        isAuthenticated: true,
      });

      return validSession || null;
    } catch (err) {
      get().clearUser();
      return null;
    }
  },
}));
