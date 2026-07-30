import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = [
  '#84749f',
  '#9b8db1',
  '#b2a5c4',
  '#6ea2e6',
  '#8ab6ec',
  '#a6c9f2',
];

export default function AnalyticsDetail() {
  const { role } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayRole =
    role === 'USER' ? 'Students' : role === 'ALUMNI' ? 'Alumni' : 'Admins';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/admin-portal/analytics/school/${role}`,
          {
            withCredentials: true,
          }
        );
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch analytics detail', err);
      } finally {
        setLoading(false);
      }
    };
    if (role) fetchData();
  }, [role]);

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-64px)] bg-transparent">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 h-16 flex items-center px-6 shadow-sm">
        <Link
          to="/"
          className="flex items-center text-slate-500 hover:text-[#84749f] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        <div className="h-6 w-px bg-gray-300 mx-4" />
        <h1 className="text-lg font-bold text-slate-700 flex items-center">
          <BarChart2 className="w-5 h-5 mr-2 text-[#84749f]" />
          {displayRole} Distribution by School
        </h1>
      </div>

      <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-128px)]">
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-8 w-full max-w-7xl flex flex-col">
          <h2 className="text-xl font-bold text-slate-700 mb-8 border-b border-gray-100 pb-3 text-center">
            {displayRole} Distribution Breakdown
          </h2>

          {loading ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#84749f]" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-10 items-center justify-center">
              {/* Chart Side */}
              <div className="w-full lg:w-2/3 h-[550px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 20, left: 0, bottom: 120 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{
                        borderRadius: '4px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                      }}
                    />
                    <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={50}>
                      {data.map((_: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table Side */}
              <div className="w-full lg:w-1/3 flex justify-center">
                <div className="w-full max-w-sm border border-gray-100 rounded-sm overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-100">
                        <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-xs">
                          School / Category
                        </th>
                        <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-xs text-right">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.map((item: any, idx: number) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-slate-700 flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: COLORS[idx % COLORS.length],
                              }}
                            ></div>
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-slate-900 font-medium text-right">
                            {item.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
