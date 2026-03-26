'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { ChartData } from '@/lib/types/dashboard';

interface ChartsProps {
  data: ChartData;
}

const PIE_COLORS = [
  '#059669', '#34d399', '#a7f3d0', '#d1d5db',
  '#e5e7eb', '#6ee7b7', '#047857', '#9ca3af',
];

export function Charts({ data }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Weekly submissions bar chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm min-h-[240px]">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Submissions per Week</h3>
        {data.weekly.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.weekly}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-500 py-10 text-center">No data yet</p>
        )}
      </div>

      {/* Insurance type donut chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm min-h-[240px]">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">By Insurance Type</h3>
        {data.byType.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.byType}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.byType.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              {/* Center total label */}
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
                <tspan x="50%" dy="-8" className="text-2xl font-bold" fill="#1e293b">
                  {data.byType.reduce((sum, t) => sum + t.count, 0)}
                </tspan>
                <tspan x="50%" dy="20" className="text-xs" fill="#64748b">
                  total
                </tspan>
              </text>
              <Tooltip />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs text-slate-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-slate-500 py-10 text-center">No data yet</p>
        )}
      </div>
    </div>
  );
}
