import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface StatCardProps {
  title: string;
  value: number;
  total: number;
  data: any[];
  linkTo: string;
}

export function StatCard({ title, value, total, data, linkTo }: StatCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white shadow-sm border border-gray-200 rounded-sm p-4 flex flex-col cursor-pointer hover:border-[#84749f]/30 hover:shadow-md transition-all group"
      onClick={() => navigate(linkTo)}
    >
      <div className="flex justify-between items-center pb-2 mb-4 border-b border-gray-100">
        <h3 className="text-slate-600 font-semibold text-lg group-hover:text-[#84749f] transition-colors">{title}</h3>
        <span 
          className="text-[#6ea2e6] text-sm hover:underline" 
          onClick={(e) => { e.stopPropagation(); navigate(linkTo); }}
        >
          View All
        </span>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold text-gray-700 mb-2">{value}</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total {title}</span>
      </div>

      <div className="w-full h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              <Cell fill="#84749f" />
              <Cell fill="#f1f5f9" />
            </Pie>
            <Tooltip formatter={(val: number) => val === (total - value > 0 ? total - value : 1) ? ["Others", "Category"] : [val, title]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
