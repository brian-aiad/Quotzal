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
  '#3b82f6', '#6366f1', '#10b981', '#f43f5e',
  '#f97316', '#06b6d4', '#f59e0b', '#6b7280',
];

export function Charts({ data }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Weekly submissions bar chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Submissions per Week</h3>
        {data.weekly.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.weekly}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 py-10 text-center">No data yet</p>
        )}
      </div>

      {/* Insurance type donut chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">By Insurance Type</h3>
        {data.byType.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.byType}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.byType.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs text-gray-600">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 py-10 text-center">No data yet</p>
        )}
      </div>
    </div>
  );
}
