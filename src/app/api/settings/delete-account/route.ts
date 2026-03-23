import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { confirmation: string };

  if (body.confirmation !== "DELETE") {
    return NextResponse.json(
      { error: "Please type DELETE to confirm" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Get broker details for Stripe cancellation
  const { data: broker } = await admin
    .from("brokers")
    .select("id, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!broker) {
    return NextResponse.json(
      { error: "Broker not found" },
      { status: 404 }
    );
  }

  // Cancel Stripe subscription if exists
  if (broker.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(broker.stripe_subscription_id);
    } catch {
      // Subscription may already be cancelled — continue with deletion
    }
  }

  // Hard-delete all submissions
  await admin
    .from("submissions")
    .delete()
    .eq("broker_id", user.id);

  // Soft-delete broker (set status to cancelled)
  await admin
    .from("brokers")
    .update({ status: "cancelled" })
    .eq("id", user.id);

  // Sign out the user
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
