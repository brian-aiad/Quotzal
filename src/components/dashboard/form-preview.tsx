"use client";

import { useState } from "react";
import { INSURANCE_TYPE_OPTIONS } from "@/lib/constants/insurance-types";
import type { FormConfig, InsuranceType, CustomField } from "@/lib/types/intake-form";

interface FormPreviewProps {
  enabledTypes: InsuranceType[];
  formConfig: FormConfig;
  brokerBranding: {
    name: string;
    logoUrl: string | null;
    brandColor: string | null;
    isPro: boolean;
  };
}

const CONFIGURABLE_FIELD_LABELS: Record<string, string> = {
  date_of_birth: "Date of Birth",
  phone: "Phone Number",
  vin: "VIN",
  driver_license_number: "Driver License Number",
  marital_status: "Marital Status",
  sr22: "SR-22 Required",
  violations: "Violations / Incidents",
};

const AUTO_ONLY_FIELDS = ["vin", "driver_license_number", "marital_status", "sr22", "violations"];

export function FormPreview({ enabledTypes, formConfig, brokerBranding }: FormPreviewProps) {
  const [step, setStep] = useState(0);
  const accent = brokerBranding.brandColor ?? "#059669";

  const hasAutoType = enabledTypes.some((t) => t === "auto_personal" || t === "auto_commercial");
  const showCurrentInsurance = formConfig.fields.current_insurance.enabled;

  // Build step list dynamically
  const steps: { key: string; label: string }[] = [
    { key: "type", label: "Insurance Type" },
    { key: "personal", label: "Personal Info" },
  ];
  if (hasAutoType) {
    steps.push({ key: "drivers", label: "Drivers" });
    steps.push({ key: "vehicles", label: "Vehicles" });
  } else {
    steps.push({ key: "details", label: "Type Details" });
  }
  if (showCurrentInsurance) {
    steps.push({ key: "insurance", label: "Current Insurance" });
  }
  steps.push({ key: "review", label: "Review & Submit" });

  const currentStepData = steps[step] ?? steps[0];

  function nextStep() {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // Filtered types for step 1
  const filteredOptions = INSURANCE_TYPE_OPTIONS.filter((opt) =>
    enabledTypes.includes(opt.value)
  );

  // Visible personal info fields based on formConfig
  const personalFields: { key: string; label: string; required: boolean }[] = [
    { key: "first_name", label: "First Name", required: true },
    { key: "last_name", label: "Last Name", required: true },
  ];
  if (formConfig.fields.date_of_birth.enabled) {
    personalFields.push({ key: "dob", label: "Date of Birth", required: formConfig.fields.date_of_birth.required });
  }
  if (formConfig.fields.phone.enabled) {
    personalFields.push({ key: "phone", label: "Phone Number", required: formConfig.fields.phone.required });
  }
  personalFields.push({ key: "email", label: "Email", required: true });

  // Custom fields that apply to "all"
  const visibleCustomFields = formConfig.custom_fields.filter(
    (cf) => cf.applies_to === "all" || (Array.isArray(cf.applies_to) && cf.applies_to.length > 0)
  );

  return (
    <div className="sticky top-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
          Customer Preview
        </span>
        <span className="text-xs text-slate-500">
          Step {step + 1} of {steps.length}
        </span>
      </div>

      {/* Phone frame */}
      <div className="mx-auto w-full max-w-[400px]">
        <div className="bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl">
          {/* Notch */}
          <div className="flex justify-center mb-1">
            <div className="w-24 h-5 bg-black rounded-full" />
          </div>

          {/* Screen */}
          <div className="bg-slate-50 rounded-[2rem] overflow-hidden" style={{ height: 580 }}>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              {brokerBranding.isPro && brokerBranding.logoUrl ? (
                <img src={brokerBranding.logoUrl} alt="" className="h-6 w-auto object-contain" />
              ) : (
                <span className="text-sm font-bold text-slate-900">{brokerBranding.name}</span>
              )}
              {!brokerBranding.isPro && (
                <span className="text-[10px] text-slate-400">Powered by Quotzal</span>
              )}
            </div>

            {/* Progress bar */}
            <div className="px-4 pt-3">
              <div className="flex gap-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full"
                    style={{
                      backgroundColor: i <= step ? accent : "#e2e8f0",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-4 overflow-y-auto" style={{ height: 460 }}>
              {/* Step: Insurance Type */}
              {currentStepData.key === "type" && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">What type of insurance do you need?</p>
                  <p className="text-xs text-slate-500 mb-3">Select one to get started.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredOptions.map((opt, i) => (
                      <div
                        key={opt.value}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-center ${
                          i === 0 ? "border-2 shadow-sm" : "border-slate-200 bg-white"
                        }`}
                        style={i === 0 ? { borderColor: accent, backgroundColor: `${accent}08` } : undefined}
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="text-[11px] font-medium text-slate-700">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Personal Info */}
              {currentStepData.key === "personal" && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Personal Information</p>
                  <p className="text-xs text-slate-500 mb-3">Tell us about yourself.</p>
                  <div className="space-y-2.5">
                    {personalFields.map((f) => (
                      <PreviewField key={f.key} label={f.label} required={f.required} type={f.key === "dob" ? "date" : "text"} />
                    ))}
                    {visibleCustomFields.map((cf) => (
                      <PreviewCustomField key={cf.id} field={cf} />
                    ))}
                  </div>
                </div>
              )}

              {/* Step: Drivers */}
              {currentStepData.key === "drivers" && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Driver Information</p>
                  <p className="text-xs text-slate-500 mb-3">Details for each driver.</p>
                  <div className="space-y-2.5">
                    <PreviewField label="Full Name" required />
                    <PreviewField label="Date of Birth" required type="date" />
                    {formConfig.fields.driver_license_number.enabled && (
                      <PreviewField label="License Number" required={formConfig.fields.driver_license_number.required} />
                    )}
                    {formConfig.fields.marital_status.enabled && (
                      <PreviewField label="Marital Status" required={formConfig.fields.marital_status.required} type="select" />
                    )}
                    {formConfig.fields.sr22.enabled && (
                      <PreviewField label="SR-22 Required?" required={formConfig.fields.sr22.required} type="toggle" />
                    )}
                    {formConfig.fields.violations.enabled && (
                      <PreviewField label="Violations / Incidents" required={formConfig.fields.violations.required} type="toggle" />
                    )}
                  </div>
                </div>
              )}

              {/* Step: Vehicles */}
              {currentStepData.key === "vehicles" && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Vehicle Information</p>
                  <p className="text-xs text-slate-500 mb-3">Add your vehicles.</p>
                  <div className="space-y-2.5">
                    {formConfig.fields.vin.enabled && (
                      <PreviewField label="VIN" required={formConfig.fields.vin.required} />
                    )}
                    <PreviewField label="Year" required />
                    <PreviewField label="Make" required />
                    <PreviewField label="Model" required />
                    <PreviewField label="Coverage Type" required type="select" />
                  </div>
                </div>
              )}

              {/* Step: Type Details (non-auto) */}
              {currentStepData.key === "details" && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Coverage Details</p>
                  <p className="text-xs text-slate-500 mb-3">Tell us what you need covered.</p>
                  <div className="space-y-2.5">
                    <PreviewField label="Property / Asset Details" required />
                    <PreviewField label="Coverage Amount" required type="select" />
                  </div>
                </div>
              )}

              {/* Step: Current Insurance */}
              {currentStepData.key === "insurance" && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Current Insurance</p>
                  <p className="text-xs text-slate-500 mb-3">Do you currently have insurance?</p>
                  <div className="space-y-2.5">
                    <PreviewField label="Currently insured?" required type="toggle" />
                    <PreviewField label="Current Carrier" required={false} />
                    <PreviewField label="Coverage Limits" required={false} />
                    <PreviewField label="Policy Expiry" required={false} type="date" />
                  </div>
                </div>
              )}

              {/* Step: Review */}
              {currentStepData.key === "review" && (
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">Review & Submit</p>
                  <p className="text-xs text-slate-500 mb-3">Verify your information before submitting.</p>
                  <div className="space-y-3">
                    {steps.slice(0, -1).map((s) => (
                      <div key={s.key} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">{s.label}</span>
                          <span className="text-[10px] text-emerald-600 font-medium">Edit</span>
                        </div>
                        <div className="mt-1 h-2 bg-slate-100 rounded w-3/4" />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled
                    className="mt-4 w-full py-2.5 rounded-lg text-white text-sm font-semibold"
                    style={{ backgroundColor: accent }}
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>

            {/* Nav buttons */}
            <div className="px-4 pb-3 flex items-center justify-between border-t border-slate-100 bg-white pt-2">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className="text-xs font-medium text-slate-500 disabled:opacity-30"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={step === steps.length - 1}
                className="text-xs font-medium text-white px-4 py-1.5 rounded-lg disabled:opacity-30"
                style={{ backgroundColor: accent }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewField({
  label,
  required = false,
  type = "text",
}: {
  label: string;
  required?: boolean;
  type?: "text" | "date" | "select" | "toggle";
}) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        <span className="text-[11px] font-medium text-slate-700">{label}</span>
        {required && <span className="text-red-400 text-[10px]">*</span>}
      </div>
      {type === "toggle" ? (
        <div className="flex items-center gap-2">
          <div className="w-7 h-4 bg-slate-200 rounded-full relative">
            <div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm" />
          </div>
          <span className="text-[10px] text-slate-500">No</span>
        </div>
      ) : type === "select" ? (
        <div className="w-full h-8 bg-white border border-slate-200 rounded-md flex items-center px-2">
          <span className="text-[10px] text-slate-400">Select...</span>
          <svg className="w-3 h-3 text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      ) : (
        <div className="w-full h-8 bg-white border border-slate-200 rounded-md" />
      )}
    </div>
  );
}

function PreviewCustomField({ field }: { field: CustomField }) {
  const typeMap: Record<string, "text" | "select" | "toggle"> = {
    text: "text",
    textarea: "text",
    select: "select",
    yes_no: "toggle",
  };
  return <PreviewField label={field.label} required={field.required} type={typeMap[field.type] ?? "text"} />;
}
