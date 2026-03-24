import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();

  const { data: broker, error } = await admin
    .from("brokers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !broker) {
    return NextResponse.json({ error: "Broker not found" }, { status: 404 });
  }

  const { data: payments } = await admin
    .from("payments")
    .select("*")
    .eq("broker_id", id)
    .order("created_at", { ascending: false });

  const { count: submissionCount } = await admin
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("broker_id", id);

  const { data: links } = await admin
    .from("broker_links")
    .select("slug, is_primary, is_active")
    .eq("broker_id", id);

  return NextResponse.json({
    broker,
    payments: payments ?? [],
    submissionCount: submissionCount ?? 0,
    links: links ?? [],
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const body = await request.json();

  const allowedFields = ["plan", "status"];
  const updates: Record<string, string> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // If deactivating (cancelled/suspended), also deactivate links
  if (updates.status === "cancelled" || updates.status === "suspended") {
    await admin
      .from("broker_links")
      .update({ is_active: false })
      .eq("broker_id", id);
  }

  // If reactivating, re-enable primary link
  if (updates.status === "active") {
    await admin
      .from("broker_links")
      .update({ is_active: true })
      .eq("broker_id", id)
      .eq("is_primary", true);
  }

  const { error } = await admin.from("brokers").update(updates).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
