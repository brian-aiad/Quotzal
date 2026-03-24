import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { escapePostgrestPattern } from '@/lib/sanitize';
import type { SubmissionRow } from '@/lib/types/dashboard';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function flattenFormData(formData: Record<string, unknown>): Record<string, string> {
  const flat: Record<string, string> = {};

  for (const [key, value] of Object.entries(formData)) {
    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      flat[key] = JSON.stringify(value);
    } else if (typeof value === 'object') {
      flat[key] = JSON.stringify(value);
    } else {
      flat[key] = String(value);
    }
  }

  return flat;
}

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? '';
  const types = url.searchParams.get('types') ?? '';
  const status = url.searchParams.get('status') ?? '';

  let query = supabase
    .from('submissions')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (search) {
    const s = escapePostgrestPattern(search);
    query = query.or(
      `first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%`
    );
  }
  if (types) {
    query = query.in('insurance_type', types.split(','));
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data } = await query;
  const rows = (data ?? []) as SubmissionRow[];

  // Collect all form_data keys across all rows
  const formDataKeys = new Set<string>();
  for (const row of rows) {
    const flat = flattenFormData(row.form_data);
    for (const key of Object.keys(flat)) {
      formDataKeys.add(key);
    }
  }

  const baseHeaders = [
    'id', 'insurance_type', 'status', 'first_name', 'last_name',
    'email', 'phone', 'date_of_birth', 'has_current_insurance',
    'current_carrier', 'current_limits', 'policy_expiry',
    'broker_notes', 'submitted_at',
  ];
  const allHeaders = [...baseHeaders, ...Array.from(formDataKeys)];

  const csvLines: string[] = [allHeaders.map(escapeCsv).join(',')];

  for (const row of rows) {
    const flat = flattenFormData(row.form_data);
    const values = allHeaders.map((h) => {
      if (h in flat) return escapeCsv(flat[h]);
      const val = row[h as keyof SubmissionRow];
      if (val === null || val === undefined) return '';
      return escapeCsv(String(val));
    });
    csvLines.push(values.join(','));
  }

  const csv = csvLines.join('\n');
  const filename = `quotzal-submissions-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
