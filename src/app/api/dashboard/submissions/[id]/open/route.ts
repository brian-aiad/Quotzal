import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if already opened (RLS ensures broker owns this submission)
    const { data: submission } = await supabase
      .from("submissions")
      .select("first_opened_at")
      .eq("id", id)
      .single();

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (!submission.first_opened_at) {
      await supabase
        .from("submissions")
        .update({ first_opened_at: new Date().toISOString() })
        .eq("id", id);
    }

    return NextResponse.json({
      first_opened_at: submission.first_opened_at ?? new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
