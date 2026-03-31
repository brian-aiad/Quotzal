import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MAX_SLUG_LENGTH } from "@/lib/constants";

// Lowercase letters, numbers, hyphens only. No leading/trailing/consecutive hyphens. 3-50 chars.
const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function isValidSlug(slug: string): boolean {
  if (slug.length < 3 || slug.length > MAX_SLUG_LENGTH) return false;
  if (!SLUG_REGEX.test(slug)) return false;
  if (slug.includes("--")) return false;
  return true;
}

const RESERVED_SLUGS = [
  "admin", "api", "dashboard", "f", "login", "signup",
  "demo", "billing", "settings", "form", "assets", "static",
];

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

  const body = (await request.json()) as { slug: string };
  const slug = body.slug?.trim().toLowerCase();

  if (!slug || !isValidSlug(slug)) {
    return NextResponse.json(
      { success: false, error: `Invalid slug format. Must be 3-${MAX_SLUG_LENGTH} characters, lowercase letters, numbers, and hyphens only. No consecutive hyphens.`, code: "INVALID_SLUG" },
      { status: 400 }
    );
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return NextResponse.json(
      { success: false, error: "This slug is reserved", code: "SLUG_RESERVED" },
      { status: 400 }
    );
  }

  // Get the broker's primary link
  const { data: primaryLink, error: linkError } = await supabase
    .from("broker_links")
    .select("id, slug")
    .eq("broker_id", user.id)
    .eq("is_primary", true)
    .single();

  if (linkError || !primaryLink) {
    return NextResponse.json(
      { success: false, error: "Primary link not found", code: "LINK_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (primaryLink.slug === slug) {
    return NextResponse.json(
      { success: false, error: "This is already your current slug", code: "SLUG_UNCHANGED" },
      { status: 400 }
    );
  }

  // Update the primary link slug
  const { error: updateError } = await supabase
    .from("broker_links")
    .update({ slug })
    .eq("id", primaryLink.id);

  if (updateError) {
    if (updateError.message?.includes("already taken")) {
      return NextResponse.json(
        { success: false, error: "This slug is already taken", code: "SLUG_TAKEN" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update slug", code: "UPDATE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { slug } });
}
