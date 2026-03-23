import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface UpdateBrandingBody {
  logo_url?: string | null;
  brand_color?: string | null;
  remove_branding?: boolean;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify broker is on Pro plan
  const { data: broker } = await supabase
    .from("brokers")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!broker || broker.plan !== "pro") {
    return NextResponse.json(
      { error: "Branding customization requires the Pro plan" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as UpdateBrandingBody;

  const updates: Record<string, string | null> = {};

  if (body.remove_branding) {
    updates.logo_url = null;
    updates.brand_color = null;
  } else {
    if (body.logo_url !== undefined) {
      updates.logo_url = body.logo_url;
    }
    if (body.brand_color !== undefined) {
      updates.brand_color = body.brand_color;
    }
  }

  const { error } = await supabase
    .from("brokers")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update branding" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
