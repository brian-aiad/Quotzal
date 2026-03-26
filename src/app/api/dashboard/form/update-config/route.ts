import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FormConfig, ConfigurableFieldKey } from "@/lib/types/intake-form";

const VALID_FIELD_KEYS: ConfigurableFieldKey[] = [
  "date_of_birth", "phone", "current_insurance", "vin",
  "driver_license_number", "marital_status", "sr22", "violations",
  "trim_package", "coverage_type", "coverage_limits", "policy_expiry",
];

const VALID_CUSTOM_TYPES = ["text", "textarea", "select", "yes_no"];

const VALID_INSURANCE_TYPES = [
  "auto_personal", "auto_commercial", "home", "life",
  "motorcycle", "boat", "rv", "other",
];

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

    // Validate field keys
    for (const key of Object.keys(formConfig.fields)) {
      if (!VALID_FIELD_KEYS.includes(key as ConfigurableFieldKey)) {
        return NextResponse.json({ error: `Invalid field key: ${key}` }, { status: 400 });
      }
      const field = formConfig.fields[key as ConfigurableFieldKey];
      if (typeof field.enabled !== "boolean" || typeof field.required !== "boolean") {
        return NextResponse.json({ error: `Invalid field config for ${key}` }, { status: 400 });
      }
    }

    // Validate custom_fields
    const customFields = formConfig.custom_fields ?? [];
    if (customFields.length > 10) {
      return NextResponse.json({ error: "Maximum 10 custom fields allowed" }, { status: 400 });
    }

    for (const cf of customFields) {
      if (!cf.id || typeof cf.id !== "string") {
        return NextResponse.json({ error: "Custom field missing id" }, { status: 400 });
      }
      if (!cf.label || typeof cf.label !== "string" || cf.label.trim().length === 0 || cf.label.length > 200) {
        return NextResponse.json({ error: "Custom field label must be 1-200 characters" }, { status: 400 });
      }
      if (!VALID_CUSTOM_TYPES.includes(cf.type)) {
        return NextResponse.json({ error: `Invalid custom field type: ${cf.type}` }, { status: 400 });
      }
      if (cf.type === "select" && (!Array.isArray(cf.options) || cf.options.filter((o: string) => o.trim()).length === 0)) {
        return NextResponse.json({ error: `Dropdown field "${cf.label}" must have at least 1 option` }, { status: 400 });
      }
      if (typeof cf.required !== "boolean") {
        return NextResponse.json({ error: "Custom field required must be boolean" }, { status: 400 });
      }
      if (cf.applies_to !== "all" && !Array.isArray(cf.applies_to)) {
        return NextResponse.json({ error: "Custom field applies_to must be 'all' or array" }, { status: 400 });
      }
      if (Array.isArray(cf.applies_to)) {
        for (const t of cf.applies_to) {
          if (!VALID_INSURANCE_TYPES.includes(t)) {
            return NextResponse.json({ error: `Invalid insurance type in applies_to: ${t}` }, { status: 400 });
          }
        }
      }
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
