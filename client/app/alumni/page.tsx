'use client';

import React, { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const AlumniPage = () => {
  const router = useRouter();
  const [statusText, setStatusText] = useState('Verifying alumni access...');

  useEffect(() => {
    let isCancelled = false;

    const performRedirect = async () => {
      try {
        const session = await useUserStore
          .getState()
          .validateOrRefreshSession();

        if (isCancelled) return;

        if (session) {
          const baseUrl = process.env.NEXT_PUBLIC_ALUMNI_URL || '/';
          if (baseUrl !== '/') {
            try {
              const url = new URL(baseUrl);
              url.searchParams.set('session', session);
              setStatusText('Redirecting to Alumni Platform...');
              window.location.href = url.toString();
              return;
            } catch (err) {
              window.location.href = baseUrl;
              return;
            }
          } else {
            router.push('/');
          }
        } else {
          toast.error(
            'Session expired or login required. Please sign in to connect with Alumni.',
            {
              toastId: 'alumni-login-error',
            }
          );
          router.push('/auth');
        }
      } catch (err) {
        if (!isCancelled) {
          toast.error('Failed to verify credentials. Please sign in again.', {
            toastId: 'alumni-login-error',
          });
          router.push('/auth');
        }
      }
    };

    performRedirect();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <Loader2 className="w-10 h-10 animate-spin text-[#d60000]" />
      <p className="text-xl font-semibold text-gray-800">{statusText}</p>
      <p className="text-sm text-gray-500">
        Please wait while we establish your secure session.
      </p>
    </div>
  );
};

export default AlumniPage;
