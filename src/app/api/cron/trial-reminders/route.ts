import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTrialEndingEmail } from "@/lib/emails";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: trialingBrokers, error } = await supabase
    .from("brokers")
    .select("id, email, brokerage_name, trial_ends_at, sent_trial_reminders")
    .eq("status", "trialing")
    .not("trial_ends_at", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date();
  let sentCount = 0;

  for (const broker of trialingBrokers ?? []) {
    const trialEnd = new Date(broker.trial_ends_at);
    const diffMs = trialEnd.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const remindDays = [7, 3, 1];
    if (!remindDays.includes(daysLeft)) continue;

    const sentReminders: number[] = (broker.sent_trial_reminders as number[]) ?? [];
    if (sentReminders.includes(daysLeft)) continue;

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

    sentCount++;
  }

  return NextResponse.json({ success: true, sent: sentCount });
}
