import { create } from 'zustand';

interface AuthState {
  user: { name: string, role: string } | null;
  login: (user: { name: string, role: string }) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: localStorage.getItem('adminUser') ? JSON.parse(localStorage.getItem('adminUser')!) : null,

  login: (user: { name: string, role: string }) => {
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
