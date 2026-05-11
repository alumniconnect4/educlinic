'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const MainNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAuthenticated = useUserStore((state: any) => state.isAuthenticated);
  const router=useRouter();

  const routes = ['Home', 'Events', 'Alumni', 'Gallery'];

  const handleLogout=async()=>{
    try{
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { withCredentials: true });
      useUserStore.getState().clearUser();
      useUserStore.setState({isAuthenticated:false})
      toast.success("Logged out successfully! ");
      router.push('/');
    }catch(err){
      console.log(err);
    }
  }

  return (
    <div className="bg-white w-full shadow-sm border-b border-gray-100">
      <div className="w-full px-6 md:px-12 lg:px-32 xl:px-58 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Image
            src="/logo1.png"
            alt="College Logo"
            width={220}
            height={60}
            loading="eager"
            className="w-auto h-auto object-contain"
          />
          <Image
            src="/logo2.jpg"
            alt="NAAC Logo"
            width={110}
            height={60}
            className="w-auto h-auto object-contain hidden md:block"
          />
        </div>

        <div className="hidden lg:flex items-center space-x-8">
          {routes.map((route) => {
            const href =
              route === 'Home' ? '/' : `/${route.toLocaleLowerCase()}`;
            const isActive = pathname === href;

            return (
              <Link
                key={route}
                href={href}
                className={`text-sm md:text-base font-semibold py-4 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#d60000] text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-[#d60000]'
                }`}
              >
                {route}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-4">
          {
            isAuthenticated ? (
                <button onClick={handleLogout} className="bg-[#d60000] hover:bg-[#b30000] text-white hidden  cursor-pointer px-4 py-3 mt-4 rounded lg:flex items-center justify-center space-x-2 font-medium w-full">
                  <span>Logout</span>
                  <ArrowRight size={18} />
                </button>
            ) : (
              <Link href="/auth">
                <button className="bg-[#d60000] hover:bg-[#b30000] text-white cursor-pointer px-4 py-3 mt-4 rounded flex items-center justify-center space-x-2 font-medium w-full">
                  <span>Login</span>
                  <ArrowRight size={18} />
                </button>
              </Link>
            )
          }

          <button
            className="lg:hidden text-gray-700 hover:text-[#d60000] focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-2 flex flex-col space-y-2 pb-6 shadow-inner">
          {routes.map((route) =>
           (
            <Link
              key={route}
              href={`${route.toLocaleLowerCase() === 'home' ? '/' : `/${route.toLocaleLowerCase()}`}`}
              className={`text-base font-medium py-3 px-3 rounded ${
                route.toLocaleLowerCase() === pathname.split('/')[1] || (pathname === '/' && route === 'Home')
                  ? 'bg-red-50 text-[#d60000]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {route}
            </Link>
          ))}
          {
            isAuthenticated ? (
              <button onClick={handleLogout} className="bg-[#d60000] hover:bg-[#b30000] text-white cursor-pointer px-4 py-3 mt-4 rounded flex items-center justify-center space-x-2 font-medium w-full">
                <span>Logout</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <Link href="/auth">
                <button className="bg-[#d60000] hover:bg-[#b30000] text-white px-4 py-3 mt-4 rounded flex items-center justify-center space-x-2 font-medium w-full">
                  <span>Join Network</span>
                  <ArrowRight size={18} />
                </button>
              </Link>
            )
          }
        </div>
      )}
    </div>
  );
};

export default MainNav;
