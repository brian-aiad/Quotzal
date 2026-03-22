import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: broker, error: fetchError } = await admin
    .from("brokers")
    .select("stripe_customer_id, email, brokerage_name")
    .eq("id", user.id)
    .single();

  if (fetchError || !broker) {
    return NextResponse.json(
      { error: "Broker not found" },
      { status: 404 }
    );
  }

  if (broker.stripe_customer_id) {
    return NextResponse.json({
      customerId: broker.stripe_customer_id,
    });
  }

  const customer = await stripe.customers.create({
    email: broker.email,
    name: broker.brokerage_name,
    metadata: {
      broker_id: user.id,
    },
  });

  const { error: updateError } = await admin
    .from("brokers")
    .update({ stripe_customer_id: customer.id })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to save Stripe customer ID" },
      { status: 500 }
    );
  }

  return NextResponse.json({ customerId: customer.id });
}
