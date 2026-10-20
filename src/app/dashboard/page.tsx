import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import type { SubmissionRow, DashboardStats, ChartData, WeeklyCount, TypeBreakdown } from '@/lib/types/dashboard';
import { getInsuranceTypeLabel } from '@/lib/constants/insurance-types';
import type { InsuranceType } from '@/lib/types/intake-form';
import { OverviewCards } from './components/overview-cards';
import { Charts } from './components/charts';
import { FormEngagement } from './components/form-engagement';
import { SubmissionsTable } from './components/submissions-table';
import { RefreshButton } from './components/refresh-button';
import { SUBMISSIONS_PER_PAGE } from '@/lib/constants';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Run all queries in parallel instead of sequentially
  const [brokerResult, statsResult, tableResult] = await Promise.all([
    // Broker status + trial info
    supabase
      .from('brokers')
      .select('status, trial_ends_at, slug, brokerage_name')
      .eq('id', user.id)
      .single<{ status: string; trial_ends_at: string | null; slug: string; brokerage_name: string }>(),
    // Lightweight stats query — only status, type, date for charts
    supabase
      .from('submissions')
      .select('status, insurance_type, submitted_at')
      .order('submitted_at', { ascending: false }),
    // Table data with count
    supabase
      .from('submissions')
      .select('id, broker_id, link_id, insurance_type, status, broker_notes, first_name, last_name, email, phone, date_of_birth, has_current_insurance, current_carrier, current_limits, policy_expiry, tags, form_data, submitted_at', { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .range(0, SUBMISSIONS_PER_PAGE - 1),
  ]);

  const broker = brokerResult.data;

  const trialDaysLeft = broker?.trial_ends_at
    ? Math.ceil((new Date(broker.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Auto-repair: ensure primary broker_links row exists (non-blocking)
  if (broker) {
    const admin = createAdminClient();
    admin
      .from('broker_links')
      .select('id')
      .eq('broker_id', user.id)
      .eq('is_primary', true)
      .maybeSingle()
      .then(({ data: primaryLink }) => {
        if (!primaryLink) {
          const repairSlug = `${broker.slug}-primary`;
          admin.from('broker_links').insert({
            broker_id: user.id,
            slug: repairSlug,
            label: 'Primary Link',
            is_primary: true,
            is_active: true,
          }).then(() => {}, () => {
            console.error(`[REPAIR] Failed to auto-create primary link for broker ${user.id}`);
          });
        }
      });
  }

  // Engagement: count submissions viewed by broker (first_opened_at set)
  const [viewedResult, totalSubsResult] = await Promise.all([
    supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .not('first_opened_at', 'is', null),
    supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true }),
  ]);
  const viewedCount = viewedResult.count ?? 0;
  const totalSubmissions = totalSubsResult.count ?? 0;
  const reviewRate = totalSubmissions > 0
    ? Math.round((viewedCount / totalSubmissions) * 100)
    : 0;

  const allRows = statsResult.data ?? [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const stats: DashboardStats = {
    total: allRows.length,
    newCount: allRows.filter((r) => r.status === 'intake').length,
    thisMonth: allRows.filter((r) => r.submitted_at >= monthStart).length,
    quotedThisMonth: allRows.filter(
      (r) => (r.status === 'quoted' || r.status === 'bound') && r.submitted_at >= monthStart
    ).length,
    accountStatus: broker?.status ?? 'trialing',
  };

  // Weekly counts
  const weekly: WeeklyCount[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = allRows.filter((r) => {
      const d = new Date(r.submitted_at);
      return d >= weekStart && d < weekEnd;
    }).length;

    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    weekly.push({ week: label, count });
  }

  // Type breakdown
  const typeCounts: Record<string, number> = {};
  for (const r of allRows) {
    typeCounts[r.insurance_type] = (typeCounts[r.insurance_type] ?? 0) + 1;
  }
  const byType: TypeBreakdown[] = Object.entries(typeCounts)
    .map(([type, count]) => ({
      type,
      label: getInsuranceTypeLabel(type as InsuranceType),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const charts: ChartData = { weekly, byType };

  const submissions = (tableResult.data ?? []) as SubmissionRow[];
  const count = tableResult.count;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <RefreshButton />
      </div>

      {/* Past due banner */}
      {broker?.status === 'past_due' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <p className="text-sm text-red-800"><strong>Payment failed.</strong> Your form link will be deactivated soon. Please update your payment method.</p>
          </div>
          <a href="/dashboard/billing" className="shrink-0 text-sm font-medium text-red-700 hover:text-red-900 underline">Fix billing</a>
        </div>
      )}

      {/* Trial ending banner */}
      {broker?.status === 'trialing' && trialDaysLeft !== null && trialDaysLeft <= 7 && trialDaysLeft > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-sm text-amber-800">
            <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left on your trial.</strong> Add a card before {new Date(broker.trial_ends_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} or your form link pauses.
          </p>
          <a href="/dashboard/billing" className="shrink-0 text-sm font-medium text-amber-700 hover:text-amber-900 underline">Subscribe now</a>
        </div>
      )}

      <OverviewCards stats={stats} />
      <Charts data={charts} />
      <FormEngagement
        totalSubmissions={totalSubmissions}
        viewedCount={viewedCount}
        reviewRate={reviewRate}
      />

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Submissions</h2>
        <SubmissionsTable
          initialSubmissions={submissions}
          initialTotal={count ?? 0}
          brokerageName={broker?.brokerage_name ?? ''}
        />
      </div>
    </div>
  );
}

