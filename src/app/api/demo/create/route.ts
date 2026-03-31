import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDemoEmail } from "@/lib/emails";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 demo requests per IP per hour
    const ip = getClientIp(request.headers);
    const { allowed } = checkRateLimit(ip, "demo-create", {
      maxRequests: 3,
      windowMs: 60 * 60 * 1000,
    });

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later.", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const brokerageName = sanitizeText(body.brokerageName || "", 200);
    const fullName = sanitizeText(body.fullName || "", 200);
    const email = sanitizeText(body.email || "", 254);
    const phone = sanitizeText(body.phone || "", 20);

    if (!brokerageName || !fullName || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format", code: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const demoSlug = `demo-${slugify(brokerageName).slice(0, 30)}-${randomSuffix}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: demoError } = await supabase.from("demo_requests").insert({
      email,
      brokerage_name: brokerageName,
      full_name: fullName,
      phone: phone || null,
      demo_slug: demoSlug,
      expires_at: expiresAt.toISOString(),
    });

    if (demoError) {
      return NextResponse.json(
        { success: false, error: "Failed to create demo request", code: "INSERT_FAILED" },
        { status: 500 }
      );
    }

    await sendDemoEmail(email, fullName, demoSlug);

    return NextResponse.json({ success: true, data: { demoSlug, email } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
