import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTrialEndingEmail } from "@/lib/emails";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const expected = `Bearer ${secret}`;
  const authorized =
    authHeader.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const errors: string[] = [];

  const { data: trialingBrokers, error } = await supabase
    .from("brokers")
    .select("id, email, brokerage_name, trial_ends_at, sent_trial_reminders")
    .eq("status", "trialing")
    .not("trial_ends_at", "is", null);

  if (error) {
    console.error("trial-reminders error:", error);
    return NextResponse.json(
      { success: false, processed: 0, errors: [error.message] },
      { status: 500 }
    );
  }

  const now = new Date();
  let processed = 0;

  for (const broker of trialingBrokers ?? []) {
    const trialEnd = new Date(broker.trial_ends_at);
    const diffMs = trialEnd.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const remindDays = [7, 3, 1];
    if (!remindDays.includes(daysLeft)) continue;

    const sentReminders: number[] =
      (broker.sent_trial_reminders as number[]) ?? [];
    if (sentReminders.includes(daysLeft)) continue;

    try {
      // Get submission count for context in email
      const { count } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("broker_id", broker.id);

      await sendTrialEndingEmail(
        broker.email,
        broker.brokerage_name,
        daysLeft,
        count ?? 0
      );

      const updatedReminders = [...sentReminders, daysLeft];
      await supabase
        .from("brokers")
        .update({ sent_trial_reminders: updatedReminders })
        .eq("id", broker.id);

      processed++;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      errors.push(`broker ${broker.id}: ${message}`);
    }
  }

  return NextResponse.json({ success: errors.length === 0, processed, errors });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
