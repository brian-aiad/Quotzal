'use client';

import type { DashboardStats } from '@/lib/types/dashboard';

interface OverviewCardsProps {
  stats: DashboardStats;
}

const STATUS_COLORS: Record<string, { bg: string; label: string }> = {
  trialing: { bg: 'bg-amber-50 text-amber-700 border border-amber-200', label: 'Trial' },
  active: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', label: 'Active' },
  past_due: { bg: 'bg-red-50 text-red-700 border border-red-200', label: 'Past Due' },
  cancelled: { bg: 'bg-gray-100 text-gray-500 border border-gray-200', label: 'Cancelled' },
};

export function OverviewCards({ stats }: OverviewCardsProps) {
  const acctStyle = STATUS_COLORS[stats.accountStatus] ?? STATUS_COLORS.active;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      <Card
        label="Submissions"
        value={String(stats.total)}
        iconBg="bg-emerald-50"
        icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>}
      />
      <Card
        label="New Submissions"
        value={String(stats.newCount)}
        highlight={stats.newCount > 0}
        iconBg="bg-amber-50"
        icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
      />
      <Card
        label="This Month"
        value={String(stats.thisMonth)}
        iconBg="bg-emerald-50"
        icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
      />
      <Card
        label="Quoted This Month"
        value={String(stats.quotedThisMonth)}
        iconBg="bg-amber-50"
        icon={<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      />
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">Account Status</p>
        </div>
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${acctStyle.bg}`}>
          {acctStyle.label}
        </span>
      </div>
    </div>
  );
}

function Card({ label, value, highlight, iconBg, icon }: {
  label: string;
  value: string;
  highlight?: boolean;
  iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${highlight ? 'text-amber-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}
