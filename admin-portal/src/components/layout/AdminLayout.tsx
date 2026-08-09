import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Image as ImageIcon,
  HelpCircle,
  Settings,
  Menu,
  X,
  ChevronDown,
  User,
  Key,
  LogOut,
  ShieldCheck,
  Clock,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

export default function AdminLayout() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSubMenu, setExpandedSubMenu] = useState<string | null>(
    'Manage Users'
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu automatically on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Sync latest user profile (including avatarUrl) from server on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${apiUrl}/admin-portal/profile`, {
          withCredentials: true,
        });
        if (res.data?.user) {
          useAuthStore.getState().login(res.data.user);
        }
      } catch (err) {
        console.error('Failed to sync admin profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const apiUrl = import.meta.env.VITE_API_URL;
      await axios.get(`${apiUrl}/admin-portal/logout`, {
        withCredentials: true,
      });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setIsLoggingOut(false);
      logout();
      navigate('/login');
    }
  };

  const navItems = [
    { name: 'DashBoard', path: '/', icon: LayoutDashboard },
    {
      name: 'Manage Users',
      path: '/users',
      icon: Users,
      subItems: [
        { name: 'Manage Admins', path: '/users/admins', icon: ShieldCheck },
        {
          name: 'Manage Alumni & Students',
          path: '/users/alumni-students',
          icon: User,
        },
        {
          name: 'Pending Requests',
          path: '/users/pending-requests',
          icon: Clock,
        },
      ],
    },
    { name: 'Events', path: '/events', icon: CalendarDays },
    { name: 'Gallery', path: '/gallery', icon: ImageIcon },
    { name: 'Help Tickets', path: '/help-tickets', icon: HelpCircle },
    { name: 'Guide', path: '/guide', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between z-20 shadow-sm flex-shrink-0 relative px-3 md:px-0">
        {/* Left Section: Logo & Toggle Buttons */}
        <div className="flex items-center h-full">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="p-2 text-slate-700 hover:text-slate-900 md:hidden mr-2 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop Sidebar Toggle Box */}
          <div
            className={`hidden md:flex ${
              isSidebarOpen
                ? 'w-[200px] px-4 justify-between'
                : 'w-[80px] px-0 justify-center'
            } h-full items-center border-r border-gray-200 transition-all duration-300 flex-shrink-0 bg-white z-30`}
          >
            <div
              className={`overflow-hidden transition-all duration-300 flex items-center ${
                isSidebarOpen ? 'w-[140px] opacity-100' : 'w-0 opacity-0'
              }`}
            >
              <img
                src="/logo1.png"
                alt="EduClinic Logo"
                className="max-h-10 w-auto object-contain flex-shrink-0 min-w-[110px]"
              />
            </div>
            <button
              className="p-2 text-[#7abdd1] hover:text-[#5caebd] flex items-center justify-center flex-shrink-0"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-7 h-7" strokeWidth={1.5} />
            </button>
          </div>

          {/* Mobile Logo */}
          <div className="flex md:hidden items-center">
            <img
              src="/logo1.png"
              alt="EduClinic Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        {/* Right Section: Session Badge & Profile Dropdown */}
        <div className="flex items-center h-full">
          {/* Session Badge */}
          <div className="hidden sm:flex items-center text-sm mr-4">
            <div className="bg-[#1ebda0] text-white px-3 py-1 text-xs font-semibold rounded-full shadow-sm">
              2026-2027
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative h-full" ref={dropdownRef}>
            <div
              className="flex items-center h-full cursor-pointer hover:bg-gray-50 px-3 sm:px-5 border-l border-gray-200 transition-colors gap-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'User Avatar'}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs uppercase">
                  {user?.name ? user.name.charAt(0) : 'A'}
                </div>
              )}
              <div className="flex items-center text-[13px] text-gray-700 font-medium tracking-wide">
                <span className="hidden sm:inline-block max-w-[120px] truncate uppercase font-semibold">
                  {user?.name}
                </span>
                <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-16 w-56 bg-white border border-gray-200 shadow-xl py-2 z-50 rounded-b-md">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center text-sm text-gray-700 gap-3">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user?.name || 'User Avatar'}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="uppercase font-medium truncate">
                    {user?.name}
                  </span>
                </div>
                <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-semibold bg-gray-50">
                  Role: {user?.role}
                </div>
                <div
                  className="px-4 py-2.5 border-b border-gray-100 flex items-center text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/settings', { state: { tab: 'password' } });
                  }}
                >
                  <Key className="w-4 h-4 mr-3 text-gray-400" />
                  Change Password
                </div>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  className={`w-full px-4 py-2.5 flex items-center text-sm text-gray-600 transition-colors ${
                    isLoggingOut
                      ? 'opacity-70 cursor-not-allowed'
                      : 'cursor-pointer hover:bg-gray-50'
                  }`}
                  onClick={handleLogout}
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 mr-3 text-gray-400 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                  )}
                  <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Slide-Over Drawer Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Slide-Over Drawer Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-50 md:hidden shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Mobile Drawer Header */}
          <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <img
                src="/logo1.png"
                alt="EduClinic Logo"
                className="max-h-10 w-auto object-contain"
              />
            </div>
            <button
              type="button"
              className="p-2 text-slate-500 hover:text-slate-800 rounded-md focus:outline-none"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close Navigation Menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation List Aligned with Desktop Theme */}
          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-0">
              {navItems.map((item) => {
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                const hasSubItems = Boolean(
                  item.subItems && item.subItems.length > 0
                );
                const isSubExpanded = expandedSubMenu === item.name;

                return (
                  <li key={item.name} className="border-b border-gray-100">
                    {hasSubItems ? (
                      <div>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSubMenu(isSubExpanded ? null : item.name)
                          }
                          className={`w-full flex items-center justify-between py-3.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-l-[3px] select-none ${
                            isActive
                              ? 'text-slate-900 border-slate-900 bg-slate-100'
                              : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              className="w-5 h-5 text-slate-700"
                              strokeWidth={1.5}
                            />
                            <span>{item.name}</span>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              isSubExpanded
                                ? 'rotate-180 text-slate-900'
                                : 'text-slate-400'
                            }`}
                          />
                        </button>

                        {isSubExpanded && (
                          <div className="bg-slate-50 py-1.5 px-3 space-y-1 border-t border-gray-100">
                            {item.subItems!.map((sub) => (
                              <NavLink
                                key={sub.name}
                                to={sub.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive: isSubActive }) =>
                                  `flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-md transition-colors ${
                                    isSubActive
                                      ? 'bg-white text-slate-900 font-bold border-l-2 border-slate-800 shadow-2xs'
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                                  }`
                                }
                              >
                                <sub.icon className="w-4 h-4 text-slate-500" />
                                <span>{sub.name}</span>
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        end={item.path === '/'}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive: isItemActive }) =>
                          `flex items-center gap-3 py-3.5 px-4 text-xs font-semibold uppercase tracking-wider transition-all border-l-[3px] ${
                            isItemActive
                              ? 'text-slate-900 border-slate-900 bg-slate-100'
                              : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                          }`
                        }
                      >
                        <item.icon
                          className="w-5 h-5 text-slate-700"
                          strokeWidth={1.5}
                        />
                        <span>{item.name}</span>
                      </NavLink>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Drawer Footer with Logout */}
          <div className="p-4 border-t border-gray-200 bg-slate-50">
            <div className="flex items-center gap-3 mb-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'User Avatar'}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                  {user?.name ? user.name.charAt(0) : 'A'}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wide truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-500 font-medium uppercase">
                  Role: {user?.role}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-200 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-sm text-xs font-medium transition-colors shadow-2xs"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              ) : (
                <LogOut className="w-4 h-4 text-slate-500" />
              )}
              <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
            </button>
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'w-[200px]' : 'w-[80px]'
          } bg-white flex-shrink-0 hidden md:flex flex-col shadow-sm border-r border-gray-200 z-30 transition-all duration-300 relative`}
        >
          <nav className="flex-1 py-0">
            <ul className="space-y-0">
              {navItems.map((item) => {
                const isActive =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                  <li
                    key={item.name}
                    className="border-b border-gray-100 relative group"
                  >
                    {item.subItems ? (
                      <div
                        className={`flex flex-col items-center justify-center py-4 px-2 text-[13px] transition-all border-l-[3px] cursor-pointer select-none ${
                          isActive
                            ? 'text-slate-900 border-slate-900 bg-slate-100 font-medium'
                            : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-7 h-7 mb-1" strokeWidth={1.2} />
                        <span
                          className={`text-center font-normal tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${
                            isSidebarOpen
                              ? 'opacity-100 h-auto mt-1'
                              : 'opacity-0 h-0 m-0'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        end={item.path === '/'}
                        className={`flex flex-col items-center justify-center py-4 px-2 text-[13px] transition-all border-l-[3px] ${
                          isActive
                            ? 'text-slate-900 border-slate-900 bg-slate-100 font-medium'
                            : 'text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-7 h-7 mb-1" strokeWidth={1.2} />
                        <span
                          className={`text-center font-normal tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${
                            isSidebarOpen
                              ? 'opacity-100 h-auto mt-1'
                              : 'opacity-0 h-0 m-0'
                          }`}
                        >
                          {item.name}
                        </span>
                      </NavLink>
                    )}

                    {/* Speech Bubble Popover for subItems */}
                    {item.subItems && (
                      <div className="absolute left-[100%] top-1/2 -translate-y-1/2 pl-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 ease-out z-50 flex flex-col">
                        <div className="bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 p-1.5 min-w-[190px] relative">
                          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-slate-200 rotate-45"></div>
                          <div className="flex flex-col space-y-0.5 relative z-10">
                            {item.subItems.map((sub) => (
                              <NavLink
                                key={sub.name}
                                to={sub.path}
                                className={({ isActive: isSubActive }) =>
                                  `flex items-center px-3 py-2 text-xs rounded-md transition-colors ${
                                    isSubActive
                                      ? 'bg-slate-100 text-slate-900 font-bold'
                                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                                  }`
                                }
                              >
                                <sub.icon className="w-3.5 h-3.5 mr-2.5 text-slate-500" />
                                <span>{sub.name}</span>
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
