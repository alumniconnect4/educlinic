import { useState, useRef, useEffect } from "react"
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Image as ImageIcon, 
  HelpCircle, 
  Settings,
  Menu,
  ChevronDown,
  User,
  Key,
  LogOut,
  ShieldCheck,
  Clock
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import axios from "axios"

export default function AdminLayout() {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:4000/api/admin-portal/logout", {
        withCredentials: true,
      })
    } catch (err) {
      console.error("Logout failed", err)
    } finally {
      logout()
      navigate("/login")
    }
  }

  const navItems = [
    { name: "DashBoard", path: "/", icon: LayoutDashboard },
    { 
      name: "Manage Users", 
      path: "/users", 
      icon: Users,
      subItems: [
        { name: "Manage Admins", path: "/users/admins", icon: ShieldCheck },
        { name: "Manage Alumni & Students", path: "/users/alumni-students", icon: User },
        { name: "Pending Requests", path: "/users/pending-requests", icon: Clock }
      ]
    },
    { name: "Events", path: "/events", icon: CalendarDays },
    { name: "Gallery", path: "/gallery", icon: ImageIcon },
    { name: "Help Tickets", path: "/help-tickets", icon: HelpCircle },
    { name: "Settings", path: "/settings", icon: Settings },
  ]

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Header spanning full width */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between z-20 shadow-sm flex-shrink-0 relative">
        <div 
          className={`${
            isSidebarOpen ? "w-[200px] px-2 justify-between" : "w-[80px] px-0 justify-center"
          } h-full flex items-center border-r border-gray-200 transition-all duration-300 flex-shrink-0 bg-white z-30`}
        >
          <div className={`overflow-hidden transition-all duration-300 flex items-center ${isSidebarOpen ? "w-[140px] opacity-100" : "w-0 opacity-0"}`}>
            <img src="/logo1.png" alt="EduClinic Logo" className="max-h-12 w-auto object-contain flex-shrink-0 min-w-[120px]" />
          </div>
          <button 
            className={`p-2 text-[#7abdd1] hover:text-[#5caebd] hidden md:flex items-center justify-center flex-shrink-0`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-8 h-8" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-center h-full">
          {/* Session Time */}
          <div className="hidden md:flex items-center text-sm mr-6">
            <div className="bg-[#1ebda0] text-white px-3 py-1.5 rounded cursor-pointer">
              2026-2027
            </div>
          </div>

          {/* User Profile */}
          <div className="relative h-full" ref={dropdownRef}>
            <div 
              className="flex items-center h-full cursor-pointer hover:bg-gray-50 px-6 border-l border-gray-200 transition-colors" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="hidden sm:flex items-center text-[13px] text-gray-600 font-medium uppercase tracking-wide">
                {user?.name} <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
              </div>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-16 w-56 bg-white border border-gray-200 shadow-lg py-2 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center text-sm text-gray-700">
                  <User className="w-4 h-4 mr-3 text-gray-400" />
                  <span className="uppercase font-medium">{user?.name}</span>
                </div>
                <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-semibold bg-gray-50">
                  Role: {user?.role}
                </div>
                <div 
                  className="px-4 py-2.5 border-b border-gray-100 flex items-center text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/settings", { state: { tab: "password" } });
                  }}
                >
                  <Key className="w-4 h-4 mr-3 text-gray-400" />
                  Change Password
                </div>
                <div 
                  className="px-4 py-2.5 flex items-center text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-3 text-gray-400" />
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside 
          className={`${
            isSidebarOpen ? "w-[200px]" : "w-[80px]"
          } bg-white flex-shrink-0 hidden md:flex flex-col shadow-sm border-r border-gray-200 z-30 transition-all duration-300 relative`}
        >
          <nav className="flex-1 py-0">
            <ul className="space-y-0">
              {navItems.map((item) => {
                const isActive = item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

                return (
                  <li key={item.name} className="border-b border-gray-100 relative group">
                    {item.subItems ? (
                      <div
                        className={
                          `flex flex-col items-center justify-center py-4 px-2 text-[13px] transition-all border-l-[3px] cursor-pointer select-none ${
                            isActive
                              ? "text-slate-900 border-slate-900 bg-slate-100 font-medium"
                              : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
                          }`
                        }
                      >
                        <item.icon className="w-7 h-7 mb-1" strokeWidth={1.2} />
                        <span 
                          className={`text-center font-normal tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${
                            isSidebarOpen ? "opacity-100 h-auto mt-1" : "opacity-0 h-0 m-0"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    ) : (
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        className={
                          `flex flex-col items-center justify-center py-4 px-2 text-[13px] transition-all border-l-[3px] ${
                            isActive
                              ? "text-slate-900 border-slate-900 bg-slate-100 font-medium"
                              : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
                          }`
                        }
                      >
                        <item.icon className="w-7 h-7 mb-1" strokeWidth={1.2} />
                        <span 
                          className={`text-center font-normal tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 ${
                            isSidebarOpen ? "opacity-100 h-auto mt-1" : "opacity-0 h-0 m-0"
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
                          {/* Speech Bubble Arrow pointing to the tab */}
                          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-slate-200 rotate-45"></div>

                          <div className="flex flex-col space-y-0.5 relative z-10">
                            {item.subItems.map((sub) => (
                              <NavLink
                                key={sub.name}
                                to={sub.path}
                                className={({ isActive: isSubActive }) =>
                                  `flex items-center px-3 py-2 text-xs rounded-md transition-colors ${
                                    isSubActive
                                      ? "bg-slate-100 text-slate-900 font-bold"
                                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium"
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
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
