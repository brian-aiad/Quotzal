"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { FormPreview, buildPreviewSteps } from "@/components/dashboard/form-preview";
import { INSURANCE_TYPE_OPTIONS } from "@/lib/constants/insurance-types";
import type { FormConfig, InsuranceType, CustomField, CustomFieldType, ConfigurableFieldKey } from "@/lib/types/intake-form";
import { DEFAULT_FORM_CONFIG, mergeFormConfig } from "@/lib/types/intake-form";

interface BrokerLink {
  id: string;
  slug: string;
  label: string;
  is_primary: boolean;
  is_active: boolean;
}

interface BrokerFormData {
  slug: string;
  plan: string;
  insurance_types_enabled: string[];
  form_config: FormConfig | null;
  logo_url: string | null;
  brand_color: string | null;
  links: BrokerLink[];
}

const BUILT_IN_FIELDS: { key: ConfigurableFieldKey; label: string; description: string; step: string }[] = [
  { key: "date_of_birth", label: "Date of Birth", description: "Helps verify age and eligibility", step: "personal" },
  { key: "phone", label: "Phone Number", description: "For broker follow-up calls", step: "personal" },
  { key: "driver_license_number", label: "Driver License Number", description: "Needed for accurate policy quoting", step: "drivers" },
  { key: "marital_status", label: "Marital Status", description: "May affect premium rates", step: "drivers" },
  { key: "sr22", label: "SR-22 Field", description: "High-risk filing requirement", step: "drivers" },
  { key: "violations", label: "Violations Section", description: "Traffic violations in last 5 years", step: "drivers" },
  { key: "vin", label: "VIN", description: "Auto-fills year, make, model", step: "vehicles" },
  { key: "trim_package", label: "Trim / Package", description: "Vehicle trim level detail", step: "vehicles" },
  { key: "coverage_type", label: "Coverage Type", description: "Full coverage vs. liability only", step: "vehicles" },
  { key: "current_insurance", label: "Include This Step", description: "Toggle entire Current Insurance step", step: "insurance" },
  { key: "coverage_limits", label: "Coverage Limits", description: "Current policy coverage amounts", step: "insurance" },
  { key: "policy_expiry", label: "Policy Expiry Date", description: "When current policy ends", step: "insurance" },
];

const CUSTOM_FIELD_TYPE_OPTIONS: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown" },
  { value: "yes_no", label: "Yes / No" },
];

