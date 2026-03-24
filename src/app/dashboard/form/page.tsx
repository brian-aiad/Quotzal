"use client";

import { useEffect, useState, useCallback } from "react";
import { FormPreview } from "@/components/dashboard/form-preview";
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

const ALL_INSURANCE_TYPES = INSURANCE_TYPE_OPTIONS.map((o) => ({
  key: o.value,
  label: o.label,
  icon: o.icon,
}));

const BUILT_IN_FIELDS: { key: ConfigurableFieldKey; label: string; autoOnly: boolean }[] = [
  { key: "date_of_birth", label: "Date of Birth", autoOnly: false },
  { key: "phone", label: "Phone Number", autoOnly: false },
  { key: "current_insurance", label: "Current Insurance Section", autoOnly: false },
  { key: "vin", label: "VIN", autoOnly: true },
  { key: "driver_license_number", label: "Driver License Number", autoOnly: true },
  { key: "marital_status", label: "Marital Status", autoOnly: true },
  { key: "sr22", label: "SR-22 Field", autoOnly: true },
  { key: "violations", label: "Violations Section", autoOnly: true },
];

const LOCKED_FIELDS = ["first_name", "last_name", "email"];

const CUSTOM_FIELD_TYPE_OPTIONS: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown" },
  { value: "yes_no", label: "Yes / No" },
];

function generateId(): string {
  return crypto.randomUUID();
}

