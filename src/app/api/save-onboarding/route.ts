import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeText } from "@/lib/sanitize";
import type { InsuranceType } from "@/lib/types/intake-form";

interface SaveOnboardingBody {
  brokerageName: string;
  phone: string;
  address: string;
  slug: string;
  insuranceTypes: InsuranceType[];
  plan: "starter" | "pro";
  logoUrl?: string;
  brandColor?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SaveOnboardingBody;

  if (
    !body.brokerageName ||
    !body.phone ||
    !body.address ||
    !body.slug ||
    !body.insuranceTypes?.length
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Sanitize inputs
  const brokerageName = sanitizeText(body.brokerageName, 200);
  const phone = sanitizeText(body.phone, 20);
  const address = sanitizeText(body.address, 500);
  const slug = sanitizeText(body.slug, 30).toLowerCase();

  const admin = createAdminClient();

  const { error } = await admin.from("brokers").insert({
    id: user.id,
    email: user.email,
    brokerage_name: brokerageName,
    phone,
    address,
    slug,
    insurance_types_enabled: body.insuranceTypes,
    plan: body.plan,
    status: "trialing",
    logo_url: body.logoUrl ?? null,
    brand_color: body.brandColor ?? null,
    trial_ends_at: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A broker with this email or slug already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }

  // Create primary broker_links row (REQUIRED — /f/[slug] depends on this)
  // Per DONT_DO.md: broker_links.slug must differ from brokers.slug
  const linkSlug = `${slug}-link`;
  const { error: linkError } = await admin.from("broker_links").insert({
    broker_id: user.id,
    slug: linkSlug,
    label: "Primary Link",
    is_primary: true,
    is_active: true,
  });

  if (linkError) {
    // If link creation fails, clean up the broker row
    await admin.from("brokers").delete().eq("id", user.id);
    return NextResponse.json(
      { error: "Failed to create form link. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
