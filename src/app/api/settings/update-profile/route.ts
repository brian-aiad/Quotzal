import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface UpdateProfileBody {
  brokerage_name: string;
  phone: string;
  address: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as UpdateProfileBody;

  if (!body.brokerage_name?.trim()) {
    return NextResponse.json(
      { error: "Brokerage name is required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("brokers")
    .update({
      brokerage_name: body.brokerage_name.trim(),
      phone: body.phone?.trim() || null,
      address: body.address?.trim() || null,
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
