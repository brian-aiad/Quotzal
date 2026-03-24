import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeText } from '@/lib/sanitize';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;

  // Only allow updating status and broker_notes
  const updates: Record<string, unknown> = {};
  if ('status' in body) {
    const validStatuses = ['new', 'reviewed', 'archived'];
    if (validStatuses.includes(body.status as string)) {
      updates.status = body.status;
    }
  }
  if ('broker_notes' in body) {
    updates.broker_notes = typeof body.broker_notes === 'string'
      ? sanitizeText(body.broker_notes as string, 5000)
      : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const { error } = await supabase
    .from('submissions')
    .update(updates)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
