"use client";

import { useEffect, useState, useRef } from "react";
import { INSURANCE_TYPE_OPTIONS } from "@/lib/constants/insurance-types";
import type { FormConfig, InsuranceType, CustomField } from "@/lib/types/intake-form";
import type { ExtendedFormConfig, FieldToggle, InsuranceStep as ExtStep } from "@/lib/types/form-config";
import { getTypeConfig, FIELDS_BY_TYPE } from "@/lib/types/form-config";

function getExtToggle(extConfig: ExtendedFormConfig | undefined, type: InsuranceType | null, key: string): FieldToggle | null {
  if (!extConfig || !type) return null;
  const tc = getTypeConfig(extConfig, type);
  if (!tc) return null;
  return (tc as unknown as Record<string, FieldToggle>)[key] ?? null;
}

interface FormPreviewProps {
  enabledTypes: InsuranceType[];
  formConfig: FormConfig;
  extendedConfig?: ExtendedFormConfig;
  brokerBranding: {
    name: string;
    logoUrl: string | null;
    brandColor: string | null;
    isPro: boolean;
  };
  activeStep: number;
  onStepChange: (step: number) => void;
  previewInsuranceType: InsuranceType | null;
  onTypeSelect?: (type: InsuranceType) => void;
}

export interface PreviewStep {
  key: string;
  label: string;
}

export function buildPreviewSteps(
  previewType: InsuranceType | null,
  formConfig: FormConfig
): PreviewStep[] {
  const isAuto = previewType === "auto_personal" || previewType === "auto_commercial";
  const steps: PreviewStep[] = [
    { key: "type", label: "Insurance Type" },
    { key: "personal", label: "Personal Info" },
  ];
  if (isAuto) {
    steps.push({ key: "drivers", label: "Drivers" });
    steps.push({ key: "vehicles", label: "Vehicles" });
  } else if (previewType) {
    steps.push({ key: "details", label: "Coverage Details" });
  }
  if (formConfig?.fields?.current_insurance?.enabled) {
    steps.push({ key: "insurance", label: "Current Insurance" });
  }
  steps.push({ key: "review", label: "Review & Submit" });
  return steps;
}