export default function MyFormPage() {
  const [data, setData] = useState<BrokerFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Shared state
  const [enabledTypes, setEnabledTypes] = useState<InsuranceType[]>([]);
  const [formConfig, setFormConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);
  const [previewStep, setPreviewStep] = useState(0);
  const [previewType, setPreviewType] = useState<InsuranceType | null>(null);

  // Alias state
  const [aliasSlug, setAliasSlug] = useState("");
  const [aliasLabel, setAliasLabel] = useState("");
  const [aliasError, setAliasError] = useState("");
  const [showAliasModal, setShowAliasModal] = useState(false);
  const [creatingAlias, setCreatingAlias] = useState(false);

  // Custom field builder
  const [showCfForm, setShowCfForm] = useState(false);
  const [editingCfId, setEditingCfId] = useState<string | null>(null);
  const [cfLabel, setCfLabel] = useState("");
  const [cfType, setCfType] = useState<CustomFieldType>("text");
  const [cfOptions, setCfOptions] = useState<string[]>([""]);
  const [cfRequired, setCfRequired] = useState(false);
  const [cfAppliesTo, setCfAppliesTo] = useState<"all" | InsuranceType[]>("all");

  const [togglingType, setTogglingType] = useState<string | null>(null);

  // Save state with debounce
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestConfigRef = useRef<FormConfig>(formConfig);

  // Mobile preview
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/dashboard/form");
    if (res.ok) {
      const json: BrokerFormData = await res.json();
      setData(json);
      setEnabledTypes(json.insurance_types_enabled as InsuranceType[]);
      const merged = mergeFormConfig(json.form_config);
      setFormConfig(merged);
      latestConfigRef.current = merged;
      if (!previewType && json.insurance_types_enabled.length > 0) {
        setPreviewType(json.insurance_types_enabled[0] as InsuranceType);
      }
    }
    setLoading(false);
  }, [previewType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Preview steps depend on previewType and formConfig
  const previewSteps = buildPreviewSteps(previewType, formConfig);
  const currentPreviewStepData = previewSteps[Math.min(previewStep, previewSteps.length - 1)];

  // Clamp preview step when steps change
  useEffect(() => {
    if (previewStep >= previewSteps.length) {
      setPreviewStep(previewSteps.length - 1);
    }
  }, [previewSteps.length, previewStep]);

  // Debounced save
  function debouncedSaveConfig(config: FormConfig) {
    latestConfigRef.current = config;
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/dashboard/form/update-config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ form_config: latestConfigRef.current }),
        });
        if (res.ok) {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus((s) => s === "saved" ? "idle" : s), 2500);
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    }, 500);
  }

  function retryLastSave() {
    debouncedSaveConfig(latestConfigRef.current);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function toggleInsuranceType(type: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!data) return;
    const isEnabled = enabledTypes.includes(type as InsuranceType);
    if (isEnabled && enabledTypes.length <= 1) return;

    setTogglingType(type);
    const newTypes = isEnabled
      ? enabledTypes.filter((t) => t !== type)
      : [...enabledTypes, type as InsuranceType];

    const res = await fetch("/api/dashboard/form/toggle-type", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insuranceTypes: newTypes }),
    });
    if (res.ok) {
      setEnabledTypes(newTypes);
      setData({ ...data, insurance_types_enabled: newTypes });
      if (previewType && !newTypes.includes(previewType) && newTypes.length > 0) {
        setPreviewType(newTypes[0]);
      }
    }
    setTogglingType(null);
  }

  function selectPreviewType(type: InsuranceType) {
    setPreviewType(type);
    setPreviewStep(0);
  }

  function handlePreviewTypeSelect(type: InsuranceType) {
    setPreviewType(type);
    // Step will be set by the preview component advancing to step 1
  }

  function toggleFieldEnabled(key: ConfigurableFieldKey) {
    const updated: FormConfig = {
      ...formConfig,
      fields: {
        ...formConfig.fields,
        [key]: { ...formConfig.fields[key], enabled: !formConfig.fields[key].enabled, required: !formConfig.fields[key].enabled ? formConfig.fields[key].required : false },
      },
    };
    setFormConfig(updated);
    debouncedSaveConfig(updated);
  }

  function toggleFieldRequired(key: ConfigurableFieldKey) {
    if (!formConfig.fields[key].enabled) return;
    const updated: FormConfig = {
      ...formConfig,
      fields: {
        ...formConfig.fields,
        [key]: { ...formConfig.fields[key], required: !formConfig.fields[key].required },
      },
    };
    setFormConfig(updated);
    debouncedSaveConfig(updated);
  }

  // Custom field CRUD
  function resetCfForm() {
    setCfLabel("");
    setCfType("text");
    setCfOptions([""]);
    setCfRequired(false);
    setCfAppliesTo("all");
    setEditingCfId(null);
    setShowCfForm(false);
  }

  function openEditCf(field: CustomField) {
    setCfLabel(field.label);
    setCfType(field.type);
    setCfOptions(field.type === "select" && field.options.length > 0 ? field.options : [""]);
    setCfRequired(field.required);
    setCfAppliesTo(field.applies_to);
    setEditingCfId(field.id);
    setShowCfForm(true);
  }

  function saveCf() {
    if (!cfLabel.trim()) return;
    if (cfType === "select" && cfOptions.filter((o) => o.trim()).length === 0) return;
    const field: CustomField = {
      id: editingCfId ?? crypto.randomUUID(),
      label: cfLabel.trim(),
      type: cfType,
      options: cfType === "select" ? cfOptions.filter((o) => o.trim()) : [],
      required: cfRequired,
      applies_to: cfAppliesTo,
    };
    const updatedFields = editingCfId
      ? formConfig.custom_fields.map((f) => (f.id === editingCfId ? field : f))
      : [...formConfig.custom_fields, field];
    const updated = { ...formConfig, custom_fields: updatedFields };
    setFormConfig(updated);
    debouncedSaveConfig(updated);
    resetCfForm();
  }

  function deleteCf(id: string) {
    const updated = { ...formConfig, custom_fields: formConfig.custom_fields.filter((f) => f.id !== id) };
    setFormConfig(updated);
    debouncedSaveConfig(updated);
  }

  async function createAlias() {
    setAliasError("");
    if (!aliasSlug.trim() || !aliasLabel.trim()) {
      setAliasError("Slug and label are required.");
      return;
    }
    setCreatingAlias(true);
    const checkRes = await fetch(`/api/check-slug?slug=${encodeURIComponent(aliasSlug)}`);
    const checkData = await checkRes.json();
    if (!checkData.available) {
      setAliasError("This slug is already taken.");
      setCreatingAlias(false);
      return;
    }
    const res = await fetch("/api/dashboard/form/create-alias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: aliasSlug, label: aliasLabel }),
    });
    if (res.ok) {
      setShowAliasModal(false);
      setAliasSlug("");
      setAliasLabel("");
      fetchData();
    } else {
      const errData = await res.json();
      setAliasError(errData.error || "Failed to create alias.");
    }
    setCreatingAlias(false);
  }

  async function toggleAliasActive(linkId: string, active: boolean) {
    await fetch("/api/dashboard/form/toggle-alias", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId, isActive: active }),
    });
    fetchData();
  }

  // Fields for the currently selected step
  const fieldsForCurrentStep = BUILT_IN_FIELDS.filter((f) => f.step === currentPreviewStepData?.key);

  // Check if a step has any non-default config
  function stepHasCustomConfig(stepKey: string): boolean {
    const stepFields = BUILT_IN_FIELDS.filter((f) => f.step === stepKey);
    for (const field of stepFields) {
      const config = formConfig?.fields?.[field.key];
      const defaultConfig = DEFAULT_FORM_CONFIG.fields[field.key];
      if (!config) continue;
      if (config.enabled !== defaultConfig.enabled || config.required !== defaultConfig.required) {
        return true;
      }
    }
    return false;
  }

  // Current type option for breadcrumb
  const currentTypeOption = previewType
    ? INSURANCE_TYPE_OPTIONS.find((o) => o.value === previewType)
    : null;

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-7 bg-gray-200 rounded-lg w-48 animate-pulse" />
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:basis-[52%] space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-3">
              <div className="h-5 bg-gray-100 rounded w-32 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-3">
              <div className="h-5 bg-gray-100 rounded w-40 animate-pulse" />
              <div className="flex gap-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-9 w-28 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:basis-[48%] hidden lg:block">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="h-[680px] bg-gray-100 rounded-[2.5rem] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!data) return <p className="text-gray-500">Unable to load form data.</p>;

  const primaryLink = data.links.find((l) => l.is_primary);
  const aliases = data.links.filter((l) => !l.is_primary);
  const baseDomain = (process.env.NEXT_PUBLIC_BASE_URL || "https://quotzal.com").replace(/^https?:\/\//, "");
  const linkSlug = primaryLink?.slug || data.slug;
  const formUrl = `${baseDomain}/f/${linkSlug}`;
  const fullUrl = `https://${formUrl}`;
  const isPro = data.plan === "pro";

  return (
    <div className="space-y-5">
      {/* Header + save indicator */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Form</h1>
        {saveStatus !== "idle" && (
          <div className="save-indicator-enter">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full">
                <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved
              </span>
            )}
            {saveStatus === "error" && (
              <button
                onClick={retryLastSave}
                className="flex items-center gap-1 text-[11px] text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
              >
                Save failed &mdash; retry?
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Link */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="text-sm font-mono text-gray-700 truncate">{formUrl}</p>
          </div>
          <button
            onClick={() => copyToClipboard(fullUrl)}
            className={`font-semibold rounded-xl h-11 px-5 active:scale-[0.98] transition-all text-xs shrink-0 ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {copied ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </span>
            ) : "Copy"}
          </button>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl h-11 px-5 inline-flex items-center gap-1.5 transition-all text-xs shrink-0"
          >
            Open
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        {isPro && aliases.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
            {aliases.map((alias) => (
              <div key={alias.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 truncate">{baseDomain}/f/{alias.slug}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(`https://${baseDomain}/f/${alias.slug}`)}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => toggleAliasActive(alias.id, !alias.is_active)}
                    className={`font-medium px-1.5 py-0.5 rounded transition-colors ${alias.is_active ? "bg-emerald-50 text-emerald-600" : "bg-gray-200 text-gray-500"}`}
                  >
                    {alias.is_active ? "On" : "Off"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {isPro && (
          <button
            onClick={() => setShowAliasModal(true)}
            className="mt-2 text-xs text-emerald-600 font-medium hover:text-emerald-700"
          >
            + Add alias
          </button>
        )}
        {!isPro && aliases.length === 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <a href="/dashboard/billing" className="font-medium hover:text-amber-800 transition-colors">
              Upgrade to Pro
            </a>
            <span>for unlimited link aliases</span>
          </div>
        )}
      </div>

      {/* Main two-column layout: controls + preview */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column — Controls (52%) */}
        <div className="flex-1 lg:basis-[52%] space-y-5 min-w-0">

          {/* Unified Insurance Types — click to configure, toggle to enable/disable */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-0.5">Insurance Types</h2>
            <p className="text-xs text-gray-500 mt-0.5 mb-4">Click a type to configure its form steps. Toggle to enable/disable.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {INSURANCE_TYPE_OPTIONS.map((opt) => {
                const enabled = enabledTypes.includes(opt.value);
                const isSelected = previewType === opt.value;
                const isLast = enabled && enabledTypes.length <= 1;
                const isToggling = togglingType === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => selectPreviewType(opt.value)}
                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 text-center transition-all duration-150 cursor-pointer select-none ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 shadow-md"
                        : enabled
                          ? "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md"
                          : "border-gray-200 bg-white"
                    }`}
                  >
                    {/* Configuring label — inside card flow */}
                    {isSelected && (
                      <span className="text-xs text-emerald-600 font-semibold text-center mb-1 flex items-center gap-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Configuring
                      </span>
                    )}
                    <div className={`${!enabled ? "opacity-40 grayscale" : ""}`}>
                      <span className="text-2xl mb-2 block">{opt.icon}</span>
                      <span className="text-sm font-medium text-gray-700 leading-tight">{opt.label}</span>
                    </div>
                    {/* Toggle switch — bottom-right */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={`${enabled ? "Disable" : "Enable"} ${opt.label}`}
                      onClick={(e) => toggleInsuranceType(opt.value, e)}
                      disabled={isLast || isToggling}
                      className={`absolute bottom-2 right-2 w-8 h-[18px] rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-gray-300"} ${isLast ? "opacity-40" : ""}`}
                    >
                      <span className={`block w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute top-[2px] transition-transform ${enabled ? "translate-x-[14px]" : "translate-x-[2px]"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 mt-5" />
          </div>

          {/* Form Steps panel with breadcrumb */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 h-8">
              <span className="font-medium uppercase tracking-wider text-[10px]">Configuring</span>
              <span>&rarr;</span>
              {currentTypeOption && (
                <span className="font-semibold text-emerald-600">
                  {currentTypeOption.icon} {currentTypeOption.label}
                </span>
              )}
              {currentPreviewStepData && (
                <>
                  <span>&rarr;</span>
                  <span className="font-medium text-gray-600">{currentPreviewStepData.label}</span>
                </>
              )}
            </div>

            {/* Step pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {previewSteps.map((step, i) => {
                const isActive = i === Math.min(previewStep, previewSteps.length - 1);
                const hasCustom = stepHasCustomConfig(step.key);
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => setPreviewStep(i)}
                    className={`relative px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-600 text-white font-semibold"
                        : "bg-gray-50 border border-gray-200 text-gray-600 font-medium hover:border-emerald-300 hover:bg-white cursor-pointer"
                    }`}
                  >
                    {step.label}
                    {/* Emerald dot for steps with custom config */}
                    {hasCustom && !isActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Connector line */}
            {fieldsForCurrentStep.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="w-px h-4 bg-emerald-300 ml-4" />
              </div>
            )}

            {/* Step-specific info messages */}
            {currentPreviewStepData?.key === "type" && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3.5 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-emerald-800">Insurance Type Selection</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Customers choose which type they need. Enable or disable types in the grid above.</p>
                </div>
              </div>
            )}

            {currentPreviewStepData?.key === "review" && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700">Review &amp; Submit</p>
                  <p className="text-xs text-gray-500 mt-0.5">Always included. Customers see a summary of all their responses before submitting.</p>
                </div>
              </div>
            )}

            {currentPreviewStepData?.key === "details" && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700">Coverage Details</p>
                  <p className="text-xs text-gray-500 mt-0.5">Type-specific fields shown based on selected insurance type. These fields cannot be individually toggled.</p>
                </div>
              </div>
            )}

            {/* Built-in field toggles */}
            {fieldsForCurrentStep.length > 0 && (
              <div className="field-expand-enter">
                {/* Locked fields for personal step */}
                {currentPreviewStepData?.key === "personal" && (
                  <div className="flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-gray-100">
                    {["First Name", "Last Name", "Email"].map((f) => (
                      <span key={f} className="flex items-center gap-1 bg-gray-100 rounded-lg px-2.5 py-1 text-[10px] text-gray-600 font-medium">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                {fieldsForCurrentStep.map((field, idx) => {
                  const config = formConfig?.fields?.[field.key];
                  if (!config) return null;
                  const isLast = idx === fieldsForCurrentStep.length - 1;
                  return (
                    <div
                      key={field.key}
                      className={`px-4 py-3.5 transition-opacity duration-150 ${
                        !config.enabled ? "opacity-40" : ""
                      } ${!isLast ? "border-b border-gray-100" : ""}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium text-gray-900 ${!config.enabled ? "line-through text-gray-400" : ""}`}>
                            {field.label}
                          </span>
                          <p className="text-xs text-gray-400 mt-0.5">{field.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                          <ToggleSwitch
                            label="Show"
                            checked={config.enabled}
                            onChange={() => toggleFieldEnabled(field.key)}
                          />
                          <div className="flex items-center gap-1">
                            {!config.enabled && (
                              <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                            <ToggleSwitch
                              label="Required"
                              checked={config.required}
                              onChange={() => toggleFieldRequired(field.key)}
                              disabled={!config.enabled}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Fields */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-gray-900">Custom Fields</h2>
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{formConfig.custom_fields.length} / 10</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Add your own fields to collect additional info. They appear on the Personal Info step.
            </p>

            {/* Existing custom fields */}
            {formConfig.custom_fields.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {formConfig.custom_fields.map((cf) => (
                  <div key={cf.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 group hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 truncate">{cf.label}</span>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        {CUSTOM_FIELD_TYPE_OPTIONS.find((o) => o.value === cf.type)?.label}
                      </span>
                      {cf.required && (
                        <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">Required</span>
                      )}
                      {cf.applies_to !== "all" && (
                        <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                          {Array.isArray(cf.applies_to) ? `${cf.applies_to.length} type${cf.applies_to.length === 1 ? "" : "s"}` : "All"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditCf(cf)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        aria-label={`Edit ${cf.label}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteCf(cf.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        aria-label={`Delete ${cf.label}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {formConfig.custom_fields.length === 0 && !showCfForm && (
              <div className="bg-gray-50 rounded-xl px-4 py-6 text-center mb-3">
                <div className="text-2xl mb-1.5">&#x1F4DD;</div>
                <p className="text-xs text-gray-500 mb-0.5">No custom fields yet</p>
                <p className="text-[10px] text-gray-400">Add fields like &ldquo;Referral Source&rdquo; or &ldquo;Policy Number&rdquo;</p>
              </div>
            )}

            {/* Add button */}
            {formConfig.custom_fields.length < 10 && !showCfForm && (
              <button
                onClick={() => { resetCfForm(); setShowCfForm(true); }}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-150"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Custom Field
              </button>
            )}

            {formConfig.custom_fields.length >= 10 && !showCfForm && (
              <div className="w-full py-3 border-2 border-dashed border-gray-100 rounded-xl text-sm font-medium text-gray-400 text-center cursor-not-allowed" title="Maximum 10 custom fields reached">
                Maximum 10 custom fields reached
              </div>
            )}

            {/* Custom field builder form */}
            {showCfForm && (
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white shadow-sm">
                <h3 className="text-xs font-semibold text-gray-700">
                  {editingCfId ? "Edit Field" : "New Custom Field"}
                </h3>

                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Field Label</label>
                  <input
                    type="text"
                    value={cfLabel}
                    onChange={(e) => setCfLabel(e.target.value)}
                    className="w-full px-3 py-2 h-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    placeholder="e.g., Referral Source"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Field Type</label>
                    <select
                      value={cfType}
                      onChange={(e) => setCfType(e.target.value as CustomFieldType)}
                      className="w-full px-3 py-2 h-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    >
                      {CUSTOM_FIELD_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Applies To</label>
                    <select
                      value={cfAppliesTo === "all" ? "all" : "specific"}
                      onChange={(e) => setCfAppliesTo(e.target.value === "all" ? "all" : [])}
                      className="w-full px-3 py-2 h-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    >
                      <option value="all">All Types</option>
                      <option value="specific">Specific Types</option>
                    </select>
                  </div>
                </div>

                {/* Type-specific picker */}
                {Array.isArray(cfAppliesTo) && (
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1.5">Select Insurance Types</label>
                    <div className="flex flex-wrap gap-1.5">
                      {enabledTypes.map((t) => {
                        const sel = cfAppliesTo.includes(t);
                        const opt = INSURANCE_TYPE_OPTIONS.find((o) => o.value === t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setCfAppliesTo(sel ? cfAppliesTo.filter((x) => x !== t) : [...cfAppliesTo, t])}
                            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                              sel
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            <span>{opt?.icon}</span>
                            <span>{opt?.label ?? t}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dropdown options */}
                {cfType === "select" && (
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Dropdown Options</label>
                    <div className="space-y-1.5">
                      {cfOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => { const n = [...cfOptions]; n[i] = e.target.value; setCfOptions(n); }}
                            className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                            placeholder={`Option ${i + 1}`}
                          />
                          {cfOptions.length > 1 && (
                            <button
                              onClick={() => setCfOptions(cfOptions.filter((_, j) => j !== i))}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              aria-label={`Remove option ${i + 1}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setCfOptions([...cfOptions, ""])}
                      className="mt-1.5 text-xs text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
                    >
                      + Add option
                    </button>
                  </div>
                )}

                {/* Required toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cfRequired}
                    onChange={(e) => setCfRequired(e.target.checked)}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-gray-600">Required field</span>
                </label>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={saveCf}
                    disabled={!cfLabel.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-emerald-700 transition-colors"
                  >
                    {editingCfId ? "Update Field" : "Add Field"}
                  </button>
                  <button
                    onClick={resetCfForm}
                    className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column — Preview (48%) */}
        <div className="lg:basis-[48%] shrink-0">
          {/* Desktop preview */}
          <div className="hidden lg:block">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <FormPreview
              enabledTypes={enabledTypes}
              formConfig={formConfig}
              brokerBranding={{ name: data.slug, logoUrl: isPro ? data.logo_url : null, brandColor: isPro ? data.brand_color : null, isPro }}
              activeStep={previewStep}
              onStepChange={setPreviewStep}
              previewInsuranceType={previewType}
              onTypeSelect={handlePreviewTypeSelect}
            />
            </div>
          </div>

          {/* Mobile preview modal */}
          {showMobilePreview && (
            <div className="lg:hidden fixed inset-0 z-50 bg-white flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                <span className="text-sm font-semibold text-gray-900">Form Preview</span>
                <button
                  onClick={() => setShowMobilePreview(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FormPreview
                  enabledTypes={enabledTypes}
                  formConfig={formConfig}
                  brokerBranding={{ name: data.slug, logoUrl: isPro ? data.logo_url : null, brandColor: isPro ? data.brand_color : null, isPro }}
                  activeStep={previewStep}
                  onStepChange={setPreviewStep}
                  previewInsuranceType={previewType}
                  onTypeSelect={handlePreviewTypeSelect}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile floating preview button */}
      <button
        type="button"
        onClick={() => setShowMobilePreview(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Preview Form
      </button>

      {/* Alias modal */}
      {showAliasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl" role="dialog" aria-modal="true">
            <h3 className="text-base font-bold text-gray-900 mb-3">Create Alias</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="aliasSlug" className="block text-xs font-medium text-gray-700 mb-0.5">Slug</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">quotzal.com/f/</span>
                  <input
                    id="aliasSlug"
                    type="text"
                    value={aliasSlug}
                    onChange={(e) => setAliasSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="aliasLabel" className="block text-xs font-medium text-gray-700 mb-0.5">Label</label>
                <input
                  id="aliasLabel"
                  type="text"
                  value={aliasLabel}
                  onChange={(e) => setAliasLabel(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                />
              </div>
              {aliasError && <p className="text-xs text-red-600">{aliasError}</p>}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowAliasModal(false); setAliasError(""); }}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createAlias}
                  disabled={creatingAlias}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium disabled:opacity-50 hover:bg-emerald-700 transition-colors"
                >
                  {creatingAlias ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer">
      <span className={`text-[10px] font-medium ${disabled ? "text-gray-300" : "text-gray-500"}`}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`w-7 h-4 rounded-full relative transition-colors duration-200 ${checked ? "bg-emerald-500" : "bg-gray-300"} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <span className={`block w-3 h-3 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform duration-200 ${checked ? "translate-x-[13px]" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}
