import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import type Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);
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
    await resend.emails.send({
      from: "Quotzal <notifications@quotzal.com>",
      to: broker.email,
      subject: "Welcome to Quotzal!",
      html: `
        <h2>Welcome to Quotzal, ${broker.brokerage_name}!</h2>
        <p>Your account is now active. Here's what you can do next:</p>
        <ul>
          <li>Share your intake form link with clients</li>
          <li>View and manage submissions from your dashboard</li>
          <li>Customize your form settings anytime</li>
        </ul>
        <p><a href="https://quotzal.com/dashboard">Go to your dashboard</a></p>
        <br />
        <p style="color: #6b7280; font-size: 12px;">Powered by Quotzal</p>
      `,
    });
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

  await resend.emails.send({
    from: "Quotzal <notifications@quotzal.com>",
    to: broker.email,
    subject: "Payment failed — action required",
    html: `
      <h2>Payment Failed</h2>
      <p>Hi ${broker.brokerage_name},</p>
      <p>We were unable to process your latest payment. Please update your payment method to keep your account active.</p>
      <p><a href="https://quotzal.com/dashboard/billing">Update payment method</a></p>
      <p>If your payment is not resolved, your intake form link will be deactivated.</p>
      <br />
      <p style="color: #6b7280; font-size: 12px;">Powered by Quotzal</p>
    `,
  });
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

  await resend.emails.send({
    from: "Quotzal <notifications@quotzal.com>",
    to: broker.email,
    subject: "Your Quotzal subscription has been cancelled",
    html: `
      <h2>Subscription Cancelled</h2>
      <p>Hi ${broker.brokerage_name},</p>
      <p>Your subscription has been cancelled and your intake form link has been deactivated.</p>
      <p>Your existing submission data will be retained for 90 days. You can reactivate your account anytime by subscribing again.</p>
      <p><a href="https://quotzal.com/dashboard/billing">Reactivate your account</a></p>
      <br />
      <p style="color: #6b7280; font-size: 12px;">Powered by Quotzal</p>
    `,
  });
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
