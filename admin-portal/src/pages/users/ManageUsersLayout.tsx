import { Search, Users, ChevronRight } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

export default function ManageUsersLayout() {
  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-64px)]">
      {/* Breadcrumb & Search Bar */}
      <div className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
        <div className="flex items-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-2" />
          <span>Manage Users</span>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-gray-400">Overview</span>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="search..." 
            className="pl-4 pr-10 py-1.5 border border-gray-200 rounded-full text-sm w-64 focus:outline-none focus:border-blue-400"
          />
          <Search className="w-4 h-4 absolute right-3 top-2.5 text-gray-400" />
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 flex-1 flex flex-col">
        {/* Sub-navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-1 flex-shrink-0">
          <nav className="flex space-x-1" aria-label="Tabs">
            <NavLink
              to="/users/admins"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              Manage Admins
            </NavLink>
            <NavLink
              to="/users/alumni-students"
              className={({ isActive }) =>
                `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`
              }
            >
              Manage Alumni & Students
            </NavLink>
          </nav>
        </div>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
