import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDeletionWarningEmail } from "@/lib/emails";

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
  const now = new Date();
  const thirtyDaysFromNow = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000
  );
  const errors: string[] = [];

  // Find submissions approaching deletion that haven't been warned
  const { data: warningSubmissions, error: warningError } = await supabase
    .from("submissions")
    .select("id, broker_id, scheduled_deletion_at")
    .lte("scheduled_deletion_at", thirtyDaysFromNow.toISOString())
    .is("deletion_warning_sent_at", null)
    .not("scheduled_deletion_at", "is", null);

  if (warningError) {
    return NextResponse.json(
      { success: false, processed: 0, errors: [warningError.message] },
      { status: 500 }
    );
  }

  // Group by broker_id
  const brokerGroups = new Map<
    string,
    { count: number; earliestDeletion: string }
  >();
  for (const sub of warningSubmissions ?? []) {
    const existing = brokerGroups.get(sub.broker_id);
    if (existing) {
      existing.count++;
      if (sub.scheduled_deletion_at < existing.earliestDeletion) {
        existing.earliestDeletion = sub.scheduled_deletion_at;
      }
    } else {
      brokerGroups.set(sub.broker_id, {
        count: 1,
        earliestDeletion: sub.scheduled_deletion_at,
      });
    }
  }

  let processed = 0;

  for (const [brokerId, group] of brokerGroups) {
    try {
      const { data: broker } = await supabase
        .from("brokers")
        .select("email, brokerage_name, plan")
        .eq("id", brokerId)
        .single();

      if (!broker) continue;

      const deletionDate = new Date(
        group.earliestDeletion
      ).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      await sendDeletionWarningEmail(
        broker.email,
        broker.brokerage_name,
        group.count,
        deletionDate,
        broker.plan === "pro"
      );

      // Mark all these submissions as warned
      const subIds = (warningSubmissions ?? [])
        .filter((s) => s.broker_id === brokerId)
        .map((s) => s.id);

      await supabase
        .from("submissions")
        .update({ deletion_warning_sent_at: now.toISOString() })
        .in("id", subIds);

      processed++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      errors.push(`broker ${brokerId}: ${message}`);
    }
  }

  // Hard delete submissions past their deletion date
  const { data: deletedSubmissions, error: deleteError } = await supabase
    .from("submissions")
    .delete()
    .lte("scheduled_deletion_at", now.toISOString())
    .not("scheduled_deletion_at", "is", null)
    .select("id");

  if (deleteError) {
    errors.push(`deletion: ${deleteError.message}`);
  }

  const deletedCount = deletedSubmissions?.length ?? 0;

  return NextResponse.json({
    success: errors.length === 0,
    processed: processed + deletedCount,
    errors,
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
