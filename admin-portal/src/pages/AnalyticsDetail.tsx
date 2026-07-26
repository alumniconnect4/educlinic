import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BarChart2 } from "lucide-react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

export default function AnalyticsDetail() {
  const { role } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayRole = role === "USER" ? "Students" : role === "ALUMNI" ? "Alumni" : "Admins";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/admin-portal/analytics/school/${role}`, {
          withCredentials: true
        });
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch analytics detail", err);
      } finally {
        setLoading(false);
      }
    };
    if (role) fetchData();
  }, [role]);

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-64px)] bg-[#f0f3f5]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 h-16 flex items-center px-6 shadow-sm">
        <Link to="/" className="flex items-center text-gray-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        <div className="h-6 w-px bg-gray-300 mx-4" />
        <h1 className="text-lg font-bold text-gray-800 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2 text-blue-500" />
          {displayRole} Distribution by School
        </h1>
      </div>

      <div className="p-4 sm:p-6 flex-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[500px] flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Distribution Breakdown</h2>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              No data available for {displayRole}.
            </div>
          ) : (
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
