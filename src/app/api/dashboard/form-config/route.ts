import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { ExtendedFormConfig } from "@/lib/types/form-config";

const VALID_INSURANCE_TYPES = [
  "auto_personal", "auto_commercial", "home", "life",
  "motorcycle", "boat", "rv", "other",
];

const VALID_CUSTOM_FIELD_TYPES = ["text", "number", "select", "checkbox", "textarea"];

const VALID_STEPS = [
  "personal_info", "drivers", "vehicles", "property",
  "coverage", "current_insurance", "review",
];

function isFieldToggle(val: unknown): val is { show: boolean; required: boolean } {
  if (!val || typeof val !== "object") return false;
  const obj = val as Record<string, unknown>;
  return typeof obj.show === "boolean" && typeof obj.required === "boolean";
}

function validateTypeConfig(config: unknown, label: string): string | null {
  if (!config || typeof config !== "object") return `${label} must be an object`;
  const obj = config as Record<string, unknown>;
  for (const [key, val] of Object.entries(obj)) {
    if (!isFieldToggle(val)) {
      return `${label}.${key} must have show (boolean) and required (boolean)`;
    }
  }
  return null;
}

export async function PATCH(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const { allowed } = checkRateLimit(ip, "form-config-patch", {
      maxRequests: 30,
      windowMs: 60 * 1000,
    });
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const formConfig = body.formConfig as ExtendedFormConfig;

    if (!formConfig || typeof formConfig !== "object") {
      return NextResponse.json({ error: "formConfig is required" }, { status: 400 });
    }

    // Validate enabledTypes
    if (!Array.isArray(formConfig.enabledTypes) || formConfig.enabledTypes.length === 0) {
      return NextResponse.json({ error: "At least one insurance type must be enabled" }, { status: 400 });
    }
    for (const t of formConfig.enabledTypes) {
      if (!VALID_INSURANCE_TYPES.includes(t)) {
        return NextResponse.json({ error: `Invalid insurance type: ${t}` }, { status: 400 });
      }
    }

    // Validate per-type configs
    const typeConfigs: [string, unknown][] = [
      ["autoPersonal", formConfig.autoPersonal],
      ["autoCommercial", formConfig.autoCommercial],
      ["homeRenters", formConfig.homeRenters],
      ["life", formConfig.life],
      ["motorcycle", formConfig.motorcycle],
      ["boat", formConfig.boat],
      ["rv", formConfig.rv],
    ];

    for (const [label, config] of typeConfigs) {
      if (config) {
        const err = validateTypeConfig(config, label);
        if (err) return NextResponse.json({ error: err }, { status: 400 });
      }
    }

    // Validate customFields
    const customFields = formConfig.customFields ?? [];
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
      if (!VALID_CUSTOM_FIELD_TYPES.includes(cf.type)) {
        return NextResponse.json({ error: `Invalid custom field type: ${cf.type}` }, { status: 400 });
      }
      if (cf.type === "select" && (!Array.isArray(cf.options) || cf.options.filter((o: string) => o.trim()).length === 0)) {
        return NextResponse.json({ error: `Dropdown field "${cf.label}" must have at least 1 option` }, { status: 400 });
      }
      if (typeof cf.required !== "boolean") {
        return NextResponse.json({ error: "Custom field required must be boolean" }, { status: 400 });
      }
      if (!VALID_STEPS.includes(cf.step)) {
        return NextResponse.json({ error: `Invalid step: ${cf.step}` }, { status: 400 });
      }
      if (cf.insuranceType !== "all" && !VALID_INSURANCE_TYPES.includes(cf.insuranceType)) {
        return NextResponse.json({ error: `Invalid insuranceType: ${cf.insuranceType}` }, { status: 400 });
      }
    }

    // Save the entire extended form config
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
