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
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Check if already opened (RLS ensures broker owns this submission)
    const { data: submission } = await supabase
      .from("submissions")
      .select("first_opened_at")
      .eq("id", id)
      .single();

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (!submission.first_opened_at) {
      await supabase
        .from("submissions")
        .update({ first_opened_at: new Date().toISOString() })
        .eq("id", id);
    }

    return NextResponse.json({
      success: true,
      data: {
        first_opened_at: submission.first_opened_at ?? new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
