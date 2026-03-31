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
    return NextResponse.json(
      { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
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
      { success: false, error: "Missing required fields", code: "MISSING_FIELDS" },
      { status: 400 }
    );
  }

  // Sanitize inputs
  const brokerageName = sanitizeText(body.brokerageName, 200);
  const phone = sanitizeText(body.phone, 20);
  const address = sanitizeText(body.address, 500);
  const slug = sanitizeText(body.slug, 30).toLowerCase();

  const admin = createAdminClient();

  // Check if broker already exists (e.g. user cancelled Stripe checkout and retried)
  const { data: existingBroker } = await admin
    .from("brokers")
    .select("id, slug")
    .eq("id", user.id)
    .maybeSingle();

  if (existingBroker) {
    // Broker already created from a previous attempt — update instead of insert
    const { error: updateError } = await admin
      .from("brokers")
      .update({
        brokerage_name: brokerageName,
        phone,
        address,
        slug,
        insurance_types_enabled: body.insuranceTypes,
        plan: body.plan,
        logo_url: body.logoUrl ?? null,
        brand_color: body.brandColor ?? null,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "Failed to update onboarding data", code: "UPDATE_FAILED" },
        { status: 500 }
      );
    }

    // Update broker_links slug if broker slug changed
    const linkSlug = `${slug}-link`;
    const { data: existingLink } = await admin
      .from("broker_links")
      .select("id")
      .eq("broker_id", user.id)
      .eq("is_primary", true)
      .maybeSingle();

    if (existingLink) {
      await admin
        .from("broker_links")
        .update({ slug: linkSlug })
        .eq("id", existingLink.id);
    } else {
      // Primary link missing — recreate it
      const { error: linkError } = await admin.from("broker_links").insert({
        broker_id: user.id,
        slug: linkSlug,
        label: "Primary Link",
        is_primary: true,
        is_active: true,
      });

      if (linkError) {
        return NextResponse.json(
          { success: false, error: "Failed to create form link. Please try again.", code: "LINK_CREATE_FAILED" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  }

  // First-time onboarding — insert new broker
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
        { success: false, error: "A broker with this email or slug already exists", code: "DUPLICATE" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to save onboarding data", code: "INSERT_FAILED" },
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
      { success: false, error: "Failed to create form link. Please try again.", code: "LINK_CREATE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
