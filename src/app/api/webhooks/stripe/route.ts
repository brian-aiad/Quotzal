import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendWelcomeEmail,
  sendPaymentFailedEmail,
  sendLinkDeactivatedEmail,
} from "@/lib/emails";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const PRICE_TO_PLAN: Record<string, "starter" | "pro"> = {
  [process.env.STRIPE_STARTER_PRICE_ID!]: "starter",
  [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
};

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  const supabase = createAdminClient();

  const { data: broker } = await supabase
    .from("brokers")
    .select("id, email, brokerage_name")
    .eq("stripe_customer_id", customerId)
    .single<{ id: string; email: string; brokerage_name: string }>();

  if (!broker) return;

  // Idempotency: skip if invoice already recorded
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_invoice_id", invoice.id)
    .maybeSingle();

  if (existing) return;

  await supabase.from("brokers").update({ status: "active" }).eq("id", broker.id);

  const periodStart = invoice.lines?.data?.[0]?.period?.start;
  const periodEnd = invoice.lines?.data?.[0]?.period?.end;

  await supabase.from("payments").insert({
    broker_id: broker.id,
    amount: invoice.amount_paid,
    status: "paid",
    stripe_invoice_id: invoice.id,
    period_start: periodStart
      ? new Date(periodStart * 1000).toISOString()
      : new Date().toISOString(),
    period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : new Date().toISOString(),
  });

  // Check if this is the first payment — send welcome email
  const { count } = await supabase
    .from("payments")
    .select("id", { count: "exact", head: true })
    .eq("broker_id", broker.id);

  if (count === 1) {
    // Fetch primary link slug for welcome email
    const { data: primaryLink } = await supabase
      .from("broker_links")
      .select("slug")
      .eq("broker_id", broker.id)
      .eq("is_primary", true)
      .maybeSingle();

    await sendWelcomeEmail(
      broker.email,
      broker.brokerage_name,
      primaryLink?.slug || ""
    );
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  const supabase = createAdminClient();

  const { data: broker } = await supabase
    .from("brokers")
    .select("id, email, brokerage_name")
    .eq("stripe_customer_id", customerId)
    .single<{ id: string; email: string; brokerage_name: string }>();

  if (!broker) return;

  await supabase.from("brokers").update({ status: "past_due" }).eq("id", broker.id);

  await sendPaymentFailedEmail(
    broker.email,
    broker.brokerage_name,
    invoice.amount_due
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();

  const { data: broker } = await supabase
    .from("brokers")
    .select("id, email, brokerage_name")
    .eq("stripe_subscription_id", subscription.id)
    .single<{ id: string; email: string; brokerage_name: string }>();

  if (!broker) return;

  await supabase.from("brokers").update({ status: "cancelled" }).eq("id", broker.id);

  // Fetch primary link slug for deactivation email
  const { data: primaryLink } = await supabase
    .from("broker_links")
    .select("slug")
    .eq("broker_id", broker.id)
    .eq("is_primary", true)
    .maybeSingle();

  await sendLinkDeactivatedEmail(
    broker.email,
    broker.brokerage_name,
    primaryLink?.slug || ""
  );
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  if (!priceId) return;

  const newPlan = PRICE_TO_PLAN[priceId];
  if (!newPlan) return;

  const supabase = createAdminClient();

  await supabase
    .from("brokers")
    .update({ plan: newPlan })
    .eq("stripe_subscription_id", subscription.id);
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
  }

  return NextResponse.json({ received: true });
}
