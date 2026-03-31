import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_BROKERAGE_NAME_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_ADDRESS_LENGTH,
} from "@/lib/constants";

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
    return NextResponse.json(
      { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const body = (await request.json()) as UpdateProfileBody;

  if (!body.brokerage_name?.trim()) {
    return NextResponse.json(
      { success: false, error: "Brokerage name is required", code: "MISSING_FIELDS" },
      { status: 400 }
    );
  }

  if (body.brokerage_name.trim().length > MAX_BROKERAGE_NAME_LENGTH) {
    return NextResponse.json(
      { success: false, error: `Brokerage name must be ${MAX_BROKERAGE_NAME_LENGTH} characters or less`, code: "NAME_TOO_LONG" },
      { status: 400 }
    );
  }

  if (body.phone && body.phone.trim().length > MAX_PHONE_LENGTH) {
    return NextResponse.json(
      { success: false, error: `Phone must be ${MAX_PHONE_LENGTH} characters or less`, code: "PHONE_TOO_LONG" },
      { status: 400 }
    );
  }

  if (body.address && body.address.trim().length > MAX_ADDRESS_LENGTH) {
    return NextResponse.json(
      { success: false, error: `Address must be ${MAX_ADDRESS_LENGTH} characters or less`, code: "ADDRESS_TOO_LONG" },
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
      { success: false, error: "Failed to update profile", code: "UPDATE_FAILED" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
