'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, Menu, X, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { toast as hotToast } from 'react-hot-toast';
import { UserStore } from '@/store/useUserStore';

type RouteItem = {
  name: string;
  path?: string;
  subRoutes?: { name: string; path: string }[];
};

const navigation: RouteItem[] = [
  { name: 'Home', path: '/' },
  {
    name: 'Our Institutions',
    subRoutes: [
      { name: 'School of Engineering', path: 'https://www.bfcet.com' },
      {
        name: 'School of Sciences',
        path: 'https://babafaridgroup.edu.in/School-of-Sciences.php',
      },
      {
        name: 'School of Agriculture',
        path: 'https://www.bfcet.com/department-of-agriculture',
      },
      {
        name: 'School of Business Studies',
        path: 'https://www.bfcet.com/dept-management',
      },
      {
        name: 'School of Computer Applications',
        path: 'https://www.bfcet.com/dept-comp-application',
      },
      { name: 'School of Humanities', path: 'https://www.bfcbti.com/' },
      { name: 'School of Education', path: 'https://www.bfcedu.com/' },
      { name: 'School of Law', path: 'https://babafaridcollegeoflaw.com/' },
      { name: 'School of Pharmacy', path: 'https://www.bfcp.in/' },
    ],
  },
  { name: 'Events', path: '/events' },
  { name: 'Alumni', path: '/alumni' },
  { name: 'Startups', path: 'https://bfsoe.com/startups/' },
  {
    name: 'Research',
    subRoutes: [
      { name: 'Incubation Centre', path: '/research/incubation' },
      { name: 'Research & Development Cell', path: '/research/rnd-cell' },
      { name: 'School of Entrepreneurship', path: 'https://bfsoe.com/' },
    ],
  },
  {
    name: 'Gallery',
    subRoutes: [
      { name: 'Campus Life', path: '/gallery/campus-life' },
      { name: 'Events', path: '/gallery/events' },
    ],
  },
  {
    name: 'About',
    path: '/about',
  },
  { name: 'Contact Us', path: '/contact' },
];

const MainNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setExpandedMenu(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen && pathname) {
      const activeParent = navigation.find((item) =>
        item.subRoutes?.some((sub) => sub.path === pathname)
      );
      if (activeParent) {
        setExpandedMenu(activeParent.name);
      }
    }
  }, [isMenuOpen, pathname]);

  const isAuthenticated = useUserStore(
    (state: UserStore) => state.isAuthenticated
  );
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        withCredentials: true,
      });
    } catch (err) {
      console.log(err);
    } finally {
      useUserStore.getState().clearUser();
      toast.success('Logged out successfully!');
      setIsLoggingOut(false);
      router.push('/');
    }
  };

  const handleLinkClick = (
    e: React.MouseEvent,
    url: string,
    name: string,
    isMobile = false
  ) => {
    if (url.startsWith('http')) {
      e.preventDefault();
      if (isMobile) setIsMenuOpen(false);
      hotToast(
        (t) => (
          <div className="flex flex-col gap-4 min-w-[280px] p-2">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                External Link
              </h3>
              <p className="text-[15px] text-gray-600">
                Continue to <b>{name}</b>?
              </p>
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => hotToast.dismiss(t.id)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  hotToast.dismiss(t.id);
                  window.open(url, '_blank');
                }}
                className="px-4 py-2 text-sm font-medium bg-[#d60000] text-white hover:bg-[#b30000] transition-colors cursor-pointer rounded-md"
              >
                Continue
              </button>
            </div>
          </div>
        ),
        {
          duration: 6000,
          position: isMobile ? 'bottom-center' : 'bottom-right',
          style: { borderRadius: '8px' },
        }
      );
    } else {
      if (isMobile) setIsMenuOpen(false);
    }
  };

  return (
    <div className="bg-white w-full shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="w-full px-4 md:px-8 lg:px-16 xl:px-32 py-2 flex items-center justify-between">
        <div className="flex-shrink-0 flex items-center space-x-6">
          <Link href="/">
            <Image
              src="/logo1.png"
              alt="BABA FARID GROUP OF INSTITUTIONS"
              width={250}
              height={70}
              loading="eager"
              className="w-48 md:w-56 lg:w-64 h-auto object-contain"
            />
          </Link>
          <Image
            src="/logo2.jpg"
            alt="NAAC Logo"
            width={110}
            height={60}
            className="w-auto h-auto object-contain hidden md:block"
          />
        </div>

        <div className="hidden xl:flex items-center space-x-3 xl:space-x-5">
          {navigation.map((item) => {
            const isActive = item.path ? pathname === item.path : false;

            return (
              <div key={item.name} className="relative group py-4">
                {item.path ? (
                  <Link
                    href={item.path}
                    onClick={
                      item.path.startsWith('http')
                        ? (e) => handleLinkClick(e, item.path!, item.name)
                        : undefined
                    }
                    className={`inline-flex items-center text-[15px] font-semibold pb-1 border-b-2 transition-colors ${
                      isActive
                        ? 'border-[#d60000] text-gray-900'
                        : 'border-transparent text-gray-600 hover:text-[#d60000] hover:border-[#d60000]'
                    }`}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 text-[15px] font-semibold pb-1 border-b-2 transition-colors cursor-pointer group-hover:text-[#d60000] group-hover:border-[#d60000] ${
                      isActive
                        ? 'border-[#d60000] text-gray-900'
                        : 'border-transparent text-gray-600'
                    }`}
                  >
                    {item.name}
                    <ChevronDown size={16} className="mt-0.5" />
                  </span>
                )}

                {item.subRoutes && (
                  <div className="absolute top-[100%] left-0 min-w-[260px] bg-white border border-gray-100 border-t-0 shadow-xl rounded-b-md z-50 grid grid-rows-[0fr] opacity-0 invisible group-hover:grid-rows-[1fr] group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out">
                    <div className="overflow-hidden">
                      <div className="flex flex-col py-2">
                        {item.subRoutes.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            onClick={
                              sub.path.startsWith('http')
                                ? (e) => handleLinkClick(e, sub.path, sub.name)
                                : undefined
                            }
                            className="block px-6 py-2 text-[14px] text-gray-600 hover:text-[#d60000] transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden xl:block">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`bg-[#d60000] hover:bg-[#b30000] text-white px-4 py-2 rounded flex items-center justify-center space-x-2 font-medium transition ${
                  isLoggingOut
                    ? 'opacity-75 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <span>Logout</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            ) : (
              <Link href="/auth">
                <button className="bg-[#d60000] hover:bg-[#b30000] text-white cursor-pointer px-4 py-2 rounded flex items-center justify-center space-x-2 font-medium transition">
                  <span>Login</span>
                  <ArrowRight size={18} />
                </button>
              </Link>
            )}
          </div>

          <button
            className="xl:hidden text-gray-700 hover:text-[#d60000] focus:outline-none"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Overlay Backdrop */}
      <div
        className={`xl:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] transition-opacity duration-300 ease-in-out ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`xl:hidden fixed top-0 left-0 h-full w-[280px] sm:w-[320px] bg-white z-[70] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <Image
            src="/logo1.png"
            alt="BABA FARID GROUP OF INSTITUTIONS"
            width={150}
            height={45}
            className="w-32 sm:w-40 h-auto object-contain"
          />
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-500 hover:text-[#d60000] focus:outline-none p-1 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col space-y-1">
          {navigation.map((item) => {
            const isExpanded = expandedMenu === item.name;
            const isChildActive = item.subRoutes?.some(
              (sub) => sub.path === pathname
            );
            return (
              <div key={item.name} className="flex flex-col">
                {item.path ? (
                  <Link
                    href={item.path}
                    className={`block text-base font-medium py-3 px-4 rounded-lg transition-colors duration-200 ${
                      pathname === item.path
                        ? 'bg-red-50 text-[#d60000] font-semibold'
                        : 'text-gray-700 hover:bg-red-50 hover:text-[#d60000]'
                    }`}
                    onClick={(e) =>
                      item.path?.startsWith('http')
                        ? handleLinkClick(e, item.path, item.name, true)
                        : setIsMenuOpen(false)
                    }
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button
                    onClick={() =>
                      setExpandedMenu(isExpanded ? null : item.name)
                    }
                    className={`text-base font-medium py-3 px-4 rounded-lg flex items-center justify-between w-full transition-colors duration-200 cursor-pointer ${
                      isExpanded || isChildActive
                        ? 'bg-red-50 text-[#d60000] font-semibold'
                        : 'text-gray-800 hover:bg-red-50 hover:text-[#d60000]'
                    }`}
                  >
                    {item.name}
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${
                        isExpanded
                          ? 'rotate-180 text-[#d60000]'
                          : isChildActive
                            ? 'text-[#d60000]'
                            : 'text-gray-400'
                      }`}
                    />
                  </button>
                )}

                {/* Subroutes with animation */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
                >
                  {item.subRoutes && (
                    <div className="pl-4 flex flex-col space-y-1 mb-2 border-l-2 border-[#d60000]/20 ml-6 py-1">
                      {item.subRoutes.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.path}
                          className={`block text-sm py-2 px-3 rounded-md transition-colors duration-200 ${
                            pathname === sub.path
                              ? 'bg-red-50 text-[#d60000] font-medium'
                              : 'text-gray-500 hover:bg-red-50 hover:text-[#d60000]'
                          }`}
                          onClick={(e) =>
                            sub.path.startsWith('http')
                              ? handleLinkClick(e, sub.path, sub.name, true)
                              : setIsMenuOpen(false)
                          }
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="pt-4 border-t border-gray-100 mt-2 pb-6">
            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await handleLogout();
                  setIsMenuOpen(false);
                }}
                disabled={isLoggingOut}
                className={`bg-[#d60000] hover:bg-[#b30000] text-white px-4 py-3 rounded flex items-center justify-center space-x-2 font-medium w-full transition ${
                  isLoggingOut
                    ? 'opacity-75 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <span>Logout</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            ) : (
              <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                <button className="bg-[#d60000] hover:bg-[#b30000] text-white px-4 py-3 rounded flex items-center justify-center space-x-2 font-medium w-full transition">
                  <span>Join Network</span>
                  <ArrowRight size={18} />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainNav;
