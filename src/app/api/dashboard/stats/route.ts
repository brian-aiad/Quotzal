import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { DashboardStats, WeeklyCount, TypeBreakdown } from '@/lib/types/dashboard';
import { getInsuranceTypeLabel } from '@/lib/constants/insurance-types';
import type { InsuranceType } from '@/lib/types/intake-form';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch broker profile for account status
  const { data: broker } = await supabase
    .from('brokers')
    .select('status')
    .eq('id', user.id)
    .single<{ status: string }>();

  if (!broker) {
    return NextResponse.json({ error: 'Broker not found' }, { status: 404 });
  }

  // Fetch all submissions for this broker (RLS enforced)
  const { data: submissions } = await supabase
    .from('submissions')
    .select('status, insurance_type, submitted_at')
    .order('submitted_at', { ascending: false });

  const rows = submissions ?? [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const stats: DashboardStats = {
    total: rows.length,
    newCount: rows.filter((r) => r.status === 'new').length,
    thisMonth: rows.filter((r) => r.submitted_at >= monthStart).length,
    accountStatus: broker.status,
  };

  // Weekly counts for last 8 weeks
  const weekly: WeeklyCount[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const count = rows.filter((r) => {
      const d = new Date(r.submitted_at);
      return d >= weekStart && d < weekEnd;
    }).length;

    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    weekly.push({ week: label, count });
  }

  // Type breakdown
  const typeCounts: Record<string, number> = {};
  for (const r of rows) {
    typeCounts[r.insurance_type] = (typeCounts[r.insurance_type] ?? 0) + 1;
  }
  const byType: TypeBreakdown[] = Object.entries(typeCounts)
    .map(([type, count]) => ({
      type,
      label: getInsuranceTypeLabel(type as InsuranceType),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({ stats, charts: { weekly, byType } });
}
