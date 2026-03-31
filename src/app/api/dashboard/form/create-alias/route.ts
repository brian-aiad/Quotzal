import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  // Check plan
  const { data: broker } = await supabase
    .from("brokers")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!broker || broker.plan !== "pro") {
    return NextResponse.json(
      { success: false, error: "Pro plan required", code: "PRO_REQUIRED" },
      { status: 403 }
    );
  }

  const raw = await request.json();
  const slug = sanitizeText(raw.slug || "", 30).toLowerCase();
  const label = sanitizeText(raw.label || "", 100);
  if (!slug || !label) {
    return NextResponse.json(
      { success: false, error: "Slug and label required", code: "MISSING_FIELDS" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("broker_links").insert({
    broker_id: user.id,
    slug,
    label,
    is_primary: false,
    is_active: true,
  });

  if (error) {
    console.error("dashboard/form/create-alias POST error:", error);
    return NextResponse.json(
      { success: false, error: "An internal error occurred", code: "INSERT_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
