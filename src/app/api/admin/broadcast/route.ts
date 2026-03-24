import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendBroadcastEmail } from "@/lib/emails";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === process.env.ADMIN_EMAIL;
}

function buildFilter(filter: string): { status?: string; plan?: string } {
  switch (filter) {
    case "trialing":
      return { status: "trialing" };
    case "pro":
      return { status: "active", plan: "pro" };
    case "starter":
      return { status: "active", plan: "starter" };
    case "past_due":
      return { status: "past_due" };
    case "all_active":
    default:
      return { status: "active" };
  }
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const url = new URL(request.url);
  const filter = url.searchParams.get("filter") || "all_active";
  const criteria = buildFilter(filter);

  let query = admin.from("brokers").select("email", { count: "exact", head: true });
  if (criteria.status) query = query.eq("status", criteria.status);
  if (criteria.plan) query = query.eq("plan", criteria.plan);

  const { count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: count ?? 0 });
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { subject, body, filter } = await request.json();
  if (!subject || !body) {
    return NextResponse.json({ error: "Subject and body required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const criteria = buildFilter(filter || "all_active");

  let query = admin.from("brokers").select("email");
  if (criteria.status) query = query.eq("status", criteria.status);
  if (criteria.plan) query = query.eq("plan", criteria.plan);

  const { data: brokers, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const emails = (brokers ?? []).map((b) => b.email);
  if (emails.length === 0) {
    return NextResponse.json({ error: "No recipients found" }, { status: 400 });
  }

  await sendBroadcastEmail(emails, subject, body);

  return NextResponse.json({ success: true, sent: emails.length });
}
