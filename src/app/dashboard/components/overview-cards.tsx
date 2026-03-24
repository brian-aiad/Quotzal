'use client';

import type { DashboardStats } from '@/lib/types/dashboard';

interface OverviewCardsProps {
  stats: DashboardStats;
}

const STATUS_BORDER: Record<string, string> = {
  trialing: 'border-t-amber-500',
  active: 'border-t-emerald-500',
  past_due: 'border-t-red-500',
  cancelled: 'border-t-slate-400',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  trialing: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Trial' },
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
  past_due: { bg: 'bg-red-100', text: 'text-red-700', label: 'Past Due' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Cancelled' },
};

export function OverviewCards({ stats }: OverviewCardsProps) {
  const acctStyle = STATUS_COLORS[stats.accountStatus] ?? STATUS_COLORS.active;
  const acctBorder = STATUS_BORDER[stats.accountStatus] ?? STATUS_BORDER.active;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card label="Total Submissions" value={String(stats.total)} borderColor="border-t-emerald-500" />
      <Card label="New (Unreviewed)" value={String(stats.newCount)} highlight={stats.newCount > 0} borderColor="border-t-blue-500" />
      <Card label="This Month" value={String(stats.thisMonth)} borderColor="border-t-violet-500" />
      <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm border-t-4 ${acctBorder}`}>
        <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Account Status</p>
        <span className={`inline-block px-2.5 py-1 rounded-full text-sm font-semibold ${acctStyle.bg} ${acctStyle.text}`}>
          {acctStyle.label}
        </span>
      </div>
    </div>
  );
}

function Card({ label, value, highlight, borderColor }: { label: string; value: string; highlight?: boolean; borderColor: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm border-t-4 ${borderColor}`}>
      <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${highlight ? 'text-emerald-600' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  );
}
