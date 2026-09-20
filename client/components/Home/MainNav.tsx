'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ArrowRight, Menu, X, ChevronDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserStore, UserStore } from '@/store/useUserStore';
import axios from 'axios';
import { toast } from 'react-toastify';
import { toast as hotToast } from 'react-hot-toast';

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
        name: 'School of Commerce',
        path: 'https://www.bfcet.com/dept-management',
      },
      {
        name: 'School of Management',
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
  const [visibleCount, setVisibleCount] = useState<number>(navigation.length);
  const [isMounted, setIsMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const navContainerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useUserStore(
    (state: UserStore) => state.isAuthenticated
  );

  // Dynamic route measurement & overflow calculation
  const calculateVisibleCount = useCallback(() => {
    if (!navContainerRef.current || !logoRef.current || !measureContainerRef.current) return;

    const containerWidth = navContainerRef.current.clientWidth;

    // Mobile / small tablet screens: collapse all items to hamburger
    if (containerWidth < 768) {
      setVisibleCount(0);
      return;
    }

    const logoWidth = logoRef.current.getBoundingClientRect().width;
    const authWidth = actionsRef.current
      ? actionsRef.current.getBoundingClientRect().width
      : 110;
    const hamburgerWidth = 48;
    const safetyMargin = 32; // Buffer to prevent edge-to-edge collision
    const gap = 16; // Inter-item gap

    const itemEls = measureContainerRef.current.querySelectorAll<HTMLElement>('[data-measure-item]');
    if (!itemEls || itemEls.length === 0) return;

    const itemWidths: number[] = [];
    itemEls.forEach((el) => {
      itemWidths.push(el.getBoundingClientRect().width);
    });

    const totalWidthAll =
      itemWidths.reduce((sum, w) => sum + w, 0) + (navigation.length - 1) * gap;
    const availWithoutHamburger = containerWidth - logoWidth - authWidth - safetyMargin;

    // If all items fit comfortably without hamburger button
    if (totalWidthAll <= availWithoutHamburger) {
      setVisibleCount(navigation.length);
      return;
    }

    // Otherwise hamburger button will be shown; calculate how many fit
    const availWithHamburger = availWithoutHamburger - hamburgerWidth - gap;

    let count = 0;
    let accumulated = 0;
    for (let i = 0; i < itemWidths.length; i++) {
      const nextWidth = accumulated + itemWidths[i] + (i > 0 ? gap : 0);
      if (nextWidth <= availWithHamburger) {
        accumulated = nextWidth;
        count = i + 1;
      } else {
        break;
      }
    }

    setVisibleCount(count);
  }, []);

  useEffect(() => {
    setIsMounted(true);
    calculateVisibleCount();

    const container = navContainerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      calculateVisibleCount();
    });
    observer.observe(container);

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        calculateVisibleCount();
      });
    }

    window.addEventListener('resize', calculateVisibleCount);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculateVisibleCount);
    };
  }, [calculateVisibleCount]);

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

  const visibleItems = isMounted ? navigation.slice(0, visibleCount) : navigation;
  const hiddenItems = isMounted ? navigation.slice(visibleCount) : [];
  const hasOverflow = hiddenItems.length > 0 || visibleCount < navigation.length;

  return (
    <div className="bg-white w-full shadow-xs border-b border-gray-100 sticky top-0 z-50">
      {/* Hidden Container for accurate offscreen pixel measurement */}
      <div
        ref={measureContainerRef}
        className="fixed top-0 left-0 pointer-events-none opacity-0 invisible flex items-center space-x-4 z-[-999]"
        aria-hidden="true"
      >
        {navigation.map((item) => (
          <div
            key={item.name}
            data-measure-item
            className="inline-flex items-center text-[15px] font-semibold whitespace-nowrap px-1"
          >
            <span>{item.name}</span>
            {item.subRoutes && (
              <ChevronDown size={16} className="ml-1 mt-0.5 shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div
        ref={navContainerRef}
        className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 py-2 flex items-center justify-between gap-3 relative"
      >
        {/* Logos */}
        <div
          ref={logoRef}
          className="shrink-0 flex items-center space-x-3 sm:space-x-4 lg:space-x-5"
        >
          <Link href="/" className="shrink-0 flex items-center">
            <Image
              src="/logo1.png"
              alt="BABA FARID GROUP OF INSTITUTIONS"
              width={250}
              height={70}
              priority
              className="w-40 sm:w-48 md:w-52 lg:w-56 xl:w-60 h-auto object-contain"
            />
          </Link>
          <Image
            src="/logo2.jpg"
            alt="NAAC Logo"
            width={110}
            height={60}
            priority
            className="w-auto h-8 sm:h-9 md:h-10 lg:h-11 object-contain hidden md:block shrink-0"
          />
        </div>

        {/* Visible Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-2 md:space-x-3 lg:space-x-4 xl:space-x-5">
          {visibleItems.map((item) => {
            const isActive = item.path
              ? pathname === item.path
              : item.subRoutes?.some((sub) => sub.path === pathname);

            return (
              <div key={item.name} className="relative group py-4 shrink-0">
                {item.path ? (
                  <Link
                    href={item.path}
                    onClick={
                      item.path.startsWith('http')
                        ? (e) => handleLinkClick(e, item.path!, item.name)
                        : undefined
                    }
                    className={`inline-flex items-center text-[14px] lg:text-[15px] font-semibold pb-1 border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-[#d60000] text-gray-900'
                        : 'border-transparent text-gray-600 hover:text-[#d60000] hover:border-[#d60000]'
                    }`}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 text-[14px] lg:text-[15px] font-semibold pb-1 border-b-2 transition-colors cursor-pointer group-hover:text-[#d60000] group-hover:border-[#d60000] whitespace-nowrap ${
                      isActive
                        ? 'border-[#d60000] text-gray-900'
                        : 'border-transparent text-gray-600'
                    }`}
                  >
                    {item.name}
                    <ChevronDown
                      size={16}
                      className="mt-0.5 shrink-0 transition-transform duration-200 group-hover:rotate-180"
                    />
                  </span>
                )}

                {item.subRoutes && (
                  <div className="absolute top-full left-0 min-w-[260px] bg-white border border-gray-100 shadow-xl rounded-b-md z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out pointer-events-none group-hover:pointer-events-auto">
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
                          className={`block px-6 py-2.5 text-[14px] transition-colors ${
                            pathname === sub.path
                              ? 'text-[#d60000] bg-red-50 font-medium'
                              : 'text-gray-600 hover:text-[#d60000] hover:bg-gray-50'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Section: Auth Button & Hamburger Toggle */}
        <div
          ref={actionsRef}
          className="flex items-center space-x-2 sm:space-x-3 shrink-0"
        >
          <div className="hidden sm:block">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`bg-[#d60000] hover:bg-[#b30000] text-white px-3.5 py-1.5 md:px-4 md:py-2 rounded flex items-center justify-center space-x-2 font-medium text-sm transition shadow-xs ${
                  isLoggingOut
                    ? 'opacity-75 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <span>Logout</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            ) : (
              <Link
                href="/auth"
                className="bg-[#d60000] hover:bg-[#b30000] text-white cursor-pointer px-3.5 py-1.5 md:px-4 md:py-2 rounded flex items-center justify-center space-x-2 font-medium text-sm transition shadow-xs"
              >
                <span>Login</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {/* Hamburger Button (shown on mobile or dynamically when desktop routes overflow) */}
          {(hasOverflow || visibleCount === 0 || !isMounted) && (
            <button
              className="text-gray-700 hover:text-[#d60000] hover:bg-red-50/60 p-2 rounded-lg focus:outline-none cursor-pointer transition-colors relative flex items-center gap-1.5 border border-gray-200 sm:border-transparent"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Toggle Navigation Menu"
              title={
                hiddenItems.length > 0
                  ? `${hiddenItems.length} more route${hiddenItems.length > 1 ? 's' : ''}`
                  : 'Menu'
              }
            >
              <Menu size={26} />
              {hiddenItems.length > 0 && visibleCount > 0 && (
                <span className="hidden md:inline-flex items-center justify-center bg-[#d60000] text-white text-[11px] font-bold h-5 px-1.5 rounded-full shadow-xs">
                  +{hiddenItems.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] transition-opacity duration-300 ease-in-out ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Slide-out Navigation Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[290px] sm:w-[340px] md:w-[380px] bg-white z-[70] transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <Image
            src="/logo1.png"
            alt="BABA FARID GROUP OF INSTITUTIONS"
            width={160}
            height={48}
            className="w-36 sm:w-44 h-auto object-contain"
          />
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-500 hover:text-[#d60000] hover:bg-gray-100 focus:outline-none p-1.5 rounded-lg cursor-pointer transition"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 sm:px-4 flex flex-col space-y-1">
          {navigation.map((item) => {
            const isExpanded = expandedMenu === item.name;
            const isChildActive = item.subRoutes?.some(
              (sub) => sub.path === pathname
            );
            const isDirectActive = pathname === item.path;
            const isOverflowedFromTop = hiddenItems.some((h) => h.name === item.name);

            return (
              <div key={item.name} className="flex flex-col">
                {item.path ? (
                  <Link
                    href={item.path}
                    className={`text-base font-medium py-2.5 px-3.5 rounded-lg transition-colors duration-200 flex items-center justify-between ${
                      isDirectActive
                        ? 'bg-red-50 text-[#d60000] font-semibold'
                        : 'text-gray-700 hover:bg-red-50/70 hover:text-[#d60000]'
                    }`}
                    onClick={(e) =>
                      item.path?.startsWith('http')
                        ? handleLinkClick(e, item.path, item.name, true)
                        : setIsMenuOpen(false)
                    }
                  >
                    <span>{item.name}</span>
                    {isOverflowedFromTop && visibleCount > 0 && (
                      <span className="text-[10px] text-gray-400 font-normal px-1.5 py-0.5 rounded bg-gray-100">
                        Menu
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() =>
                      setExpandedMenu(isExpanded ? null : item.name)
                    }
                    className={`text-base font-medium py-2.5 px-3.5 rounded-lg flex items-center justify-between w-full transition-colors duration-200 cursor-pointer ${
                      isExpanded || isChildActive
                        ? 'bg-red-50 text-[#d60000] font-semibold'
                        : 'text-gray-800 hover:bg-red-50/70 hover:text-[#d60000]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>
                      {isOverflowedFromTop && visibleCount > 0 && (
                        <span className="text-[10px] text-gray-400 font-normal px-1.5 py-0.5 rounded bg-gray-100">
                          Menu
                        </span>
                      )}
                    </div>
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

                {/* Subroutes Accordion with animation */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  {item.subRoutes && (
                    <div className="pl-3 flex flex-col space-y-1 mb-2 border-l-2 border-[#d60000]/30 ml-4 py-1">
                      {item.subRoutes.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.path}
                          className={`block text-sm py-2 px-3 rounded-md transition-colors duration-200 ${
                            pathname === sub.path
                              ? 'bg-red-50 text-[#d60000] font-medium'
                              : 'text-gray-600 hover:bg-red-50/70 hover:text-[#d60000]'
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
        </div>

        {/* Pinned Bottom CTA Section */}
        <div className="p-4 border-t border-gray-100 bg-white shrink-0 shadow-md sticky bottom-0 z-[80]">
          {isAuthenticated ? (
            <button
              onClick={async () => {
                await handleLogout();
                setIsMenuOpen(false);
              }}
              disabled={isLoggingOut}
              className={`bg-[#d60000] hover:bg-[#b30000] text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold w-full transition shadow-sm ${
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
            <Link
              href="/auth"
              onClick={() => setIsMenuOpen(false)}
              className="bg-[#d60000] hover:bg-[#b30000] text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 font-semibold w-full transition shadow-sm cursor-pointer text-center"
            >
              <span>Join Network</span>
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainNav;