export default function MyFormPage() {
  const [data, setData] = useState<BrokerFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Form config state (shared with preview)
  const [enabledTypes, setEnabledTypes] = useState<InsuranceType[]>([]);
  const [formConfig, setFormConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);

  // Alias state
  const [aliasSlug, setAliasSlug] = useState("");
  const [aliasLabel, setAliasLabel] = useState("");
  const [aliasError, setAliasError] = useState("");
  const [showAliasModal, setShowAliasModal] = useState(false);
  const [creatingAlias, setCreatingAlias] = useState(false);

  // Custom field builder state
  const [showCustomFieldForm, setShowCustomFieldForm] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
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
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save form_config to API
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

  async function toggleInsuranceType(type: string) {
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
    }
    setTogglingType(null);
  }

  // Field config toggles
  function toggleFieldEnabled(key: ConfigurableFieldKey) {
    const updated = {
      ...formConfig,
      fields: {
        ...formConfig.fields,
        [key]: {
          ...formConfig.fields[key],
          enabled: !formConfig.fields[key].enabled,
          required: !formConfig.fields[key].enabled ? formConfig.fields[key].required : false,
        },
      },
    };
    setFormConfig(updated);
    saveConfig(updated);
  }

  function toggleFieldRequired(key: ConfigurableFieldKey) {
    if (!formConfig.fields[key].enabled) return;
    const updated = {
      ...formConfig,
      fields: {
        ...formConfig.fields,
        [key]: {
          ...formConfig.fields[key],
          required: !formConfig.fields[key].required,
        },
      },
    };
    setFormConfig(updated);
    saveConfig(updated);
  }

  // Custom field CRUD
  function resetCustomFieldForm() {
    setCfLabel("");
    setCfType("text");
    setCfOptions([""]);
    setCfRequired(false);
    setCfAppliesTo("all");
    setEditingFieldId(null);
    setShowCustomFieldForm(false);
  }

  function openEditCustomField(field: CustomField) {
    setCfLabel(field.label);
    setCfType(field.type);
    setCfOptions(field.type === "select" ? (field.options.length > 0 ? field.options : [""]) : [""]);
    setCfRequired(field.required);
    setCfAppliesTo(field.applies_to);
    setEditingFieldId(field.id);
    setShowCustomFieldForm(true);
  }

  function saveCustomField() {
    if (!cfLabel.trim()) return;
    const field: CustomField = {
      id: editingFieldId ?? generateId(),
      label: cfLabel.trim(),
      type: cfType,
      options: cfType === "select" ? cfOptions.filter((o) => o.trim()) : [],
      required: cfRequired,
      applies_to: cfAppliesTo,
    };
    let updatedFields: CustomField[];
    if (editingFieldId) {
      updatedFields = formConfig.custom_fields.map((f) => (f.id === editingFieldId ? field : f));
    } else {
      updatedFields = [...formConfig.custom_fields, field];
    }
    const updated = { ...formConfig, custom_fields: updatedFields };
    setFormConfig(updated);
    saveConfig(updated);
    resetCustomFieldForm();
  }

  function deleteCustomField(id: string) {
    const updated = { ...formConfig, custom_fields: formConfig.custom_fields.filter((f) => f.id !== id) };
    setFormConfig(updated);
    saveConfig(updated);
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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="h-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-32 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!data) return <p className="text-slate-500">Unable to load form data.</p>;

  const primaryLink = data.links.find((l) => l.is_primary);
  const aliases = data.links.filter((l) => !l.is_primary);
  const formUrl = `quotzal.com/f/${primaryLink?.slug || data.slug}`;
  const fullUrl = `https://${formUrl}`;
  const isPro = data.plan === "pro";
  const hasAutoType = enabledTypes.some((t) => t === "auto_personal" || t === "auto_commercial");

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left column — Controls */}
      <div className="flex-1 lg:w-[55%] space-y-6 min-w-0">
        <h1 className="text-2xl font-bold text-slate-900">My Form</h1>

        {/* Primary Link */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Primary Link</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
              <p className="text-sm font-medium text-slate-900 truncate">{formUrl}</p>
            </div>
            <button
              onClick={() => copyToClipboard(fullUrl)}
              className="px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors text-sm shrink-0"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm shrink-0"
            >
              Open Form
            </a>
          </div>
        </div>

        {/* Link Aliases */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">Link Aliases</h2>
            {isPro && (
              <button onClick={() => setShowAliasModal(true)} className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
                + Create Alias
              </button>
            )}
          </div>
          {!isPro ? (
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 mb-2">Unlimited link aliases on the Pro plan.</p>
              <a href="/dashboard/billing" className="text-sm text-emerald-600 font-medium hover:text-emerald-700">Upgrade to Pro — $39/mo</a>
            </div>
          ) : aliases.length === 0 ? (
            <p className="text-sm text-slate-500">No aliases yet.</p>
          ) : (
            <div className="space-y-2">
              {aliases.map((alias) => (
                <div key={alias.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-lg px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">quotzal.com/f/{alias.slug}</p>
                    <p className="text-xs text-slate-500">{alias.label}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => copyToClipboard(`https://quotzal.com/f/${alias.slug}`)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Copy</button>
                    <button
                      onClick={() => toggleAliasActive(alias.id, !alias.is_active)}
                      className={`text-xs font-medium px-2 py-1 rounded ${alias.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-500"}`}
                    >
                      {alias.is_active ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insurance Type Toggles */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Insurance Types</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ALL_INSURANCE_TYPES.map((type) => {
              const enabled = enabledTypes.includes(type.key as InsuranceType);
              const isLast = enabled && enabledTypes.length <= 1;
              const isToggling = togglingType === type.key;
              return (
                <button
                  key={type.key}
                  onClick={() => toggleInsuranceType(type.key)}
                  disabled={isLast || isToggling}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    enabled ? "bg-emerald-100 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-600"
                  } ${isLast ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
                >
                  <span>{type.icon}</span>
                  <span className="truncate text-xs">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Fields Customizer */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-1">Form Fields</h2>
          <p className="text-xs text-slate-500 mb-4">Control which fields appear on your intake form.</p>

          {/* Locked fields */}
          <div className="mb-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Always Required</p>
            <div className="flex flex-wrap gap-2">
              {LOCKED_FIELDS.map((f) => (
                <div key={f} className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-3 py-2 text-xs text-slate-600">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {f.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </div>
              ))}
            </div>
          </div>

          {/* Configurable fields */}
          <div className="space-y-2">
            {BUILT_IN_FIELDS.filter((f) => !f.autoOnly || hasAutoType).map((field) => {
              const config = formConfig.fields[field.key];
              return (
                <div key={field.key} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    {field.autoOnly && <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Auto</span>}
                    <span className="text-sm font-medium text-slate-700">{field.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span className="text-xs text-slate-500">Include</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={config.enabled}
                        onClick={() => toggleFieldEnabled(field.key)}
                        className={`w-8 h-5 rounded-full relative transition-colors ${config.enabled ? "bg-emerald-500" : "bg-slate-300"}`}
                      >
                        <span className={`block w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${config.enabled ? "translate-x-[14px]" : "translate-x-0.5"}`} />
                      </button>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span className={`text-xs ${config.enabled ? "text-slate-500" : "text-slate-300"}`}>Required</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={config.required}
                        onClick={() => toggleFieldRequired(field.key)}
                        disabled={!config.enabled}
                        className={`w-8 h-5 rounded-full relative transition-colors ${config.required ? "bg-emerald-500" : "bg-slate-300"} ${!config.enabled ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        <span className={`block w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${config.required ? "translate-x-[14px]" : "translate-x-0.5"}`} />
                      </button>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Fields */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Custom Fields</h2>
              <p className="text-xs text-slate-500">{formConfig.custom_fields.length} / 10 custom fields</p>
            </div>
            {formConfig.custom_fields.length < 10 && !showCustomFieldForm && (
              <button
                onClick={() => { resetCustomFieldForm(); setShowCustomFieldForm(true); }}
                className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
              >
                + Add Custom Field
              </button>
            )}
          </div>

          {/* Existing custom fields */}
          {formConfig.custom_fields.length > 0 && (
            <div className="space-y-2 mb-4">
              {formConfig.custom_fields.map((cf) => (
                <div key={cf.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm font-medium text-slate-700 truncate">{cf.label}</span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded shrink-0">
                      {CUSTOM_FIELD_TYPE_OPTIONS.find((o) => o.value === cf.type)?.label}
                    </span>
                    {cf.required && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">Required</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEditCustomField(cf)} className="p-1.5 text-slate-400 hover:text-slate-600" aria-label="Edit field">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => deleteCustomField(cf.id)} className="p-1.5 text-slate-400 hover:text-red-500" aria-label="Delete field">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Inline custom field builder */}
          {showCustomFieldForm && (
            <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Label</label>
                <input
                  type="text"
                  value={cfLabel}
                  onChange={(e) => setCfLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Referral Source"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Field Type</label>
                  <select
                    value={cfType}
                    onChange={(e) => setCfType(e.target.value as CustomFieldType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CUSTOM_FIELD_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Applies To</label>
                  <select
                    value={cfAppliesTo === "all" ? "all" : "specific"}
                    onChange={(e) => setCfAppliesTo(e.target.value === "all" ? "all" : [])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Types</option>
                    <option value="specific">Specific Types</option>
                  </select>
                </div>
              </div>

              {Array.isArray(cfAppliesTo) && (
                <div className="flex flex-wrap gap-2">
                  {enabledTypes.map((t) => {
                    const selected = cfAppliesTo.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setCfAppliesTo(selected ? cfAppliesTo.filter((x) => x !== t) : [...cfAppliesTo, t]);
                        }}
                        className={`text-xs px-2 py-1 rounded border ${selected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-500"}`}
                      >
                        {INSURANCE_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t}
                      </button>
                    );
                  })}
                </div>
              )}

              {cfType === "select" && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Options</label>
                  {cfOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 mb-1">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...cfOptions];
                          newOpts[i] = e.target.value;
                          setCfOptions(newOpts);
                        }}
                        className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder={`Option ${i + 1}`}
                      />
                      {cfOptions.length > 1 && (
                        <button onClick={() => setCfOptions(cfOptions.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 text-xs">Remove</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setCfOptions([...cfOptions, ""])} className="text-xs text-emerald-600 font-medium mt-1">+ Add Option</button>
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={cfRequired} onChange={(e) => setCfRequired(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <span className="text-sm text-slate-600">Required</span>
              </label>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveCustomField}
                  disabled={!cfLabel.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-emerald-700"
                >
                  {editingFieldId ? "Update Field" : "Add Field"}
                </button>
                <button onClick={resetCustomFieldForm} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {savingConfig && (
          <p className="text-xs text-slate-500 text-center">Saving changes...</p>
        )}
      </div>

      {/* Right column — Preview */}
      <div className="lg:w-[45%] shrink-0">
        <FormPreview
          enabledTypes={enabledTypes}
          formConfig={formConfig}
          brokerBranding={{
            name: data.slug,
            logoUrl: isPro ? data.logo_url : null,
            brandColor: isPro ? data.brand_color : null,
            isPro,
          }}
        />
      </div>

      {/* Alias creation modal */}
      {showAliasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl" role="dialog" aria-modal="true">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Alias</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="aliasSlug" className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-slate-500">quotzal.com/f/</span>
                  <input id="aliasSlug" type="text" value={aliasSlug} onChange={(e) => setAliasSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="my-custom-link" />
                </div>
              </div>
              <div>
                <label htmlFor="aliasLabel" className="block text-sm font-medium text-slate-700 mb-1">Label</label>
                <input id="aliasLabel" type="text" value={aliasLabel} onChange={(e) => setAliasLabel(e.target.value)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Website quote form" />
              </div>
              {aliasError && <p className="text-sm text-red-600">{aliasError}</p>}
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => { setShowAliasModal(false); setAliasError(""); }} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">Cancel</button>
                <button onClick={createAlias} disabled={creatingAlias} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-emerald-700">{creatingAlias ? "Creating..." : "Create Alias"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
