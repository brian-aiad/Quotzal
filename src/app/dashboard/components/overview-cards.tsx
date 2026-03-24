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
  trialing: { bg: 'bg-amber-50 text-amber-700 border border-amber-200', text: 'text-amber-700', label: 'Trial' },
  active: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', text: 'text-emerald-700', label: 'Active' },
  past_due: { bg: 'bg-red-50 text-red-700 border border-red-200', text: 'text-red-700', label: 'Past Due' },
  cancelled: { bg: 'bg-gray-100 text-gray-500 border border-gray-200', text: 'text-gray-500', label: 'Cancelled' },
};

export function OverviewCards({ stats }: OverviewCardsProps) {
  const acctStyle = STATUS_COLORS[stats.accountStatus] ?? STATUS_COLORS.active;
  const acctBorder = STATUS_BORDER[stats.accountStatus] ?? STATUS_BORDER.active;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card
        label="Total Submissions"
        value={String(stats.total)}
        borderColor="border-t-emerald-500"
        iconBg="bg-emerald-50"
        icon={<svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>}
      />
      <Card
        label="New (Unreviewed)"
        value={String(stats.newCount)}
        highlight={stats.newCount > 0}
        borderColor="border-t-blue-500"
        iconBg="bg-amber-50"
        icon={<svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
      />
      <Card
        label="This Month"
        value={String(stats.thisMonth)}
        borderColor="border-t-violet-500"
        iconBg="bg-blue-50"
        icon={<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
      />
      <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 ${acctBorder}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Account Status</p>
        </div>
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${acctStyle.bg}`}>
          {acctStyle.label}
        </span>
      </div>
    </div>
  );
}

function Card({ label, value, highlight, borderColor, iconBg, icon }: {
  label: string;
  value: string;
  highlight?: boolean;
  borderColor: string;
  iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm border-t-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500 truncate">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl md:text-3xl font-bold ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>
        {value}
      </p>
    </div>
  );
}
