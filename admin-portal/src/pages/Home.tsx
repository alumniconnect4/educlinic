import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, GraduationCap, ShieldCheck, MessageCircle, FileText, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { PlatformAnalytics } from "@/components/PlatformAnalytics";
import { StatCard } from "@/components/StatCard";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState({ users: 0, alumni: 0, admins: 0, total: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [communityStats, setCommunityStats] = useState({
    totalPosts: 0,
    postsThisMonth: 0,
    studentPosts: 0,
    alumniPosts: 0,
    commentsThisMonth: 0
  });
  const [ticketStats, setTicketStats] = useState({
    latestTickets: [],
    unresolvedCount: 0,
    resolvedCount: 0
  });
  const [userRegStats, setUserRegStats] = useState<{
    totalVerifiedUsers: number;
    roleStats: { role: string; total: number }[];
    monthlyTrend: { month: string; count: number }[];
  }>({
    totalVerifiedUsers: 0,
    roleStats: [],
    monthlyTrend: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/admin-portal/analytics/overview", {
          withCredentials: true
        });
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch overview stats", err);
      }
    };

    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/admin-portal/analytics/recent-events", {
          withCredentials: true
        });
        setRecentEvents(response.data);
      } catch (err) {
        console.error("Failed to fetch recent events", err);
      }
    };

    const fetchCommunity = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/admin-portal/analytics/community", {
          withCredentials: true
        });
        setCommunityStats(response.data);
      } catch (err) {
        console.error("Failed to fetch community stats", err);
      }
    };

    const fetchTickets = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/admin-portal/analytics/help-tickets", {
          withCredentials: true
        });
        setTicketStats(response.data);
      } catch (err) {
        console.error("Failed to fetch help ticket stats", err);
      }
    };

    const fetchUserRegAnalytics = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/admin-portal/analytics/user-registrations", {
          withCredentials: true
        });
        setUserRegStats(response.data);
      } catch (err) {
        console.error("Failed to fetch user registration analytics", err);
      }
    };

    fetchStats();
    fetchEvents();
    fetchCommunity();
    fetchTickets();
    fetchUserRegAnalytics();
  }, []);

  const createPostChartData = (value: number, total: number, label: string) => [
    { name: label, value: value },
    { name: "Other", value: total - value > 0 ? total - value : 1 }
  ];

  const ROLE_LABELS: Record<string, string> = {
    USER: "Students",
    ALUMNI: "Alumni",
    ADMIN: "Admins",
    SUPER_ADMIN: "Super Admins",
  };
  const ROLE_COLORS = ['#84749f', '#6ea2e6', '#f59e0b', '#10b981'];

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-64px)]">

      <div className="p-4 sm:p-6 flex-1 bg-transparent">
        <PlatformAnalytics stats={stats} user={user} />

        {/* ── Verified Users Analytics ── */}
        <div className="mt-8 bg-[#f8f9fa] border border-gray-200 shadow-sm rounded-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-[#333] font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#84749f]" />
              Verified Users Analytics
            </h3>
            <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded">
              Excludes pending approval requests
            </span>
          </div>

          <div className="p-6 space-y-6">
            {/* Stat cards per role */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {([
                { role: 'USER',        label: 'Students',    icon: <Users className="w-4 h-4" /> },
                { role: 'ALUMNI',      label: 'Alumni',      icon: <GraduationCap className="w-4 h-4" /> },
                { role: 'ADMIN',       label: 'Admins',      icon: <ShieldCheck className="w-4 h-4" /> },
                { role: 'SUPER_ADMIN', label: 'Super Admins',icon: <ShieldCheck className="w-4 h-4" /> },
              ] as const).map(({ role, label, icon }) => {
                const found = userRegStats.roleStats.find(r => r.role === role);
                return (
                  <div key={role} className="bg-white p-4 flex items-center justify-between border border-gray-200 rounded-sm shadow-sm">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                      <h4 className="text-2xl font-bold text-[#84749f]">{found?.total ?? 0}</h4>
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#84749f]/10 text-[#84749f]">{icon}</div>
                  </div>
                );
              })}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Role distribution pie */}
              <div className="bg-white p-5 border border-gray-200 rounded-sm shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Distribution by Role</h4>
                {userRegStats.totalVerifiedUsers > 0 ? (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={150} height={150}>
                      <PieChart>
                        <Pie
                          data={userRegStats.roleStats.filter(r => r.total > 0).map(r => ({
                            name: ROLE_LABELS[r.role] ?? r.role,
                            value: r.total,
                          }))}
                          cx="50%" cy="50%"
                          innerRadius={40} outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {userRegStats.roleStats.filter(r => r.total > 0).map((_, idx) => (
                            <Cell key={idx} fill={ROLE_COLORS[idx % ROLE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any, n: any) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-2">
                      {userRegStats.roleStats.filter(r => r.total > 0).map((r, idx) => (
                        <div key={r.role} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: ROLE_COLORS[idx % ROLE_COLORS.length] }} />
                          <span className="text-xs text-gray-600">{ROLE_LABELS[r.role] ?? r.role} — <strong>{r.total}</strong></span>
                        </div>
                      ))}
                      <p className="text-xs text-gray-400 mt-1">Total: <strong className="text-gray-600">{userRegStats.totalVerifiedUsers}</strong></p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-8">No verified users yet</p>
                )}
              </div>

              {/* Monthly trend bar chart */}
              <div className="bg-white p-5 border border-gray-200 rounded-sm shadow-sm">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">New Verified Users (Last 6 Months)</h4>
                <ResponsiveContainer width="100%" height={155}>
                  <BarChart data={userRegStats.monthlyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: 12 }}
                      formatter={(v: any) => [v, 'Verified Users']}
                    />
                    <Bar dataKey="count" fill="#84749f" radius={[2, 2, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Events Analytics Rectangular Card */}
        <div className="mt-8 bg-white shadow-sm border border-gray-200 rounded-sm">
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <h3 className="text-slate-600 font-semibold text-lg">Events Analytics</h3>
            <Link to="/events" className="text-[#6ea2e6] text-sm hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm font-semibold text-gray-700">
                  <th className="p-4 w-2/5">Subject(Title)</th>
                  <th className="p-4 w-1/5">Type</th>
                  <th className="p-4 w-1/5">Created By</th>
                  <th className="p-4 w-1/5 text-right">Start Date</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {recentEvents.length > 0 ? recentEvents.map((ev, index) => (
                  <tr key={ev.id || index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 align-middle min-w-0">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center text-white mr-3 font-bold text-xs flex-shrink-0">EV</div>
                        <span className="truncate max-w-[150px] sm:max-w-[250px] md:max-w-[350px]" title={ev.name}>{ev.name}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{ev.eventType}</td>
                    <td className="p-4 align-middle">{ev.organizedBy}</td>
                    <td className="p-4 align-middle text-right">{new Date(ev.startDate).toLocaleDateString()}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">No events found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Community Engagement Unified Component */}
        <div className="mt-8 bg-[#f8f9fa] border border-gray-200 shadow-sm rounded-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-[#333] font-bold text-sm uppercase tracking-wider">Community Engagement</h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Top 3 Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 flex items-center justify-between border border-gray-200 rounded-sm shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Posts</p>
                  <h4 className="text-2xl font-bold text-[#344767]">{communityStats.totalPosts}</h4>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50/30 text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white p-5 flex items-center justify-between border border-gray-200 rounded-sm shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Posts This Month</p>
                  <h4 className="text-2xl font-bold text-[#344767]">{communityStats.postsThisMonth}</h4>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-50/30 text-green-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white p-5 flex items-center justify-between border border-gray-200 rounded-sm shadow-sm">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Comments (This Month)</p>
                  <h4 className="text-2xl font-bold text-[#344767]">{communityStats.commentsThisMonth}</h4>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-50/30 text-purple-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Bottom 2 Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title="Posts by Students"
                value={communityStats.studentPosts}
                total={communityStats.totalPosts}
                data={createPostChartData(communityStats.studentPosts, communityStats.totalPosts, "Student Posts")}
                linkTo="/posts"
              />
              <StatCard
                title="Posts by Alumni"
                value={communityStats.alumniPosts}
                total={communityStats.totalPosts}
                data={createPostChartData(communityStats.alumniPosts, communityStats.totalPosts, "Alumni Posts")}
                linkTo="/posts"
              />
            </div>
          </div>
        </div>

        {/* Help Tickets Analytics Component */}
        <div className="mt-8 bg-[#f8f9fa] border border-gray-200 shadow-sm rounded-sm mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-[#333] font-bold text-sm uppercase tracking-wider">Help Tickets Analytics</h3>
            <Link to="/help-tickets" className="text-[#6ea2e6] text-sm hover:underline">View All</Link>
          </div>

          <div className="p-6 space-y-6">
            {/* Latest 2 Unresolved Tickets */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Latest Unresolved Tickets</h4>
              </div>
              <div className="divide-y divide-gray-100">
                {ticketStats.latestTickets && ticketStats.latestTickets.length > 0 ? (
                  ticketStats.latestTickets.map((ticket: any) => (
                    <div key={ticket.id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <div>
                        <h5 className="text-sm font-semibold text-gray-800">{ticket.title}</h5>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ticket.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-gray-400">by {ticket.createdBy?.name || 'Unknown'}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-yellow-50 text-yellow-600 border border-yellow-100 uppercase">{ticket.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400 text-sm">No ticket pending</div>
                )}
              </div>
            </div>

            {/* Ticket Stats and Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-6">
                <div className="bg-white p-5 flex items-center justify-between border border-gray-200 rounded-sm shadow-sm h-full">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Unresolved Tickets</p>
                    <h4 className="text-2xl font-bold text-[#84749f]">{ticketStats.unresolvedCount}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#84749f]/10 text-[#84749f]">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-white p-5 flex items-center justify-between border border-gray-200 rounded-sm shadow-sm h-full">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Solved Tickets</p>
                    <h4 className="text-2xl font-bold text-[#6ea2e6]">{ticketStats.resolvedCount}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#6ea2e6]/10 text-[#6ea2e6]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 border border-gray-200 rounded-sm shadow-sm lg:col-span-2 flex flex-col">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-100 pb-2">Ticket Resolution Ratio</h4>
                <div className="flex-1 w-full min-h-[160px] h-full flex items-center justify-center">
                  {(ticketStats.unresolvedCount > 0 || ticketStats.resolvedCount > 0) ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Unresolved', value: ticketStats.unresolvedCount },
                            { name: 'Resolved', value: ticketStats.resolvedCount }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#84749f" />
                          <Cell fill="#6ea2e6" />
                        </Pie>
                        <Tooltip formatter={(value: any, name: any) => [value, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-sm text-gray-400">No ticket data available</span>
                  )}
                </div>
                {(ticketStats.unresolvedCount > 0 || ticketStats.resolvedCount > 0) && (
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#84749f]"></div>
                      <span className="text-xs text-gray-500">Unresolved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#6ea2e6]"></div>
                      <span className="text-xs text-gray-500">Resolved</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
