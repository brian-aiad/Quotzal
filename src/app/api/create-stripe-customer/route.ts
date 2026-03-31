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
    return NextResponse.json(
      { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const admin = createAdminClient();

  const { data: broker, error: fetchError } = await admin
    .from("brokers")
    .select("stripe_customer_id, email, brokerage_name")
    .eq("id", user.id)
    .single();

  if (fetchError || !broker) {
    return NextResponse.json(
      { success: false, error: "Broker not found", code: "BROKER_NOT_FOUND" },
      { status: 404 }
    );
  }

  if (broker.stripe_customer_id) {
    return NextResponse.json({
      success: true,
      data: { customerId: broker.stripe_customer_id },
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
      { success: false, error: "Failed to save Stripe customer ID", code: "UPDATE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { customerId: customer.id } });
}
