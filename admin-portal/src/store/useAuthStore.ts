import { create } from 'zustand';

interface AuthState {
  user: {
    id?: number;
    name: string;
    role: string;
    email?: string;
    [key: string]: any;
  } | null;
  login: (user: any) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: localStorage.getItem('adminUser')
    ? JSON.parse(localStorage.getItem('adminUser')!)
    : null,

  login: (user: any) => {
    localStorage.setItem('adminUser', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('adminUser');
    set({ user: null });
  },

  isAuthenticated: () => {
    return !!get().user;
  },
}));
