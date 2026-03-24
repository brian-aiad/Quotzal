import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { linkId, isActive } = await request.json();
  if (!linkId) {
    return NextResponse.json({ error: "linkId required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("broker_links")
    .update({ is_active: isActive })
    .eq("id", linkId)
    .eq("broker_id", user.id)
    .eq("is_primary", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
