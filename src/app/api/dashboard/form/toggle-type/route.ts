import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const { insuranceTypes } = await request.json();
  if (!Array.isArray(insuranceTypes) || insuranceTypes.length === 0) {
    return NextResponse.json(
      { success: false, error: "At least one type required", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("brokers")
    .update({ insurance_types_enabled: insuranceTypes })
    .eq("id", user.id);

  if (error) {
    console.error("dashboard/form/toggle-type PUT error:", error);
    return NextResponse.json(
      { success: false, error: "An internal error occurred", code: "UPDATE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
