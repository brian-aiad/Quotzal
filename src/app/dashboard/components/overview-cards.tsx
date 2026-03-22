'use client';

import type { DashboardStats } from '@/lib/types/dashboard';

interface OverviewCardsProps {
  stats: DashboardStats;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  trialing: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Trial' },
  active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  past_due: { bg: 'bg-red-100', text: 'text-red-700', label: 'Past Due' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Cancelled' },
};

export function OverviewCards({ stats }: OverviewCardsProps) {
  const acctStyle = STATUS_COLORS[stats.accountStatus] ?? STATUS_COLORS.active;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card label="Total Submissions" value={String(stats.total)} />
      <Card label="New (Unreviewed)" value={String(stats.newCount)} highlight={stats.newCount > 0} />
      <Card label="This Month" value={String(stats.thisMonth)} />
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 mb-1">Account Status</p>
        <span className={`inline-block px-2.5 py-1 rounded-full text-sm font-semibold ${acctStyle.bg} ${acctStyle.text}`}>
          {acctStyle.label}
        </span>
      </div>
    </div>
  );
}

function Card({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}
