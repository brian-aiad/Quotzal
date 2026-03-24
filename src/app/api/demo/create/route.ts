import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDemoEmail } from "@/lib/emails";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: NextRequest) {
  const { brokerageName, fullName, email, phone } = await request.json();

  if (!brokerageName || !fullName || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const demoSlug = `demo-${slugify(brokerageName)}-${randomSuffix}`;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Create demo_requests record
  const { error: demoError } = await supabase.from("demo_requests").insert({
    email,
    brokerage_name: brokerageName,
    full_name: fullName,
    phone: phone || null,
    demo_slug: demoSlug,
    expires_at: expiresAt.toISOString(),
  });

  if (demoError) {
    return NextResponse.json({ error: demoError.message }, { status: 500 });
  }

  // Send demo email
  await sendDemoEmail(email, fullName, demoSlug);

  return NextResponse.json({ demoSlug, email });
}
