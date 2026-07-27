import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api.ts';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ALUMNI' | 'ADMIN' | 'SUPER_ADMIN';
  schoolCategory?: string | null;
  bio?: string | null;
  gender?: string | null;
  socialLink?: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiRequest<{ user: User }>('/auth/me');
      if (response?.user && (response.user.role === 'ADMIN' || response.user.role === 'SUPER_ADMIN')) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest<{ user: User }>('/auth/login', {
        method: 'POST',
        bodyData: { email, password },
      });
      const loggedUser = response.user;
      
      if (loggedUser.role !== 'ADMIN' && loggedUser.role !== 'SUPER_ADMIN') {
        // Log out immediately if not admin
        await apiRequest('/auth/logout');
        throw new Error('Credentials mismatch');
      }
      
      setUser(loggedUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
