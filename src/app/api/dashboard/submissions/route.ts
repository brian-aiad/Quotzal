import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { escapePostgrestPattern } from '@/lib/sanitize';
import { SUBMISSIONS_PER_PAGE } from '@/lib/constants';
import type { SubmissionRow } from '@/lib/types/dashboard';

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? '1');
  const perPage = SUBMISSIONS_PER_PAGE;
  const search = url.searchParams.get('search') ?? '';
  const types = url.searchParams.get('types') ?? '';
  const status = url.searchParams.get('status') ?? '';
  const sortBy = url.searchParams.get('sortBy') ?? 'submitted_at';
  const sortDir = (url.searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';

  let query = supabase
    .from('submissions')
    .select('id, broker_id, link_id, insurance_type, status, broker_notes, first_name, last_name, email, phone, date_of_birth, has_current_insurance, current_carrier, current_limits, policy_expiry, tags, form_data, submitted_at, first_opened_at', { count: 'exact' });

  // Search (escape special PostgREST pattern chars)
  if (search) {
    const s = escapePostgrestPattern(search);
    query = query.or(
      `first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%`
    );
  }

  // Filter by types
  if (types) {
    const typeList = types.split(',');
    query = query.in('insurance_type', typeList);
  }

  // Filter by status
  if (status) {
    query = query.eq('status', status);
  }

  // Sort
  const validSortColumns = ['submitted_at', 'first_name', 'last_name', 'insurance_type', 'status'];
  const col = validSortColumns.includes(sortBy) ? sortBy : 'submitted_at';
  query = query.order(col, { ascending: sortDir === 'asc' });

  // Pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("dashboard/submissions GET error:", error);
    return NextResponse.json(
      { success: false, error: "An internal error occurred", code: "FETCH_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      submissions: (data ?? []) as SubmissionRow[],
      total: count ?? 0,
      page,
      perPage,
    },
  });
}
