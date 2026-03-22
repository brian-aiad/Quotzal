import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { plan: string };
  const priceId = PRICE_IDS[body.plan];

  if (!priceId) {
    return NextResponse.json(
      { error: "Invalid plan" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: broker, error: fetchError } = await admin
    .from("brokers")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (fetchError || !broker?.stripe_customer_id) {
    return NextResponse.json(
      { error: "Stripe customer not found. Complete onboarding first." },
      { status: 400 }
    );
  }

  const origin = request.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    customer: broker.stripe_customer_id,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 30,
    },
    success_url: `${origin}/onboarding?checkout=success`,
    cancel_url: `${origin}/onboarding?checkout=cancelled`,
    metadata: {
      broker_id: user.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
