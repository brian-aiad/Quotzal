import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { SubmissionRow } from '@/lib/types/dashboard';
import { SubmissionsTable } from '../components/submissions-table';

export default async function SubmissionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: tableData, count } = await supabase
    .from('submissions')
    .select('id, broker_id, link_id, insurance_type, status, broker_notes, first_name, last_name, email, phone, date_of_birth, has_current_insurance, current_carrier, current_limits, policy_expiry, form_data, submitted_at', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(0, 24);

  const submissions = (tableData ?? []) as SubmissionRow[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Submissions</h1>
      <SubmissionsTable
        initialSubmissions={submissions}
        initialTotal={count ?? 0}
      />
    </div>
  );
}
