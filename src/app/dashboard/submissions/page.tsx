import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { SubmissionRow } from '@/lib/types/dashboard';
import { SubmissionsTable } from '../components/submissions-table';
import { ExportButton } from './export-button';

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
    .select('*', { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .range(0, 24);

  const submissions = (tableData ?? []) as SubmissionRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
        <ExportButton />
      </div>
      <SubmissionsTable
        initialSubmissions={submissions}
        initialTotal={count ?? 0}
      />
    </div>
  );
}
