import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { escapePostgrestPattern } from "@/lib/sanitize";

export async function GET(request: NextRequest) {
  // Verify admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const plan = url.searchParams.get("plan") || "";

  // Get all brokers
  let query = admin.from("brokers").select("id, email, brokerage_name, plan, status, created_at");
  if (search) {
    const s = escapePostgrestPattern(search);
    query = query.or(`brokerage_name.ilike.%${s}%,email.ilike.%${s}%`);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (plan) {
    query = query.eq("plan", plan);
  }
  query = query.order("created_at", { ascending: false });

  const { data: brokers, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get submission counts per broker
  const brokerIds = (brokers ?? []).map((b) => b.id);
  const brokersWithCounts = await Promise.all(
    (brokers ?? []).map(async (broker) => {
      const { count } = await admin
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("broker_id", broker.id);
      return { ...broker, submission_count: count ?? 0 };
    })
  );

  // Calculate stats from ALL brokers (unfiltered)
  const { data: allBrokers } = await admin.from("brokers").select("plan, status");
  const { count: totalSubmissions } = await admin
    .from("submissions")
    .select("*", { count: "exact", head: true });

  const all = allBrokers ?? [];
  const activeCount = all.filter((b) => b.status === "active").length;
  const trialingCount = all.filter((b) => b.status === "trialing").length;
  const pastDueCount = all.filter((b) => b.status === "past_due").length;
  const cancelledSuspended = all.filter(
    (b) => b.status === "cancelled" || b.status === "suspended"
  ).length;

  // MRR: Active Starter × $19 + Active Pro × $39
  const activeStarter = all.filter((b) => b.status === "active" && b.plan === "starter").length;
  const activePro = all.filter((b) => b.status === "active" && b.plan === "pro").length;
  const mrr = activeStarter * 1900 + activePro * 3900;

  return NextResponse.json({
    brokers: brokersWithCounts,
    stats: {
      totalBrokers: all.length,
      active: activeCount,
      trialing: trialingCount,
      pastDue: pastDueCount,
      cancelledSuspended,
      totalSubmissions: totalSubmissions ?? 0,
      mrr,
    },
  });
}
