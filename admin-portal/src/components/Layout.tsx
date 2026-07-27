import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Calendar, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  GraduationCap
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Events List', path: '/events', icon: Calendar },
    { name: 'Create Event', path: '/events/new', icon: PlusCircle },
    { name: 'My Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white border-b border-border text-secondary flex items-center justify-between px-5 py-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-wide text-secondary font-serif">EduClinic Admin</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-xl hover:bg-gray-50 transition-colors text-secondary border border-gray-100"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <nav className="relative flex flex-col w-72 max-w-xs h-full bg-white text-secondary p-6 shadow-2xl border-r border-border animate-in slide-in-from-left duration-250">
            <div className="flex items-center space-x-2.5 mb-8">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="font-serif font-black text-xl tracking-tight text-secondary">EduClinic Admin</span>
            </div>
            
            <div className="flex-1 space-y-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path === '/events' && location.pathname.startsWith('/events') && location.pathname !== '/events/new');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border ${
                      isActive 
                        ? 'bg-red-50/70 border-red-100 text-primary font-bold shadow-xs' 
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-secondary'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-gray-150 pt-5 mt-auto space-y-4">
              <div className="flex items-center space-x-3 bg-gray-50/80 border border-gray-100 p-3 rounded-2xl">
                <div className="h-10 w-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center font-bold text-primary text-md">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-secondary truncate">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3.5 rounded-xl text-sm font-bold text-red-600 bg-red-50/50 hover:bg-red-50 hover:text-red-700 transition-all border border-red-100/50"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-border p-6 sticky top-0 h-screen z-30 justify-between">
        <div>
          <div className="flex items-center space-x-2.5 mb-10 px-2 py-1">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-serif font-black text-xl tracking-tight text-secondary">
              EduClinic
            </span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/events' && location.pathname.startsWith('/events') && location.pathname !== '/events/new');
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border ${
                    isActive
                      ? 'bg-red-50/70 border-red-100 text-primary font-bold shadow-xs'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-secondary'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-gray-100 pt-5 space-y-4">
          <div className="flex items-center space-x-3 bg-gray-50/80 border border-gray-100 p-3 rounded-2xl">
            <div className="h-10 w-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center font-bold text-primary text-md">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-secondary truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3.5 rounded-xl text-sm font-bold text-red-600 bg-red-50/50 hover:bg-red-50 hover:text-red-700 transition-all border border-red-100/50"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/30">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
