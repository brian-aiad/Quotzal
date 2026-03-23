import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface UpdateRetentionBody {
  extended: boolean;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify broker is on Pro plan
  const { data: broker } = await supabase
    .from("brokers")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (!broker || broker.plan !== "pro") {
    return NextResponse.json(
      { error: "Extended retention requires the Pro plan" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as UpdateRetentionBody;
  const retentionMonths = body.extended ? 24 : 12;

  // Use admin client to update all submissions' scheduled_deletion_at
  const admin = createAdminClient();

  // Get all submissions for this broker
  const { data: submissions, error: fetchError } = await admin
    .from("submissions")
    .select("id, submitted_at")
    .eq("broker_id", user.id);

  if (fetchError) {
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }

  if (submissions && submissions.length > 0) {
    // Update each submission's scheduled_deletion_at based on its submitted_at
    const updates = submissions.map((sub: { id: string; submitted_at: string }) => {
      const submittedAt = new Date(sub.submitted_at);
      const deletionDate = new Date(submittedAt);
      deletionDate.setMonth(deletionDate.getMonth() + retentionMonths);

      return admin
        .from("submissions")
        .update({ scheduled_deletion_at: deletionDate.toISOString() })
        .eq("id", sub.id);
    });

    await Promise.all(updates);
  }

  return NextResponse.json({ success: true, retention_months: retentionMonths });
}
