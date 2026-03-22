import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const RESERVED_SLUGS = [
  "admin",
  "api",
  "dashboard",
  "f",
  "login",
  "signup",
  "demo",
  "billing",
  "settings",
  "form",
  "assets",
  "static",
];

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { available: false, reason: "Slug is required" },
      { status: 400 }
    );
  }

  if (!SLUG_REGEX.test(slug)) {
    return NextResponse.json({
      available: false,
      reason: "Must be 3-30 characters, lowercase letters, numbers, and hyphens only. No leading or trailing hyphens.",
    });
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return NextResponse.json({
      available: false,
      reason: "This slug is reserved",
    });
  }

  const supabase = createAdminClient();

  const [brokersResult, linksResult, demoResult] = await Promise.all([
    supabase.from("brokers").select("id").eq("slug", slug).maybeSingle(),
    supabase.from("broker_links").select("id").eq("slug", slug).maybeSingle(),
    supabase
      .from("demo_requests")
      .select("id")
      .eq("demo_slug", slug)
      .maybeSingle(),
  ]);

  if (brokersResult.error || linksResult.error || demoResult.error) {
    return NextResponse.json(
      { available: false, reason: "Error checking availability" },
      { status: 500 }
    );
  }

  const taken = !!(brokersResult.data || linksResult.data || demoResult.data);

  return NextResponse.json({
    available: !taken,
    reason: taken ? "This slug is already taken" : undefined,
  });
}
