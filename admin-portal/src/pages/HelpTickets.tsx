import { Search, HelpCircle, ChevronRight } from "lucide-react"

export default function HelpTickets() {
  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-64px)]">
      {/* Breadcrumb & Search Bar */}
      <div className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center text-sm text-gray-500">
          <HelpCircle className="w-4 h-4 mr-2" />
          <span>Help Tickets</span>
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

      <div className="p-4 sm:p-6 space-y-6 flex-1">
        {/* Content will be added here later */}
      </div>
    </div>
  )
}
