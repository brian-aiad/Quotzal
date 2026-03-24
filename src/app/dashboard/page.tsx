import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import type { SubmissionRow, DashboardStats, ChartData, WeeklyCount, TypeBreakdown } from '@/lib/types/dashboard';
import { getInsuranceTypeLabel } from '@/lib/constants/insurance-types';
import type { InsuranceType } from '@/lib/types/intake-form';
import { OverviewCards } from './components/overview-cards';
import { Charts } from './components/charts';
import { SubmissionsTable } from './components/submissions-table';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch broker status and trial info
  const { data: broker } = await supabase
    .from('brokers')
    .select('status, trial_ends_at, slug')
    .eq('id', user.id)
    .single<{ status: string; trial_ends_at: string | null; slug: string }>();

  const trialDaysLeft = broker?.trial_ends_at
    ? Math.ceil((new Date(broker.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Auto-repair: ensure primary broker_links row exists
  if (broker) {
    const admin = createAdminClient();
    const { data: primaryLink } = await admin
      .from('broker_links')
      .select('id')
      .eq('broker_id', user.id)
      .eq('is_primary', true)
      .maybeSingle();

    if (!primaryLink) {
      try {
        const repairSlug = `${broker.slug}-primary`;
        await admin.from('broker_links').insert({
          broker_id: user.id,
          slug: repairSlug,
          label: 'Primary Link',
          is_primary: true,
          is_active: true,
        });
      } catch {
        console.error(`[REPAIR] Failed to auto-create primary link for broker ${user.id}`);
      }
    }
  }

  // Fetch all submissions for stats + charts (RLS enforced)
  const { data: allSubmissions } = await supabase
    .from('submissions')
    .select('status, insurance_type, submitted_at')
    .order('submitted_at', { ascending: false });

  const allRows = allSubmissions ?? [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const stats: DashboardStats = {
    total: allRows.length,
    newCount: allRows.filter((r) => r.status === 'new').length,
    thisMonth: allRows.filter((r) => r.submitted_at >= monthStart).length,
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

  // Fetch first page of submissions for table
  const { data: tableData, count } = await supabase
    .from('submissions')
    .select('id, broker_id, link_id, insurance_type, status, broker_notes, first_name, last_name, email, phone, date_of_birth, has_current_insurance, current_carrier, current_limits, policy_expiry, form_data, submitted_at', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(0, 24);

  const submissions = (tableData ?? []) as SubmissionRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>

      {/* Past due banner */}
      {broker?.status === 'past_due' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <p className="text-sm text-red-800"><strong>Payment failed.</strong> Your form link will be deactivated soon. Please update your payment method.</p>
          </div>
          <a href="/dashboard/billing" className="shrink-0 text-sm font-medium text-red-700 hover:text-red-900 underline">Fix billing</a>
        </div>
      )}

      {/* Trial ending banner */}
      {broker?.status === 'trialing' && trialDaysLeft !== null && trialDaysLeft <= 7 && trialDaysLeft > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <strong>Your trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}.</strong> Subscribe to keep your form link active.
          </p>
          <a href="/dashboard/billing" className="shrink-0 text-sm font-medium text-amber-700 hover:text-amber-900 underline">Subscribe now</a>
        </div>
      )}

      <OverviewCards stats={stats} />
      <Charts data={charts} />

      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Submissions</h2>
        <SubmissionsTable
          initialSubmissions={submissions}
          initialTotal={count ?? 0}
        />
      </div>
    </div>
  );
}

