import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { SubmissionRow } from '@/lib/types/dashboard';
import { SubmissionsTable } from '../components/submissions-table';
import { SUBMISSIONS_PER_PAGE } from '@/lib/constants';

export default async function SubmissionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [brokerResult, tableResult] = await Promise.all([
    supabase
      .from('brokers')
      .select('brokerage_name')
      .eq('id', user.id)
      .single<{ brokerage_name: string }>(),
    supabase
      .from('submissions')
      .select('id, broker_id, link_id, insurance_type, status, broker_notes, first_name, last_name, email, phone, date_of_birth, has_current_insurance, current_carrier, current_limits, policy_expiry, tags, form_data, submitted_at', { count: 'exact' })
      .order('submitted_at', { ascending: false })
      .range(0, SUBMISSIONS_PER_PAGE - 1),
  ]);

  const submissions = (tableResult.data ?? []) as SubmissionRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Submissions</h1>
      <Suspense>
        <SubmissionsTable
          initialSubmissions={submissions}
          initialTotal={tableResult.count ?? 0}
          brokerageName={brokerResult.data?.brokerage_name ?? ''}
        />
      </Suspense>
    </div>
  );
}
