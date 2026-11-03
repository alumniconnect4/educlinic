'use client';
import AuthContent from '@/components/Login/AuthContent';
import AuthForm from '@/components/Login/AuthForm';
import AuthNav from '@/components/Login/AuthNav';
import { useUserStore } from '@/store/useUserStore';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { UserStore } from '@/store/useUserStore';

const LoginPage = () => {
  const authenticated = useUserStore(
    (state: UserStore) => state.isAuthenticated
  );
  const router = useRouter();
  const wasAlreadyAuthenticated = useRef(authenticated);

  useEffect(() => {
    if (authenticated) {
      router.push('/');
      if (wasAlreadyAuthenticated.current) {
        toast.info('You are already Logged In', {
          toastId: 'auth-already-logged-in',
        });
      }
    }
  }, [authenticated, router]);
  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center font-sans">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'url("https://media.istockphoto.com/id/171271182/photo/delhi-university-building-and-corridor.webp?s=2048x2048&w=is&k=20&c=63Su_Hgd1hMJ3kxaQNyXYdqXXThFhFZYENEakkFHgFs=")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/50 sm:bg-linear-to-r sm:from-black/80 sm:to-black/40"></div>
      </div>

      <AuthNav />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20 relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full mt-24 sm:mt-28 lg:mt-36 gap-8 lg:gap-12 mb-12">
        <div className="hidden lg:block lg:w-1/2">
          <AuthContent />
        </div>
        <div className="w-full max-w-md lg:max-w-lg lg:w-1/2 flex justify-center lg:justify-end">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
