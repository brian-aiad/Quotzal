import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const url = new URL(request.url);
  const brokerFilter = url.searchParams.get("broker") || "";
  const typeFilter = url.searchParams.get("type") || "";
  const dateFrom = url.searchParams.get("from") || "";
  const dateTo = url.searchParams.get("to") || "";
  const format = url.searchParams.get("format") || "";

  let query = admin
    .from("submissions")
    .select("id, broker_id, insurance_type, status, first_name, last_name, email, phone, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(500);

  if (typeFilter) {
    query = query.eq("insurance_type", typeFilter);
  }
  if (dateFrom) {
    query = query.gte("submitted_at", new Date(dateFrom).toISOString());
  }
  if (dateTo) {
    const endDate = new Date(dateTo);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt("submitted_at", endDate.toISOString());
  }

  const { data: submissions, error } = await query;
  if (error) {
    console.error("admin/submissions GET error:", error);
    return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
  }

  // Get broker names
  const brokerIds = [...new Set((submissions ?? []).map((s) => s.broker_id))];
  const { data: brokers } = await admin
    .from("brokers")
    .select("id, brokerage_name")
    .in("id", brokerIds);

  const brokerMap = new Map((brokers ?? []).map((b) => [b.id, b.brokerage_name]));

  let enriched = (submissions ?? []).map((s) => ({
    ...s,
    brokerage_name: brokerMap.get(s.broker_id) || "Unknown",
  }));

  if (brokerFilter) {
    enriched = enriched.filter((s) =>
      s.brokerage_name.toLowerCase().includes(brokerFilter.toLowerCase())
    );
  }

  // CSV export
  if (format === "csv") {
    const headers = ["Name", "Email", "Phone", "Broker", "Type", "Status", "Submitted"];
    const rows = enriched.map((s) => [
      `${s.first_name} ${s.last_name}`,
      s.email,
      s.phone || "",
      s.brokerage_name,
      s.insurance_type,
      s.status,
      new Date(s.submitted_at).toISOString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="submissions-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  return NextResponse.json({ submissions: enriched });
}
