import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: submissions } = await supabase
      .from("submissions")
      .select("*")
      .order("submitted_at", { ascending: false });

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
