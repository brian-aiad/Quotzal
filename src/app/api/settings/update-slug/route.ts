import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { slug: string };
  const slug = body.slug?.trim().toLowerCase();

  if (!slug || !SLUG_REGEX.test(slug)) {
    return NextResponse.json(
      { error: "Invalid slug format. Must be 3-30 characters, lowercase letters, numbers, and hyphens only." },
      { status: 400 }
    );
  }

  if (RESERVED_SLUGS.includes(slug)) {
    return NextResponse.json(
      { error: "This slug is reserved" },
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
      { error: "Primary link not found" },
      { status: 404 }
    );
  }

  if (primaryLink.slug === slug) {
    return NextResponse.json(
      { error: "This is already your current slug" },
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
        { error: "This slug is already taken" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update slug" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, slug });
}
