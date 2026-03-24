import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FormConfig } from "@/lib/types/intake-form";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const formConfig = body.form_config as FormConfig;

    if (!formConfig || !formConfig.fields) {
      return NextResponse.json({ error: "Invalid form_config" }, { status: 400 });
    }

    // Validate custom_fields limit
    if (formConfig.custom_fields && formConfig.custom_fields.length > 10) {
      return NextResponse.json({ error: "Maximum 10 custom fields allowed" }, { status: 400 });
    }

    const { error } = await supabase
      .from("brokers")
      .update({ form_config: formConfig })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
