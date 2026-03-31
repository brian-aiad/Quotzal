import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { MAX_SLUG_LENGTH } from "@/lib/constants";

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

// Lowercase letters, numbers, hyphens only. No leading/trailing/consecutive hyphens. 3-50 chars.
const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function isValidSlug(slug: string): boolean {
  if (slug.length < 3 || slug.length > MAX_SLUG_LENGTH) return false;
  if (!SLUG_REGEX.test(slug)) return false;
  if (slug.includes("--")) return false;
  return true;
}

export async function GET(request: NextRequest) {
  // Rate limit: 30 checks per IP per minute (slug checks happen on keystroke)
  const ip = getClientIp(request.headers);
  const { allowed } = checkRateLimit(ip, "check-slug", {
    maxRequests: 30,
    windowMs: 60 * 1000,
  });

  if (!allowed) {
    return NextResponse.json(
      { success: false, available: false, reason: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { success: false, available: false, reason: "Slug is required" },
      { status: 400 }
    );
  }

  if (!isValidSlug(slug)) {
    return NextResponse.json({
      success: true,
      available: false,
      reason: `Must be 3-${MAX_SLUG_LENGTH} characters, lowercase letters, numbers, and hyphens only. No leading, trailing, or consecutive hyphens.`,
    });
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return NextResponse.json({
      success: true,
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
      { success: false, available: false, reason: "Error checking availability", code: "CHECK_FAILED" },
      { status: 500 }
    );
  }

  const taken = !!(brokersResult.data || linksResult.data || demoResult.data);

  return NextResponse.json({
    success: true,
    available: !taken,
    reason: taken ? "This slug is already taken" : undefined,
  });
}
