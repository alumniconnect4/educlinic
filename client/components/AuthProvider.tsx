'use client';

import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'react-hot-toast';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const fetchUser = useUserStore((state) => state.fetchUser);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    axios.defaults.withCredentials = true;

    // Response interceptor: Catch 401 Unauthorized for auto-logout
    const resInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          const isAuthPage =
            typeof window !== 'undefined' &&
            window.location.pathname.startsWith('/auth');

          const wasAuthenticated = useUserStore.getState().isAuthenticated;
          useUserStore.getState().clearUser();

          if (!isAuthPage && wasAuthenticated) {
            if (!isRedirectingRef.current) {
              isRedirectingRef.current = true;
              toast.error('Session expired. Please log in again.');
              if (typeof window !== 'undefined') {
                window.location.href = '/auth';
              }
              setTimeout(() => {
                isRedirectingRef.current = false;
              }, 1000);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(resInterceptor);
    };
  }, []);

  // Fetch user state on mount and route changes
  useEffect(() => {
    fetchUser();
  }, [fetchUser, pathname]);

  // Periodic re-validation, window focus, and storage event listeners
  useEffect(() => {
    const handleCheck = () => {
      fetchUser();
    };

    const interval = setInterval(() => {
      handleCheck();
    }, 60 * 1000); // Check every 60 seconds

    window.addEventListener('focus', handleCheck);
    window.addEventListener('storage', handleCheck);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleCheck);
      window.removeEventListener('storage', handleCheck);
    };
  }, [fetchUser]);

  return <>{children}</>;
}
