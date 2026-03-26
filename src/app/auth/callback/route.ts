import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  const supabase = await createClient();

  // PKCE flow — exchange code for session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Route based on token type
      if (type === "signup") {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/dashboard`);
      }

      if (type === "email_change") {
        return NextResponse.redirect(
          `${origin}/dashboard/settings?success=email_changed`
        );
      }

      // Default: check if broker exists to decide onboarding vs dashboard
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const admin = createAdminClient();
        const { data: broker } = await admin
          .from("brokers")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (broker) {
          return NextResponse.redirect(`${origin}${next || "/dashboard"}`);
        }
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next || "/dashboard"}`);
    }
  }

  // Token hash flow (magic link / email change via token_hash)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "recovery" | "email" | "email_change",
    });

    if (!error) {
      if (type === "signup") {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/dashboard`);
      }
      if (type === "email_change") {
        return NextResponse.redirect(
          `${origin}/dashboard/settings?success=email_changed`
        );
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }

    // Token expired or invalid — redirect with error context
    if (type === "email_change") {
      return NextResponse.redirect(
        `${origin}/dashboard/settings?error=link_expired`
      );
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
