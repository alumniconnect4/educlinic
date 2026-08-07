'use client';

import React, { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const AlumniPage = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      const baseUrl = process.env.NEXT_PUBLIC_ALUMNI_URL || '/';
      if (baseUrl !== '/') {
        const session =
          useUserStore.getState().sessionId ||
          (typeof window !== 'undefined'
            ? localStorage.getItem('sessionId')
            : null);
        try {
          const url = new URL(baseUrl);
          if (session) {
            url.searchParams.set('session', session);
          }
          window.location.href = url.toString();
        } catch (err) {
          window.location.href = baseUrl;
        }
      } else {
        window.location.href = '/';
      }
    } else {
      toast.error('Login first to connect with Alumni', {
        toastId: 'alumni-login-error',
      });
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center h-screen text-2xl font-bold">
      Redirecting...
    </div>
  );
};

export default AlumniPage;
