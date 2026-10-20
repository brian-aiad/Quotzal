import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { escapePostgrestPattern } from "@/lib/sanitize";

function escapeCsv(value: string): string {
  const safe = /^[=+@\-\t\r]/.test(value) ? `'${value}` : value;
  if (safe.includes(",") || safe.includes('"') || safe.includes("\n") || safe.includes("\r")) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = new URL(request.url).searchParams;
    const ids = params.getAll('ids');
    if (ids.length > 100 || ids.some((id) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
      return NextResponse.json({ error: 'Invalid submission selection' }, { status: 400 });
    }
    let query = supabase
      .from("submissions")
      .select("*")
      .eq('broker_id', user.id)
      .order("submitted_at", { ascending: false });
    if (ids.length > 0) query = query.in('id', ids);
    if (params.get('types')) query = query.in('insurance_type', params.get('types')!.split(','));
    if (params.get('status')) query = query.eq('status', params.get('status')!);
    if (params.get('search')) {
      const search = escapePostgrestPattern(params.get('search')!);
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    const { data: submissions, error } = await query;
    if (error) return NextResponse.json({ error: 'Unable to export submissions' }, { status: 500 });

    const rows = submissions ?? [];

    // Collect all custom field labels
    const customFieldLabels = new Set<string>();
    for (const row of rows) {
      const fd = row.form_data as Record<string, unknown>;
      if (fd?.custom_fields && typeof fd.custom_fields === "object") {
        for (const key of Object.keys(fd.custom_fields as Record<string, unknown>)) {
          customFieldLabels.add(key);
        }
      }
    }

    const baseHeaders = [
      "Date Submitted", "First Name", "Last Name", "Email", "Phone",
      "Insurance Type", "Status", "Date of Birth", "Current Carrier",
      "Coverage Limits", "Notes",
    ];
    const allHeaders = [...baseHeaders, ...Array.from(customFieldLabels)];

    const csvLines: string[] = [allHeaders.map(escapeCsv).join(",")];

    for (const row of rows) {
      const fd = row.form_data as Record<string, unknown>;
      const customFields = (fd?.custom_fields ?? {}) as Record<string, string>;

      const values = [
        new Date(row.submitted_at).toLocaleDateString(),
        row.first_name ?? "",
        row.last_name ?? "",
        row.email ?? "",
        row.phone ?? "",
        row.insurance_type ?? "",
        row.status ?? "",
        row.date_of_birth ?? "",
        row.current_carrier ?? "",
        row.current_limits ?? "",
        row.broker_notes ?? "",
        ...Array.from(customFieldLabels).map((label) => customFields[label] ?? ""),
      ];

      csvLines.push(values.map((v) => escapeCsv(String(v))).join(","));
    }

    const csv = csvLines.join("\n");
    const filename = `quotzal-leads-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
