"use client";

import { useEffect, useState, useCallback } from "react";
import { FormPreview, buildPreviewSteps } from "@/components/dashboard/form-preview";
import { INSURANCE_TYPE_OPTIONS } from "@/lib/constants/insurance-types";
import type { FormConfig, InsuranceType, CustomField, CustomFieldType, ConfigurableFieldKey } from "@/lib/types/intake-form";
import { DEFAULT_FORM_CONFIG } from "@/lib/types/intake-form";

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

const BUILT_IN_FIELDS: { key: ConfigurableFieldKey; label: string; step: string }[] = [
  { key: "date_of_birth", label: "Date of Birth", step: "personal" },
  { key: "phone", label: "Phone Number", step: "personal" },
  { key: "driver_license_number", label: "Driver License Number", step: "drivers" },
  { key: "marital_status", label: "Marital Status", step: "drivers" },
  { key: "sr22", label: "SR-22 Field", step: "drivers" },
  { key: "violations", label: "Violations Section", step: "drivers" },
  { key: "vin", label: "VIN", step: "vehicles" },
  { key: "current_insurance", label: "Include This Step", step: "insurance" },
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
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/dashboard/form");
    if (res.ok) {
      const json: BrokerFormData = await res.json();
      setData(json);
      setEnabledTypes(json.insurance_types_enabled as InsuranceType[]);
      setFormConfig(json.form_config ?? DEFAULT_FORM_CONFIG);
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

  async function saveConfig(config: FormConfig) {
    setSavingConfig(true);
    await fetch("/api/dashboard/form/update-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form_config: config }),
    });
    setSavingConfig(false);
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
      if (previewType && !newTypes.includes(previewType as InsuranceType) && newTypes.length > 0) {
        setPreviewType(newTypes[0] as InsuranceType);
      }
    }
    setTogglingType(null);
  }

  function selectPreviewType(type: InsuranceType) {
    setPreviewType(type);
    setPreviewStep(0);
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
    saveConfig(updated);
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
    saveConfig(updated);
  }

  // Custom field CRUD
  function resetCfForm() {
    setCfLabel(""); setCfType("text"); setCfOptions([""]); setCfRequired(false); setCfAppliesTo("all"); setEditingCfId(null); setShowCfForm(false);
  }

  function openEditCf(field: CustomField) {
    setCfLabel(field.label); setCfType(field.type);
    setCfOptions(field.type === "select" && field.options.length > 0 ? field.options : [""]);
    setCfRequired(field.required); setCfAppliesTo(field.applies_to); setEditingCfId(field.id); setShowCfForm(true);
  }

  function saveCf() {
    if (!cfLabel.trim()) return;
    // Validate dropdown has at least 1 option
    if (cfType === "select" && cfOptions.filter((o) => o.trim()).length === 0) return;
    const field: CustomField = {
      id: editingCfId ?? crypto.randomUUID(),
      label: cfLabel.trim(), type: cfType,
      options: cfType === "select" ? cfOptions.filter((o) => o.trim()) : [],
      required: cfRequired, applies_to: cfAppliesTo,
    };
    const updatedFields = editingCfId
      ? formConfig.custom_fields.map((f) => (f.id === editingCfId ? field : f))
      : [...formConfig.custom_fields, field];
    const updated = { ...formConfig, custom_fields: updatedFields };
    setFormConfig(updated); saveConfig(updated); resetCfForm();
  }

  function deleteCf(id: string) {
    const updated = { ...formConfig, custom_fields: formConfig.custom_fields.filter((f) => f.id !== id) };
    setFormConfig(updated); saveConfig(updated);
  }

  async function createAlias() {
    setAliasError("");
    if (!aliasSlug.trim() || !aliasLabel.trim()) { setAliasError("Slug and label are required."); return; }
    setCreatingAlias(true);
    const checkRes = await fetch(`/api/check-slug?slug=${encodeURIComponent(aliasSlug)}`);
    const checkData = await checkRes.json();
    if (!checkData.available) { setAliasError("This slug is already taken."); setCreatingAlias(false); return; }
    const res = await fetch("/api/dashboard/form/create-alias", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: aliasSlug, label: aliasLabel }) });
    if (res.ok) { setShowAliasModal(false); setAliasSlug(""); setAliasLabel(""); fetchData(); }
    else { const errData = await res.json(); setAliasError(errData.error || "Failed to create alias."); }
    setCreatingAlias(false);
  }

  async function toggleAliasActive(linkId: string, active: boolean) {
    await fetch("/api/dashboard/form/toggle-alias", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ linkId, isActive: active }) });
    fetchData();
  }

  // Get fields relevant to current preview step
  const fieldsForCurrentStep = BUILT_IN_FIELDS.filter((f) => f.step === currentPreviewStepData?.key);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-32 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }
  if (!data) return <p className="text-slate-500">Unable to load form data.</p>;

  const primaryLink = data.links.find((l) => l.is_primary);
  const aliases = data.links.filter((l) => !l.is_primary);
  const baseDomain = (process.env.NEXT_PUBLIC_BASE_URL || 'https://quotzal.com').replace(/^https?:\/\//, '');
  const linkSlug = primaryLink?.slug || data.slug;
  const formUrl = `${baseDomain}/f/${linkSlug}`;
  const fullUrl = `https://${formUrl}`;
  const isPro = data.plan === "pro";

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left column — Controls */}
      <div className="flex-1 lg:w-1/2 space-y-5 min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Form</h1>

        {/* Section 1: Your Form Link */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
              <p className="text-sm font-medium text-slate-900 truncate">{formUrl}</p>
            </div>
            <button onClick={() => copyToClipboard(fullUrl)} className="px-3 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors text-xs shrink-0">
              {copied ? "Copied!" : "Copy"}
            </button>
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-xs shrink-0">Open</a>
          </div>
          {/* Aliases */}
          {isPro && aliases.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
              {aliases.map((alias) => (
                <div key={alias.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 truncate">{baseDomain}/f/{alias.slug}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => copyToClipboard(`https://${baseDomain}/f/${alias.slug}`)} className="text-emerald-600 hover:text-emerald-700 font-medium">Copy</button>
                    <button onClick={() => toggleAliasActive(alias.id, !alias.is_active)} className={`font-medium px-1.5 py-0.5 rounded ${alias.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
                      {alias.is_active ? "On" : "Off"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {isPro && (
            <button onClick={() => setShowAliasModal(true)} className="mt-2 text-xs text-emerald-600 font-medium hover:text-emerald-700">+ Add alias</button>
          )}
          {!isPro && aliases.length === 0 && (
            <p className="mt-2 text-xs text-slate-500">
              <a href="/dashboard/billing" className="text-emerald-600 hover:text-emerald-700 font-medium">Upgrade to Pro</a> for unlimited link aliases
            </p>
          )}
        </div>

        {/* Section 2: Insurance Types */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Insurance Types</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {INSURANCE_TYPE_OPTIONS.map((opt) => {
              const enabled = enabledTypes.includes(opt.value);
              const isSelected = previewType === opt.value;
              const isLast = enabled && enabledTypes.length <= 1;
              const isToggling = togglingType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => enabled && selectPreviewType(opt.value)}
                  className={`relative flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 text-center transition-all ${
                    isSelected ? "shadow-sm" : enabled ? "border-slate-200 bg-white hover:border-slate-300" : "border-slate-100 bg-slate-50 opacity-50"
                  }`}
                  style={isSelected ? { borderColor: "#059669", backgroundColor: "#05966908" } : undefined}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-[10px] font-medium text-slate-700 leading-tight">{opt.label}</span>
                  {/* Toggle switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`${enabled ? "Disable" : "Enable"} ${opt.label}`}
                    onClick={(e) => toggleInsuranceType(opt.value, e)}
                    disabled={isLast || isToggling}
                    className={`absolute top-1.5 right-1.5 w-7 h-4 rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-slate-300"} ${isLast ? "opacity-40" : ""}`}
                  >
                    <span className={`block w-3 h-3 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${enabled ? "translate-x-[13px]" : "translate-x-0.5"}`} />
                  </button>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Contextual Field Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              Fields for: {currentPreviewStepData?.label ?? "—"}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewStep(Math.max(0, previewStep - 1))}
                disabled={previewStep === 0}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 text-xs"
                aria-label="Previous step"
              >
                ‹
              </button>
              <span className="text-xs text-slate-500 w-12 text-center">{Math.min(previewStep, previewSteps.length - 1) + 1}/{previewSteps.length}</span>
              <button
                type="button"
                onClick={() => setPreviewStep(Math.min(previewSteps.length - 1, previewStep + 1))}
                disabled={previewStep >= previewSteps.length - 1}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 text-xs"
                aria-label="Next step"
              >
                ›
              </button>
            </div>
          </div>

          {/* Contextual content */}
          {currentPreviewStepData?.key === "type" && (
            <p className="text-xs text-slate-500">Insurance types are managed in the section above.</p>
          )}

          {currentPreviewStepData?.key === "review" && (
            <p className="text-xs text-slate-500">The review step is always included. Customers see a summary of all their responses before submitting.</p>
          )}

          {(currentPreviewStepData?.key === "details") && (
            <p className="text-xs text-slate-500">Type-specific fields are shown based on the selected insurance type. These fields cannot be individually toggled.</p>
          )}

          {fieldsForCurrentStep.length > 0 && (
            <div className="space-y-2">
              {/* Locked fields for personal step */}
              {currentPreviewStepData?.key === "personal" && (
                <div className="flex flex-wrap gap-1.5 mb-2 pb-2 border-b border-slate-100">
                  {["First Name", "Last Name", "Email"].map((f) => (
                    <span key={f} className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1 text-[10px] text-slate-600">
                      <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {fieldsForCurrentStep.map((field) => {
                const config = formConfig.fields[field.key];
                return (
                  <div key={field.key} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
                    <span className="text-sm text-slate-700">{field.label}</span>
                    <div className="flex items-center gap-3">
                      <ToggleSwitch label="Include" checked={config.enabled} onChange={() => toggleFieldEnabled(field.key)} />
                      <ToggleSwitch label="Required" checked={config.required} onChange={() => toggleFieldRequired(field.key)} disabled={!config.enabled} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom fields section — shown on personal step */}
          {currentPreviewStepData?.key === "personal" && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">Custom Fields</h3>
                  <p className="text-[10px] text-slate-500">{formConfig.custom_fields.length} / 10</p>
                </div>
                {formConfig.custom_fields.length < 10 && !showCfForm && (
                  <button onClick={() => { resetCfForm(); setShowCfForm(true); }} className="text-xs text-emerald-600 font-medium hover:text-emerald-700">+ Add Field</button>
                )}
              </div>

              {formConfig.custom_fields.map((cf) => (
                <div key={cf.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-medium text-slate-700 truncate">{cf.label}</span>
                    <span className="text-[9px] font-medium text-slate-500 bg-slate-200 px-1 py-0.5 rounded shrink-0">
                      {CUSTOM_FIELD_TYPE_OPTIONS.find((o) => o.value === cf.type)?.label}
                    </span>
                    {cf.required && <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1 py-0.5 rounded shrink-0">Req</span>}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => openEditCf(cf)} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Edit">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => deleteCf(cf.id)} className="p-1 text-slate-400 hover:text-red-500" aria-label="Delete">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}

              {showCfForm && (
                <div className="border border-slate-200 rounded-lg p-3 space-y-2.5 bg-slate-50 mt-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Label</label>
                    <input type="text" value={cfLabel} onChange={(e) => setCfLabel(e.target.value)} className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Referral Source" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Type</label>
                      <select value={cfType} onChange={(e) => setCfType(e.target.value as CustomFieldType)} className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        {CUSTOM_FIELD_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Applies To</label>
                      <select value={cfAppliesTo === "all" ? "all" : "specific"} onChange={(e) => setCfAppliesTo(e.target.value === "all" ? "all" : [])} className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="all">All Types</option>
                        <option value="specific">Specific</option>
                      </select>
                    </div>
                  </div>
                  {Array.isArray(cfAppliesTo) && (
                    <div className="flex flex-wrap gap-1.5">
                      {enabledTypes.map((t) => {
                        const sel = cfAppliesTo.includes(t);
                        return (
                          <button key={t} type="button" onClick={() => setCfAppliesTo(sel ? cfAppliesTo.filter((x) => x !== t) : [...cfAppliesTo, t])} className={`text-[10px] px-2 py-0.5 rounded border ${sel ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-500"}`}>
                            {INSURANCE_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {cfType === "select" && (
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Options</label>
                      {cfOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-1.5 mb-1">
                          <input type="text" value={opt} onChange={(e) => { const n = [...cfOptions]; n[i] = e.target.value; setCfOptions(n); }} className="flex-1 px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder={`Option ${i + 1}`} />
                          {cfOptions.length > 1 && <button onClick={() => setCfOptions(cfOptions.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 text-[10px]">×</button>}
                        </div>
                      ))}
                      <button onClick={() => setCfOptions([...cfOptions, ""])} className="text-[10px] text-emerald-600 font-medium">+ Option</button>
                    </div>
                  )}
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={cfRequired} onChange={(e) => setCfRequired(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <span className="text-xs text-slate-600">Required</span>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={saveCf} disabled={!cfLabel.trim()} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium disabled:opacity-50 hover:bg-emerald-700">{editingCfId ? "Update" : "Add"}</button>
                    <button onClick={resetCfForm} className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {savingConfig && <p className="text-[10px] text-slate-500 text-center">Saving...</p>}
      </div>

      {/* Right column — Preview */}
      <div className="lg:w-1/2 shrink-0">
        <FormPreview
          enabledTypes={enabledTypes}
          formConfig={formConfig}
          brokerBranding={{ name: data.slug, logoUrl: isPro ? data.logo_url : null, brandColor: isPro ? data.brand_color : null, isPro }}
          activeStep={previewStep}
          onStepChange={setPreviewStep}
          previewInsuranceType={previewType}
        />
      </div>

      {/* Alias modal */}
      {showAliasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl" role="dialog" aria-modal="true">
            <h3 className="text-base font-bold text-slate-900 mb-3">Create Alias</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="aliasSlug" className="block text-xs font-medium text-slate-700 mb-0.5">Slug</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">quotzal.com/f/</span>
                  <input id="aliasSlug" type="text" value={aliasSlug} onChange={(e) => setAliasSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label htmlFor="aliasLabel" className="block text-xs font-medium text-slate-700 mb-0.5">Label</label>
                <input id="aliasLabel" type="text" value={aliasLabel} onChange={(e) => setAliasLabel(e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              {aliasError && <p className="text-xs text-red-600">{aliasError}</p>}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowAliasModal(false); setAliasError(""); }} className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900">Cancel</button>
                <button onClick={createAlias} disabled={creatingAlias} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium disabled:opacity-50 hover:bg-emerald-700">{creatingAlias ? "Creating..." : "Create"}</button>
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
      <span className={`text-[10px] ${disabled ? "text-slate-300" : "text-slate-500"}`}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`w-7 h-4 rounded-full relative transition-colors ${checked ? "bg-emerald-500" : "bg-slate-300"} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <span className={`block w-3 h-3 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${checked ? "translate-x-[13px]" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}
