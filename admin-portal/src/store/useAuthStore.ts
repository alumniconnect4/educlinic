import { create } from 'zustand';

interface AuthState {
  user: {
    id?: number;
    name: string;
    role: string;
    email?: string;
    [key: string]: any;
  } | null;
  token: string | null;
  login: (user: any, token?: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: localStorage.getItem('adminUser')
    ? JSON.parse(localStorage.getItem('adminUser')!)
    : null,
  token: localStorage.getItem('adminToken') || null,

  login: (user: any, token?: string) => {
    localStorage.setItem('adminUser', JSON.stringify(user));
    if (token) {
      localStorage.setItem('adminToken', token);
    }
    set({ user, token: token || get().token });
  },

  logout: () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    set({ user: null, token: null });
  },

  isAuthenticated: () => {
    return !!get().user;
  },
}));
