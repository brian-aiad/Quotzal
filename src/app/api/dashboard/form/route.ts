import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { data: broker } = await supabase
    .from("brokers")
    .select("slug, plan, insurance_types_enabled, form_config, logo_url, brand_color")
    .eq("id", user.id)
    .single();

  if (!broker) {
    return NextResponse.json(
      { success: false, error: "Broker not found", code: "BROKER_NOT_FOUND" },
      { status: 404 }
    );
  }

  const { data: links } = await supabase
    .from("broker_links")
    .select("id, slug, label, is_primary, is_active")
    .eq("broker_id", user.id)
    .order("is_primary", { ascending: false });

  return NextResponse.json({
    success: true,
    data: {
      slug: broker.slug,
      plan: broker.plan,
      insurance_types_enabled: broker.insurance_types_enabled,
      form_config: broker.form_config,
      logo_url: broker.logo_url,
      brand_color: broker.brand_color,
      links: links ?? [],
    },
  });
}
