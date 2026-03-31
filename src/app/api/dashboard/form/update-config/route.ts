import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FormConfig, ConfigurableFieldKey } from "@/lib/types/intake-form";
import { MAX_CUSTOM_FIELDS } from "@/lib/constants";

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

const MAX_CUSTOM_FIELD_LABEL_LENGTH = 200;
const MAX_CUSTOM_FIELD_OPTION_LENGTH = 200;
const MAX_SELECT_OPTIONS = 50;

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const formConfig = body.form_config as FormConfig;

    if (!formConfig || !formConfig.fields) {
      return NextResponse.json(
        { success: false, error: "Invalid form_config", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Validate field keys
    for (const key of Object.keys(formConfig.fields)) {
      if (!VALID_FIELD_KEYS.includes(key as ConfigurableFieldKey)) {
        return NextResponse.json(
          { success: false, error: `Invalid field key: ${key}`, code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }
      const field = formConfig.fields[key as ConfigurableFieldKey];
      if (typeof field.enabled !== "boolean" || typeof field.required !== "boolean") {
        return NextResponse.json(
          { success: false, error: `Invalid field config for ${key}`, code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }
    }

    // Validate custom_fields
    const customFields = formConfig.custom_fields ?? [];
    if (customFields.length > MAX_CUSTOM_FIELDS) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_CUSTOM_FIELDS} custom fields allowed`, code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    for (const cf of customFields) {
      if (!cf.id || typeof cf.id !== "string") {
        return NextResponse.json(
          { success: false, error: "Custom field missing id", code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }
      if (
        !cf.label ||
        typeof cf.label !== "string" ||
        cf.label.trim().length === 0 ||
        cf.label.length > MAX_CUSTOM_FIELD_LABEL_LENGTH
      ) {
        return NextResponse.json(
          { success: false, error: `Custom field label must be 1-${MAX_CUSTOM_FIELD_LABEL_LENGTH} characters`, code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }
      if (!VALID_CUSTOM_TYPES.includes(cf.type)) {
        return NextResponse.json(
          { success: false, error: `Invalid custom field type: ${cf.type}`, code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }
      if (cf.type === "select") {
        if (!Array.isArray(cf.options) || cf.options.filter((o: string) => o.trim()).length === 0) {
          return NextResponse.json(
            { success: false, error: `Dropdown field "${cf.label}" must have at least 1 option`, code: "VALIDATION_ERROR" },
            { status: 400 }
          );
        }
        if (cf.options.length > MAX_SELECT_OPTIONS) {
          return NextResponse.json(
            { success: false, error: `Dropdown field "${cf.label}" exceeds maximum of ${MAX_SELECT_OPTIONS} options`, code: "VALIDATION_ERROR" },
            { status: 400 }
          );
        }
        for (const option of cf.options as string[]) {
          if (typeof option === "string" && option.length > MAX_CUSTOM_FIELD_OPTION_LENGTH) {
            return NextResponse.json(
              { success: false, error: `Dropdown option must be ${MAX_CUSTOM_FIELD_OPTION_LENGTH} characters or less`, code: "VALIDATION_ERROR" },
              { status: 400 }
            );
          }
        }
      }
      if (typeof cf.required !== "boolean") {
        return NextResponse.json(
          { success: false, error: "Custom field required must be boolean", code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }
      if (cf.applies_to !== "all" && !Array.isArray(cf.applies_to)) {
        return NextResponse.json(
          { success: false, error: "Custom field applies_to must be 'all' or array", code: "VALIDATION_ERROR" },
          { status: 400 }
        );
      }
      if (Array.isArray(cf.applies_to)) {
        for (const t of cf.applies_to) {
          if (!VALID_INSURANCE_TYPES.includes(t)) {
            return NextResponse.json(
              { success: false, error: `Invalid insurance type in applies_to: ${t}`, code: "VALIDATION_ERROR" },
              { status: 400 }
            );
          }
        }
      }
    }

    const { error } = await supabase
      .from("brokers")
      .update({ form_config: formConfig })
      .eq("id", user.id);

    if (error) {
      console.error("update-config error:", error);
      return NextResponse.json(
        { success: false, error: "An internal error occurred", code: "UPDATE_FAILED" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
