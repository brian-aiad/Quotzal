import { createClient } from '@/lib/supabase/server';
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

  // Fetch broker status
  const { data: broker } = await supabase
    .from('brokers')
    .select('status')
    .eq('id', user.id)
    .single<{ status: string }>();

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
    .select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(0, 24);

  const submissions = (tableData ?? []) as SubmissionRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <OverviewCards stats={stats} />
      <Charts data={charts} />

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Submissions</h2>
        <SubmissionsTable
          initialSubmissions={submissions}
          initialTotal={count ?? 0}
        />
      </div>
    </div>
  );
}
