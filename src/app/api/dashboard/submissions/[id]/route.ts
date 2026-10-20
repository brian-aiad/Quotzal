import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeText } from '@/lib/sanitize';
import { TAG_COLORS, MAX_BROKER_NOTES_LENGTH, SUBMISSION_STATUSES } from '@/lib/constants';

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
    return NextResponse.json(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const body = (await request.json()) as Record<string, unknown>;

  // Only allow updating status and broker_notes
  const updates: Record<string, unknown> = {};
  if ('status' in body) {
    const validStatuses: readonly string[] = SUBMISSION_STATUSES;
    if (validStatuses.includes(body.status as string)) {
      updates.status = body.status;
    }
  }
  if ('broker_notes' in body) {
    if (typeof body.broker_notes === 'string' && body.broker_notes.length > MAX_BROKER_NOTES_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Notes must be ${MAX_BROKER_NOTES_LENGTH} characters or less`, code: 'NOTES_TOO_LONG' },
        { status: 400 }
      );
    }
    updates.broker_notes = typeof body.broker_notes === 'string'
      ? sanitizeText(body.broker_notes, MAX_BROKER_NOTES_LENGTH)
      : null;
  }
  if ('tags' in body) {
    if (body.tags === null) {
      updates.tags = null;
    } else if (Array.isArray(body.tags)) {
      const validColors = TAG_COLORS as readonly string[];
      const isValid = (body.tags as unknown[]).every((tag) => {
        if (typeof tag !== 'object' || tag === null) return false;
        const t = tag as Record<string, unknown>;
        return (
          typeof t.text === 'string' &&
          t.text.trim().length > 0 &&
          t.text.length <= 50 &&
          typeof t.color === 'string' &&
          validColors.includes(t.color)
        );
      });
      if (isValid) {
        updates.tags = (body.tags as Array<{ text: string; color: string }>).map((t) => ({
          text: sanitizeText(t.text, 50),
          color: t.color,
        }));
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { success: false, error: 'No valid fields to update', code: 'NO_VALID_FIELDS' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('submissions')
    .update(updates)
    .eq('id', id)
    .eq('broker_id', user.id);

  if (error) {
    console.error("dashboard/submissions/[id] PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "An internal error occurred", code: "UPDATE_FAILED" },
      { status: 500 }
    );
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
    return NextResponse.json(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', id)
    .eq('broker_id', user.id);

  if (error) {
    console.error("dashboard/submissions/[id] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "An internal error occurred", code: "DELETE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
