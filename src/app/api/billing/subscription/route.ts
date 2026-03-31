import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

interface SubscriptionInfo {
  plan: "starter" | "pro";
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

const PRICE_TO_PLAN: Record<string, "starter" | "pro"> = {
  [process.env.STRIPE_STARTER_PRICE_ID!]: "starter",
  [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
};

const PLAN_TO_PRICE: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
};

export async function GET() {
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

  const { data: broker } = await supabase
    .from("brokers")
    .select("plan, status, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!broker) {
    return NextResponse.json(
      { success: false, error: "Broker not found", code: "BROKER_NOT_FOUND" },
      { status: 404 }
    );
  }

  const info: SubscriptionInfo = {
    plan: broker.plan as "starter" | "pro",
    status: broker.status,
    current_period_end: null,
    cancel_at_period_end: false,
  };

  // Fetch subscription details from Stripe if available
  if (broker.stripe_subscription_id) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        broker.stripe_subscription_id
      );
      const firstItem = subscription.items?.data?.[0];
      if (firstItem?.current_period_end) {
        info.current_period_end = new Date(
          firstItem.current_period_end * 1000
        ).toISOString();
      }
      info.cancel_at_period_end = subscription.cancel_at_period_end;
    } catch {
      // Subscription may not exist in Stripe — return what we have
    }
  }

  // Fetch payment history
  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, status, period_start, period_end, created_at")
    .eq("broker_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    success: true,
    data: { subscription: info, payments: payments || [] },
  });
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

  const { data: broker } = await supabase
    .from("brokers")
    .select("stripe_subscription_id, stripe_customer_id, plan")
    .eq("id", user.id)
    .single();

  if (!broker?.stripe_subscription_id) {
    return NextResponse.json(
      { success: false, error: "No active subscription found", code: "NO_SUBSCRIPTION" },
      { status: 400 }
    );
  }

  const body = (await request.json()) as { action: string; plan?: string };

  switch (body.action) {
    case "upgrade":
    case "downgrade": {
      const targetPlan = body.plan;
      if (!targetPlan || !PLAN_TO_PRICE[targetPlan]) {
        return NextResponse.json(
          { success: false, error: "Invalid plan", code: "INVALID_PLAN" },
          { status: 400 }
        );
      }

      const subscription = await stripe.subscriptions.retrieve(
        broker.stripe_subscription_id
      );
      const currentItem = subscription.items.data[0];

      if (!currentItem) {
        return NextResponse.json(
          { success: false, error: "No subscription item found", code: "NO_SUBSCRIPTION_ITEM" },
          { status: 400 }
        );
      }

      // Check if already on target plan
      const currentPlan = PRICE_TO_PLAN[currentItem.price.id];
      if (currentPlan === targetPlan) {
        return NextResponse.json(
          { success: false, error: `Already on the ${targetPlan} plan`, code: "ALREADY_ON_PLAN" },
          { status: 400 }
        );
      }

      await stripe.subscriptions.update(broker.stripe_subscription_id, {
        items: [
          {
            id: currentItem.id,
            price: PLAN_TO_PRICE[targetPlan],
          },
        ],
        proration_behavior: "create_prorations",
      });

      return NextResponse.json({ success: true });
    }

    case "cancel": {
      await stripe.subscriptions.update(broker.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      return NextResponse.json({ success: true });
    }

    case "reactivate": {
      await stripe.subscriptions.update(broker.stripe_subscription_id, {
        cancel_at_period_end: false,
      });

      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json(
        { success: false, error: "Invalid action", code: "INVALID_ACTION" },
        { status: 400 }
      );
  }
}