export function FormPreview({
  enabledTypes,
  formConfig,
  extendedConfig,
  brokerBranding,
  activeStep,
  onStepChange,
  previewInsuranceType,
  onTypeSelect,
}: FormPreviewProps) {
  const accent = brokerBranding.brandColor ?? "#059669";
  const steps = buildPreviewSteps(previewInsuranceType, formConfig);
  const clampedStep = Math.min(activeStep, steps.length - 1);
  const currentStepData = steps[clampedStep];

  // Hint visibility — fades after 3 seconds
  const [showHint, setShowHint] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Animation key — triggers re-animation on step/type change
  const [animKey, setAnimKey] = useState(0);
  const prevStepRef = useRef(clampedStep);
  const prevTypeRef = useRef(previewInsuranceType);

  useEffect(() => {
    if (prevStepRef.current !== clampedStep || prevTypeRef.current !== previewInsuranceType) {
      setAnimKey((k) => k + 1);
      prevStepRef.current = clampedStep;
      prevTypeRef.current = previewInsuranceType;
    }
  }, [clampedStep, previewInsuranceType]);

  const filteredOptions = INSURANCE_TYPE_OPTIONS.filter((opt) =>
    enabledTypes.includes(opt.value)
  );

  // Personal info fields based on config
  const personalFields: { key: string; label: string; required: boolean; type?: "text" | "date" | "select" | "toggle" }[] = [
    { key: "first_name", label: "First Name", required: true },
    { key: "last_name", label: "Last Name", required: true },
  ];
  if (formConfig?.fields?.date_of_birth?.enabled) {
    personalFields.push({ key: "dob", label: "Date of Birth", required: formConfig.fields.date_of_birth.required, type: "date" });
  }
  personalFields.push({ key: "email", label: "Email", required: true });
  if (formConfig?.fields?.phone?.enabled) {
    personalFields.push({ key: "phone", label: "Phone Number", required: formConfig.fields.phone.required });
  }
  // Extended personal info fields
  if (extendedConfig && previewInsuranceType) {
    const extFieldDefs = FIELDS_BY_TYPE[previewInsuranceType] ?? [];
    const personalExtFields = extFieldDefs.filter(
      (f) => f.step === "personal_info" && !["dateOfBirth", "phone"].includes(f.key)
    );
    for (const fd of personalExtFields) {
      const toggle = getExtToggle(extendedConfig, previewInsuranceType, fd.key);
      if (toggle?.show) {
        personalFields.push({ key: fd.key, label: fd.label, required: toggle.required });
      }
    }
  }

  // Extended fields by step (for drivers, vehicles, current insurance)
  function getExtFieldsForStep(step: ExtStep): { key: string; label: string; required: boolean }[] {
    if (!extendedConfig || !previewInsuranceType) return [];
    const extFieldDefs = FIELDS_BY_TYPE[previewInsuranceType] ?? [];
    const stepFields = extFieldDefs.filter((f) => f.step === step);
    const result: { key: string; label: string; required: boolean }[] = [];
    for (const fd of stepFields) {
      const toggle = getExtToggle(extendedConfig, previewInsuranceType, fd.key);
      if (toggle?.show) {
        result.push({ key: fd.key, label: fd.label, required: toggle.required });
      }
    }
    return result;
  }

  const visibleCustomFields = (formConfig?.custom_fields ?? []).filter(
    (cf) => cf.applies_to === "all" ||
      (Array.isArray(cf.applies_to) && previewInsuranceType && cf.applies_to.includes(previewInsuranceType))
  );

  // Get label + icon for current type
  const currentTypeOption = previewInsuranceType
    ? INSURANCE_TYPE_OPTIONS.find((o) => o.value === previewInsuranceType)
    : null;

  function handleTypeCardClick(type: InsuranceType) {
    onTypeSelect?.(type);
    onStepChange(1);
  }

  return (
    <div className="sticky top-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Interactive Preview</span>
          {currentTypeOption && (
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
              {currentTypeOption.icon} {currentTypeOption.label}
            </span>
          )}
        </div>
        {/* Step dots */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => onStepChange(i)}
                className={`rounded-full transition-all duration-300 cursor-pointer hover:scale-125 ${
                  i === clampedStep ? "w-3 h-3 scale-125 ring-2 ring-offset-1" : "w-2.5 h-2.5"
                }`}
                style={{
                  backgroundColor: i <= clampedStep ? accent : "#cbd5e1",
                  ...(i === clampedStep ? { ringColor: accent } : {}),
                }}
                aria-label={`Go to step ${i + 1}: ${s.label}`}
                title={s.label}
              />
            ))}
          </div>
          <span
            className={`text-[10px] text-gray-400 transition-opacity duration-700 ${
              showHint ? "opacity-100" : "opacity-0"
            }`}
          >
            &larr; Click to navigate steps
          </span>
        </div>
      </div>

      {/* Phone frame */}
      <div className="mx-auto w-full max-w-[390px]">
        <div className="bg-slate-900 rounded-[2.5rem] p-2.5 shadow-2xl">
          <div className="flex justify-center mb-1">
            <div className="w-20 h-4 bg-black rounded-full" />
          </div>

          <div className="bg-slate-50 rounded-[2rem] overflow-hidden flex flex-col" style={{ height: 600 }}>
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
              {brokerBranding.isPro && brokerBranding.logoUrl ? (
                <img src={brokerBranding.logoUrl} alt="" className="h-5 w-auto object-contain" />
              ) : (
                <span className="text-xs font-bold text-slate-900">{brokerBranding.name}</span>
              )}
              {!brokerBranding.isPro && (
                <span className="text-[9px] text-slate-400">Powered by Quotzal</span>
              )}
            </div>

            {/* Active type indicator banner */}
            {currentTypeOption && currentStepData?.key !== "type" && (
              <div
                className="px-4 py-1.5 flex items-center gap-1.5 border-b border-slate-100 shrink-0"
                style={{ backgroundColor: `${accent}08` }}
              >
                <span className="text-xs">{currentTypeOption.icon}</span>
                <span className="text-[10px] font-semibold" style={{ color: accent }}>
                  {currentTypeOption.label}
                </span>
                <span className="text-[9px] text-slate-400 ml-auto">
                  {currentStepData?.label}
                </span>
              </div>
            )}

            {/* Progress bar — animated */}
            <div className="px-4 pt-2.5 pb-1 shrink-0">
              <div className="flex gap-1">
                {steps.map((s, i) => (
                  <div
                    key={s.key}
                    className="h-1.5 flex-1 rounded-full transition-all duration-500 ease-out"
                    style={{ backgroundColor: i <= clampedStep ? accent : "#e2e8f0" }}
                  />
                ))}
              </div>
            </div>

            {/* Content — animated on step/type change */}
            <div className="flex-1 px-4 py-3 overflow-y-auto">
              <div key={animKey} className="preview-step-enter">
                {/* Step: Insurance Type — INTERACTIVE */}
                {currentStepData?.key === "type" && (
                  <div>
                    <p className="text-xs font-semibold text-slate-900 mb-0.5">What type of insurance do you need?</p>
                    <p className="text-[10px] text-slate-500 mb-2.5">Select one to get started.</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {filteredOptions.map((opt) => {
                        const isActive = previewInsuranceType === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleTypeCardClick(opt.value)}
                            className={`relative flex flex-col items-center gap-0.5 p-2.5 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer group ${
                              isActive
                                ? "shadow-sm"
                                : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 animate-pulse-ring"
                            }`}
                            style={isActive ? { borderColor: accent, backgroundColor: `${accent}08` } : undefined}
                            title="Select"
                          >
                            <span className="text-base">{opt.icon}</span>
                            <span className="text-[10px] font-medium text-slate-700 leading-tight">{opt.label}</span>
                            {isActive && (
                              <svg className="w-3 h-3 mt-0.5" style={{ color: accent }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step: Personal Info */}
                {currentStepData?.key === "personal" && (
                  <div>
                    <p className="text-xs font-semibold text-slate-900 mb-0.5">Personal Information</p>
                    <p className="text-[10px] text-slate-500 mb-2.5">Tell us about yourself.</p>
                    <div className="space-y-2">
                      {personalFields.map((f) => (
                        <PField key={f.key} label={f.label} required={f.required} type={f.type ?? (f.key === "dob" ? "date" : "text")} />
                      ))}
                      {visibleCustomFields.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 mt-2">
                          <p className="text-[10px] font-medium text-slate-500 mb-1.5">Additional Information</p>
                          {visibleCustomFields.map((cf) => (
                            <PCustomField key={cf.id} field={cf} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step: Drivers */}
                {currentStepData?.key === "drivers" && (() => {
                  const driverExtFields = getExtFieldsForStep("drivers");
                  return (
                    <div>
                      <p className="text-xs font-semibold text-slate-900 mb-0.5">Driver Information</p>
                      <p className="text-[10px] text-slate-500 mb-2.5">Details for each driver on the policy.</p>
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-bold text-white">1</span>
                          </div>
                          <p className="text-[10px] font-semibold text-slate-700">Driver 1</p>
                        </div>
                        <PField label="Full Name" required />
                        <PField label="Date of Birth" required type="date" />
                        {driverExtFields.map((f) => (
                          <PField key={f.key} label={f.label} required={f.required} />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Step: Vehicles */}
                {currentStepData?.key === "vehicles" && (() => {
                  const vehicleExtFields = getExtFieldsForStep("vehicles");
                  return (
                    <div>
                      <p className="text-xs font-semibold text-slate-900 mb-0.5">Vehicle Information</p>
                      <p className="text-[10px] text-slate-500 mb-2.5">Add your vehicles.</p>
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-bold text-white">1</span>
                          </div>
                          <p className="text-[10px] font-semibold text-slate-700">Vehicle 1</p>
                        </div>
                        <PField label="Year" required />
                        <PField label="Make" required />
                        <PField label="Model" required />
                        {vehicleExtFields.map((f) => (
                          <PField key={f.key} label={f.label} required={f.required} />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Step: Coverage Details (non-auto) */}
                {currentStepData?.key === "details" && (
                  <div>
                    <p className="text-xs font-semibold text-slate-900 mb-0.5">Coverage Details</p>
                    <p className="text-[10px] text-slate-500 mb-2.5">Tell us what you need covered.</p>
                    <div className="space-y-2">
                      <PField label="Property / Asset Details" required />
                      <PField label="Coverage Amount" required type="select" />
                    </div>
                  </div>
                )}

                {/* Step: Current Insurance */}
                {currentStepData?.key === "insurance" && (() => {
                  const insExtFields = getExtFieldsForStep("current_insurance");
                  return (
                    <div>
                      <p className="text-xs font-semibold text-slate-900 mb-0.5">Current Insurance</p>
                      <p className="text-[10px] text-slate-500 mb-2.5">Do you currently have insurance?</p>
                      <div className="space-y-2">
                        <PField label="Currently insured?" required type="toggle" />
                        {insExtFields.map((f) => (
                          <PField key={f.key} label={f.label} required={f.required} />
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Step: Review */}
                {currentStepData?.key === "review" && (
                  <div>
                    <p className="text-xs font-semibold text-slate-900 mb-0.5">Review & Submit</p>
                    <p className="text-[10px] text-slate-500 mb-2.5">Verify your information.</p>
                    <div className="space-y-1.5">
                      {steps.slice(0, -1).map((s) => (
                        <div key={s.key} className="bg-white border border-slate-200 rounded-lg px-2.5 py-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-700">{s.label}</span>
                            <span className="text-[9px] font-medium" style={{ color: accent }}>Edit</span>
                          </div>
                          <div className="mt-1 space-y-0.5">
                            <div className="h-1.5 bg-slate-100 rounded w-3/4" />
                            <div className="h-1.5 bg-slate-100 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled
                      className="mt-3 w-full py-2 rounded-lg text-white text-xs font-semibold"
                      style={{ backgroundColor: accent }}
                    >
                      Submit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky footer nav — prominent buttons */}
            <div className="px-4 py-2.5 flex items-center justify-between border-t border-slate-100 bg-white shrink-0">
              <button
                type="button"
                onClick={() => onStepChange(Math.max(0, clampedStep - 1))}
                disabled={clampedStep === 0}
                className="bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={() => onStepChange(Math.min(steps.length - 1, clampedStep + 1))}
                disabled={clampedStep === steps.length - 1}
                className="bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-700 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PField({
  label,
  required = false,
  type = "text",
}: {
  label: string;
  required?: boolean;
  type?: "text" | "date" | "select" | "toggle";
}) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-0.5 mb-0.5">
        <span className="text-[10px] font-medium text-slate-600">{label}</span>
        {required && <span className="text-red-400 text-[9px]">*</span>}
      </div>
      {type === "toggle" ? (
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-3.5 bg-slate-200 rounded-full relative">
            <div className="w-2.5 h-2.5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm" />
          </div>
          <span className="text-[9px] text-slate-500">No</span>
        </div>
      ) : type === "select" ? (
        <div className="w-full h-6 bg-white border border-slate-200 rounded flex items-center px-1.5">
          <span className="text-[9px] text-slate-400">Select...</span>
          <svg className="w-2.5 h-2.5 text-slate-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      ) : (
        <div className="w-full h-6 bg-white border border-slate-200 rounded" />
      )}
    </div>
  );
}

function PCustomField({ field }: { field: CustomField }) {
  const typeMap: Record<string, "text" | "select" | "toggle"> = {
    text: "text",
    textarea: "text",
    select: "select",
    yes_no: "toggle",
  };
  return <PField label={field.label} required={field.required} type={typeMap[field.type] ?? "text"} />;
}
