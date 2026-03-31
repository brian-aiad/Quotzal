"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { buildPreviewSteps } from "@/components/dashboard/form-preview";

const FormPreview = dynamic(
  () => import("@/components/dashboard/form-preview").then((m) => ({ default: m.FormPreview })),
  { ssr: false, loading: () => <div className="bg-slate-100 rounded-[2.5rem] h-[640px] animate-pulse" /> }
);
import { INSURANCE_TYPE_OPTIONS } from "@/lib/constants/insurance-types";
import type { InsuranceType } from "@/lib/types/intake-form";
import { mergeFormConfig } from "@/lib/types/intake-form";
import type {
  ExtendedFormConfig,
  FieldToggle,
  FieldMeta,
  InsuranceStep,
  CustomField as ExtCustomField,
  CustomFieldType as ExtCFType,
} from "@/lib/types/form-config";
import {
  DEFAULT_EXTENDED_FORM_CONFIG,
  mergeExtendedFormConfig,
  getTypeConfigKey,
  FIELDS_BY_TYPE,
  TABS_BY_TYPE,
  extendedToLegacyConfig,
} from "@/lib/types/form-config";

// ── Interfaces ───────────────────────────────────────────────

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
  form_config: Partial<ExtendedFormConfig> | null;
  logo_url: string | null;
  brand_color: string | null;
  links: BrokerLink[];
}

const EXT_CF_TYPE_OPTIONS: { value: ExtCFType; label: string }[] = [
  { value: "text", label: "Short Text" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Long Text" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
];

// ── Component ────────────────────────────────────────────────

export default function MyFormPage() {
  const [data, setData] = useState<BrokerFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Core state
  const [extConfig, setExtConfig] = useState<ExtendedFormConfig>(DEFAULT_EXTENDED_FORM_CONFIG);
  const [previewStep, setPreviewStep] = useState(0);
  const [previewType, setPreviewType] = useState<InsuranceType | null>(null);

  // Config panel state
  const [configuringType, setConfiguringType] = useState<InsuranceType | null>(null);
  const [activeTab, setActiveTab] = useState<InsuranceStep>("personal_info");

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
  const [cfType, setCfType] = useState<ExtCFType>("text");
  const [cfOptions, setCfOptions] = useState<string[]>([""]);
  const [cfRequired, setCfRequired] = useState(false);

  const [togglingType, setTogglingType] = useState<string | null>(null);

  // Save state with debounce
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestConfigRef = useRef<ExtendedFormConfig>(extConfig);
  const consecutiveFailsRef = useRef(0);

  // Mobile preview
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // One-time new fields banner
  const [showNewFieldsBanner, setShowNewFieldsBanner] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("quotzal_new_fields_dismissed");
  });

  function dismissNewFieldsBanner() {
    setShowNewFieldsBanner(false);
    localStorage.setItem("quotzal_new_fields_dismissed", "1");
  }

  // ── Helpers ──────────────────────────────────────────────

  // Sort enabled types by canonical display order (auto_personal always first)
  function sortByCanonicalOrder(types: InsuranceType[]): InsuranceType[] {
    const order = INSURANCE_TYPE_OPTIONS.map((o) => o.value);
    return [...types].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }

  // ── Data loading ─────────────────────────────────────────

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/dashboard/form");
    if (res.ok) {
      const json: BrokerFormData = await res.json();
      setData(json);
      const merged = mergeExtendedFormConfig(json.form_config);
      // Sort enabled types by canonical display order (auto_personal first)
      const sortedEnabled = sortByCanonicalOrder(json.insurance_types_enabled as InsuranceType[]);
      merged.enabledTypes = sortedEnabled;
      setExtConfig(merged);
      latestConfigRef.current = merged;
      if (!previewType && sortedEnabled.length > 0) {
        const firstType = sortedEnabled[0];
        setPreviewType(firstType);
        // Auto-open config panel for the first enabled type
        setConfiguringType(firstType);
        const typeTabs = TABS_BY_TYPE[firstType];
        if (typeTabs.length > 0) setActiveTab(typeTabs[0].id);
      }
    }
    setLoading(false);
  }, [previewType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived state ────────────────────────────────────────

  const enabledTypes = extConfig.enabledTypes;
  const legacyConfig = previewType ? extendedToLegacyConfig(extConfig, previewType) : mergeFormConfig(null);
  const previewSteps = useMemo(
    () => buildPreviewSteps(previewType, legacyConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previewType, legacyConfig?.fields?.current_insurance?.enabled]
  );
  const currentPreviewStepData = previewSteps[Math.min(previewStep, previewSteps.length - 1)];

  // Clamp preview step when steps change
  useEffect(() => {
    if (previewStep >= previewSteps.length) {
      setPreviewStep(previewSteps.length - 1);
    }
  }, [previewSteps.length, previewStep]);

  // ── Save logic ───────────────────────────────────────────

  function debouncedSave(config: ExtendedFormConfig) {
    latestConfigRef.current = config;
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/dashboard/form-config", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formConfig: latestConfigRef.current }),
        });
        if (res.ok) {
          consecutiveFailsRef.current = 0;
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus((s) => s === "saved" ? "idle" : s), 2500);
        } else {
          consecutiveFailsRef.current++;
          setSaveStatus("error");
        }
      } catch {
        consecutiveFailsRef.current++;
        setSaveStatus("error");
      }
    }, 500);
  }

  // Flush on unmount / beforeunload
  useEffect(() => {
    function handleBeforeUnload() {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        const blob = new Blob(
          [JSON.stringify({ formConfig: latestConfigRef.current })],
          { type: "application/json" }
        );
        navigator.sendBeacon("/api/dashboard/form-config", blob);
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  function retryLastSave() {
    debouncedSave(latestConfigRef.current);
  }

  // ── Helpers ──────────────────────────────────────────────

  function updateConfig(updater: (prev: ExtendedFormConfig) => ExtendedFormConfig) {
    setExtConfig((prev) => {
      const next = updater(prev);
      debouncedSave(next);
      return next;
    });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Link copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Insurance type toggle ────────────────────────────────

  async function toggleInsuranceType(type: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!data) return;
    const isEnabled = enabledTypes.includes(type as InsuranceType);
    if (isEnabled && enabledTypes.length <= 1) return;

    setTogglingType(type);
    const newTypes = sortByCanonicalOrder(
      isEnabled
        ? enabledTypes.filter((t) => t !== type)
        : [...enabledTypes, type as InsuranceType]
    );

    const res = await fetch("/api/dashboard/form/toggle-type", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insuranceTypes: newTypes }),
    });
    if (res.ok) {
      updateConfig((prev) => ({ ...prev, enabledTypes: newTypes }));
      setData({ ...data, insurance_types_enabled: newTypes });
      if (previewType && !newTypes.includes(previewType) && newTypes.length > 0) {
        setPreviewType(newTypes[0]);
      }
      toast.error("Form updated.");
    } else {
      toast.success("Failed to update form.");
    }
    setTogglingType(null);
  }

  // ── Config panel ─────────────────────────────────────────

  function openConfigPanel(type: InsuranceType) {
    if (!enabledTypes.includes(type)) return;
    setConfiguringType(type);
    setPreviewType(type);
    setPreviewStep(0);
    const typeTabs = TABS_BY_TYPE[type];
    if (typeTabs.length > 0) setActiveTab(typeTabs[0].id);
  }

  function closeConfigPanel() {
    setConfiguringType(null);
  }

  function getFieldToggle(type: InsuranceType, fieldKey: string): FieldToggle {
    const configKey = getTypeConfigKey(type);
    if (!configKey) return { show: true, required: false };
    const tc = extConfig[configKey] as unknown as Record<string, FieldToggle>;
    return tc[fieldKey] ?? { show: false, required: false };
  }

  function setFieldToggle(type: InsuranceType, fieldKey: string, toggle: FieldToggle) {
    const configKey = getTypeConfigKey(type);
    if (!configKey) return;
    updateConfig((prev) => ({
      ...prev,
      [configKey]: {
        ...(prev[configKey] as unknown as Record<string, FieldToggle>),
        [fieldKey]: toggle,
      },
    }));
  }

  function toggleFieldShow(type: InsuranceType, fieldKey: string) {
    const current = getFieldToggle(type, fieldKey);
    setFieldToggle(type, fieldKey, {
      show: !current.show,
      required: !current.show ? current.required : false,
    });
  }

  function toggleFieldRequired(type: InsuranceType, fieldKey: string) {
    const current = getFieldToggle(type, fieldKey);
    if (!current.show) return;
    setFieldToggle(type, fieldKey, { ...current, required: !current.required });
  }

  // Count active (shown) fields for a type
  function countActiveFields(type: InsuranceType): { shown: number; total: number; required: number } {
    const fields = FIELDS_BY_TYPE[type] ?? [];
    const configKey = getTypeConfigKey(type);
    if (!configKey || fields.length === 0) return { shown: 0, total: 0, required: 0 };
    const tc = extConfig[configKey] as unknown as Record<string, FieldToggle>;
    let shown = 0;
    let required = 0;
    for (const field of fields) {
      const val = tc[field.key];
      if (val?.show) { shown++; if (val.required) required++; }
    }
    return { shown, total: fields.length, required };
  }

  // Check if a tab has non-default config
  function tabHasModifiedFields(type: InsuranceType, step: InsuranceStep): boolean {
    const fields = FIELDS_BY_TYPE[type] ?? [];
    const configKey = getTypeConfigKey(type);
    if (!configKey) return false;
    const tc = extConfig[configKey] as unknown as Record<string, FieldToggle>;
    const defaults = (DEFAULT_EXTENDED_FORM_CONFIG[configKey]) as unknown as Record<string, FieldToggle>;
    for (const field of fields.filter((f) => f.step === step)) {
      const curr = tc[field.key];
      const def = defaults[field.key];
      if (curr && def && (curr.show !== def.show || curr.required !== def.required)) {
        return true;
      }
    }
    return false;
  }

  // ── Custom fields ────────────────────────────────────────

  function resetCfForm() {
    setCfLabel("");
    setCfType("text");
    setCfOptions([""]);
    setCfRequired(false);
    setEditingCfId(null);
    setShowCfForm(false);
  }

  function openEditCf(field: ExtCustomField) {
    setCfLabel(field.label);
    setCfType(field.type);
    setCfOptions(field.type === "select" && field.options && field.options.length > 0 ? field.options : [""]);
    setCfRequired(field.required);
    setEditingCfId(field.id);
    setShowCfForm(true);
  }

  function saveCf(step: InsuranceStep, insType: InsuranceType | "all") {
    if (!cfLabel.trim()) return;
    if (cfType === "select" && cfOptions.filter((o) => o.trim()).length === 0) return;
    const field: ExtCustomField = {
      id: editingCfId ?? crypto.randomUUID(),
      label: cfLabel.trim(),
      type: cfType,
      options: cfType === "select" ? cfOptions.filter((o) => o.trim()) : undefined,
      required: cfRequired,
      step,
      insuranceType: insType,
    };
    updateConfig((prev) => {
      const customFields = editingCfId
        ? prev.customFields.map((f) => (f.id === editingCfId ? field : f))
        : [...prev.customFields, field];
      return { ...prev, customFields };
    });
    toast.success("Form updated.");
    resetCfForm();
  }

  function deleteCf(id: string) {
    updateConfig((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((f) => f.id !== id),
    }));
    toast.success("Form updated.");
  }

  // ── Global custom fields (applies to 'all') ─────────────

  const globalCustomFields = extConfig.customFields.filter((cf) => cf.insuranceType === "all");
  const perTypeCustomFields = configuringType
    ? extConfig.customFields.filter(
        (cf) => cf.insuranceType === configuringType && cf.step === activeTab
      )
    : [];

  // ── Alias management ─────────────────────────────────────

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
      const domain = (process.env.NEXT_PUBLIC_BASE_URL || "https://quotzal.com").replace(/^https?:\/\//, "");
      toast.success(`Alias created. Share: ${domain}/f/${aliasSlug}`);
    } else {
      const errData = await res.json();
      setAliasError(errData.error || "Failed to create alias.");
    }
    setCreatingAlias(false);
  }

  async function toggleAliasActive(linkId: string, active: boolean) {
    const res = await fetch("/api/dashboard/form/toggle-alias", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId, isActive: active }),
    });
    fetchData();
    if (res.ok) {
      toast.error(`Link ${active ? "activated" : "deactivated"}.`);
    } else {
      toast.success("Failed to update link.");
    }
  }

  // ── Preview sync ─────────────────────────────────────────

  function handlePreviewTypeSelect(type: InsuranceType) {
    setPreviewType(type);
  }

  // Mapping helpers between config tabs and preview step keys
  const stepKeyToTab: Record<string, InsuranceStep> = {
    personal: "personal_info",
    drivers: "drivers",
    vehicles: "vehicles",
    details: previewType === "home" ? "property" : "coverage",
    insurance: "current_insurance",
    review: "review",
  };
  const tabToStepKey: Record<InsuranceStep, string> = {
    personal_info: "personal",
    drivers: "drivers",
    vehicles: "vehicles",
    property: "details",
    coverage: "details",
    current_insurance: "insurance",
    review: "review",
  };

  // Track sync source to prevent loops
  const syncSourceRef = useRef<"tab" | "preview" | null>(null);

  // Sync: config tab → preview step
  useEffect(() => {
    if (syncSourceRef.current === "preview") {
      syncSourceRef.current = null;
      return;
    }
    if (!configuringType || !previewType) return;
    const targetKey = tabToStepKey[activeTab];
    if (targetKey) {
      const idx = previewSteps.findIndex((s) => s.key === targetKey);
      if (idx >= 0 && idx !== previewStep) {
        setPreviewStep(idx);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Handle preview step change (from Back/Next or dot click) — syncs back to config tab
  function handlePreviewStepChange(newStep: number) {
    setPreviewStep(newStep);
    if (configuringType && previewType) {
      const stepData = previewSteps[newStep];
      if (stepData) {
        const mappedTab = stepKeyToTab[stepData.key];
        if (mappedTab) {
          const tabs = TABS_BY_TYPE[configuringType];
          const tabExists = tabs.some((t) => t.id === mappedTab);
          if (tabExists && mappedTab !== activeTab) {
            syncSourceRef.current = "preview";
            setActiveTab(mappedTab);
          }
        }
      }
    }
  }

  // ── Loading / Error ──────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-7 bg-gray-200 rounded-lg w-48 animate-pulse" />
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:basis-[60%] space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-3">
              <div className="h-5 bg-gray-100 rounded w-32 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:basis-[40%] hidden lg:block">
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

  // Fields for the current config tab
  const configuringFields: FieldMeta[] = configuringType
    ? (FIELDS_BY_TYPE[configuringType] ?? []).filter((f) => f.step === activeTab)
    : [];

  // Core locked fields per step
  const coreFieldsByStep: Record<InsuranceStep, string[]> = {
    personal_info: ["First Name", "Last Name", "Email"],
    drivers: [],
    vehicles: [],
    property: [],
    coverage: [],
    current_insurance: [],
    review: [],
  };
  if (configuringType === "auto_commercial") {
    coreFieldsByStep.personal_info = ["Contact Email"];
  }

  const tabs = configuringType ? TABS_BY_TYPE[configuringType] : [];
  const configuringTypeOption = configuringType
    ? INSURANCE_TYPE_OPTIONS.find((o) => o.value === configuringType)
    : null;

  return (
    <div className="space-y-5">
      {/* Header + save indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Form</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure your client intake form</p>
        </div>
        {saveStatus !== "idle" && (
          <div>
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
            {saveStatus === "error" && consecutiveFailsRef.current >= 3 && (
              <button
                onClick={retryLastSave}
                className="flex items-center gap-1 text-[11px] text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors"
              >
                Auto-save failed. Your changes may not be saved. &mdash; Save now
              </button>
            )}
            {saveStatus === "error" && consecutiveFailsRef.current < 3 && (
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

      {/* Form Link Bar */}
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
              copied ? "bg-emerald-600 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
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
                  <button onClick={() => copyToClipboard(`https://${baseDomain}/f/${alias.slug}`)} className="text-emerald-600 hover:text-emerald-700 font-medium">Copy</button>
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
        {isPro && aliases.length === 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-col items-center py-4">
              <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M27.656 20.344a8 8 0 00-11.312 0l-8 8a8 8 0 1011.312 11.312l2.204-2.202m-1.516-9.798a8 8 0 0011.312 0l8-8a8 8 0 00-11.312-11.312l-2.2 2.2" />
              </svg>
              <p className="text-sm font-medium text-gray-500">No aliases yet.</p>
              <p className="text-xs text-gray-400 mt-0.5">Create one to track where your leads come from.</p>
            </div>
          </div>
        )}
        {isPro && (
          <button onClick={() => setShowAliasModal(true)} className="mt-2 text-xs text-emerald-600 font-medium hover:text-emerald-700">+ Add alias</button>
        )}
        {!isPro && aliases.length === 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <a href="/dashboard/billing" className="font-medium hover:text-amber-800 transition-colors">Upgrade to Pro</a>
            <span>for unlimited link aliases</span>
          </div>
        )}
      </div>

      {/* Share Your Link */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Share Your Link</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0">
            <QRCodeSVG
              id="quotzal-qr-code"
              value={fullUrl}
              size={200}
              fgColor="#059669"
              bgColor="#ffffff"
              level="M"
            />
          </div>
          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                const svg = document.getElementById("quotzal-qr-code") as unknown as SVGSVGElement;
                if (!svg) return;
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement("canvas");
                canvas.width = 200;
                canvas.height = 200;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                const img = new Image();
                img.onload = () => {
                  ctx.fillStyle = "#ffffff";
                  ctx.fillRect(0, 0, 200, 200);
                  ctx.drawImage(img, 0, 0);
                  const link = document.createElement("a");
                  link.download = "quotzal-form-qr.png";
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                };
                img.src = "data:image/svg+xml;base64," + btoa(svgData);
              }}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 px-5 text-xs transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download QR Code
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Fill out my form to get a quote: ${fullUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white font-semibold rounded-xl h-11 px-5 text-xs transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share via WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(`Get a quote from ${data.slug}`)}&body=${encodeURIComponent(`Fill out this quick form: ${fullUrl}`)}`}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl h-11 px-5 text-xs transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Share via Email
            </a>
          </div>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column (60%) */}
        <div className="flex-1 lg:basis-[60%] space-y-5 min-w-0">

          {/* Insurance Types Grid */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-0.5">Insurance Types</h2>
            <p className="text-xs text-gray-500 mt-0.5 mb-4">Click a type to configure its fields. Toggle to enable/disable.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {INSURANCE_TYPE_OPTIONS.map((opt) => {
                const enabled = enabledTypes.includes(opt.value);
                const isConfiguring = configuringType === opt.value;
                const isLast = enabled && enabledTypes.length <= 1;
                const isToggling = togglingType === opt.value;
                const fieldCounts = enabled ? countActiveFields(opt.value) : null;
                return (
                  <div
                    key={opt.value}
                    onClick={() => enabled ? openConfigPanel(opt.value) : undefined}
                    title={!enabled ? "Enable this type to configure it" : `${fieldCounts?.shown}/${fieldCounts?.total} fields active`}
                    className={`relative flex flex-col items-center rounded-xl border-2 text-center transition-all duration-150 select-none h-[120px] ${
                      isConfiguring
                        ? "border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20 shadow-md cursor-pointer"
                        : enabled
                          ? "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-md cursor-pointer"
                          : "border-gray-200 bg-white cursor-not-allowed"
                    }`}
                  >
                    {isConfiguring && (
                      <span className="absolute top-2 left-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-md px-1.5 py-0.5">
                        Editing
                      </span>
                    )}
                    {enabled && fieldCounts && !isConfiguring && (
                      <span className="absolute top-2 right-2 text-[9px] font-medium text-gray-400">
                        {fieldCounts.shown}/{fieldCounts.total}
                      </span>
                    )}
                    <div className={`flex flex-col items-center pt-7 pb-8 ${!enabled ? "opacity-40 grayscale" : ""}`}>
                      <span className="text-2xl mb-1">{opt.icon}</span>
                      <span className="text-[11px] font-medium text-gray-700 leading-tight text-center px-1">{opt.label}</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={`${enabled ? "Disable" : "Enable"} ${opt.label}`}
                      onClick={(e) => toggleInsuranceType(opt.value, e)}
                      disabled={isLast || isToggling}
                      className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-[18px] rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-gray-300"} ${isLast ? "opacity-40" : ""}`}
                    >
                      <span className={`block w-3.5 h-3.5 bg-white rounded-full shadow-sm absolute top-[2px] transition-transform ${enabled ? "translate-x-[14px]" : "translate-x-[2px]"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Navigator — shows when a type is selected */}
          {configuringType && configuringTypeOption && (() => {
            const clampedIdx = Math.min(previewStep, previewSteps.length - 1);
            const currentStepLabel = previewSteps[clampedIdx]?.label ?? "";
            return (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
              {/* Header row — fixed layout */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{configuringTypeOption.icon}</span>
                  <h2 className="text-sm font-semibold text-gray-900 truncate">{configuringTypeOption.label}</h2>
                </div>
                <button
                  onClick={closeConfigPanel}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors shrink-0 ml-2"
                >
                  Close
                </button>
              </div>

              {/* Progress bar — fixed height, never shifts */}
              <div className="flex gap-1 mb-3">
                {previewSteps.map((step, idx) => (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => handlePreviewStepChange(idx)}
                    className={`flex-1 h-1.5 rounded-full transition-colors duration-300 cursor-pointer hover:opacity-80 ${idx <= clampedIdx ? "bg-emerald-600" : "bg-slate-200"}`}
                    title={step.label}
                    aria-label={`Go to step ${idx + 1}: ${step.label}`}
                  />
                ))}
              </div>

              {/* Current step label + navigation — fixed height, fixed button widths */}
              <div className="flex items-center h-10">
                <button
                  type="button"
                  onClick={() => handlePreviewStepChange(Math.max(0, previewStep - 1))}
                  disabled={previewStep === 0}
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors w-16 shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <div className="text-center flex-1 min-w-0 px-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{currentStepLabel}</p>
                  <p className="text-[10px] text-gray-400">Step {clampedIdx + 1} of {previewSteps.length}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePreviewStepChange(Math.min(previewSteps.length - 1, previewStep + 1))}
                  disabled={previewStep >= previewSteps.length - 1}
                  className="flex items-center justify-end gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors w-16 shrink-0"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            );
          })()}

          {/* Config Panel — appears when a type card is clicked */}
          {configuringType && configuringTypeOption && (() => {
            // Only show field config for steps that have a matching tab (not "type" or "review")
            const currentStepKey = previewSteps[Math.min(previewStep, previewSteps.length - 1)]?.key;
            const mappedTab = currentStepKey ? stepKeyToTab[currentStepKey] : null;
            const hasConfigTab = mappedTab && tabs.some((t) => t.id === mappedTab) && currentStepKey !== "type" && currentStepKey !== "review";

            if (!hasConfigTab) {
              // Show contextual message for non-configurable steps
              return (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <div className="text-center py-4">
                    {currentStepKey === "type" && (
                      <>
                        <p className="text-sm font-medium text-gray-700 mb-1">Insurance Type Selection</p>
                        <p className="text-xs text-gray-500">Clients choose their insurance type on this step. Enable/disable types in the grid above.</p>
                      </>
                    )}
                    {currentStepKey === "review" && (
                      <>
                        <p className="text-sm font-medium text-gray-700 mb-1">Review & Submit</p>
                        <p className="text-xs text-gray-500">Clients review all their information before submitting. This step is auto-generated.</p>
                      </>
                    )}
                    {!currentStepKey && (
                      <p className="text-xs text-gray-500">Navigate to a step to configure its fields.</p>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePreviewStepChange(Math.min(previewSteps.length - 1, previewStep + 1))}
                      disabled={previewStep >= previewSteps.length - 1}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Go to next step
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            }

            return (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {tabs.find((t) => t.id === activeTab)?.label ?? "Fields"}
                  </h2>
                  <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1"><span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-1 py-px rounded">Visible</span> shown on form</span>
                    <span className="text-gray-300">·</span>
                    <span className="inline-flex items-center gap-1"><span className="text-[9px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1 py-px rounded">*Required</span> must be filled</span>
                  </p>
                </div>
              </div>

              {/* Tab row */}
              <div className="px-6 pt-3 pb-0 flex gap-1 border-b border-gray-200 overflow-x-auto">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const hasModified = tabHasModifiedFields(configuringType, tab.id);
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      title={hasModified ? "Customized — fields changed from defaults" : undefined}
                      className={`relative px-3 py-2.5 text-xs transition-all duration-200 border-b-2 -mb-px whitespace-nowrap ${
                        isActive
                          ? "border-emerald-500 text-emerald-700 font-semibold"
                          : hasModified
                            ? "border-transparent text-emerald-600 font-medium hover:text-emerald-700 hover:border-emerald-300"
                            : "border-transparent text-gray-500 font-medium hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {tab.label}
                        {hasModified && (
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                              isActive ? "bg-emerald-500" : "bg-emerald-400"
                            }`}
                            title="Fields customized from defaults"
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Legend for modified indicator */}
              {tabs.some((t) => tabHasModifiedFields(configuringType, t.id)) && (
                <div className="px-6 pt-1.5">
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    = customized from defaults
                  </p>
                </div>
              )}

              {/* Field list */}
              <div className="px-6 py-4">
                {/* New fields info banner */}
                {showNewFieldsBanner && (
                  <div className="mb-4 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <p className="text-xs text-emerald-700">We&apos;ve added new optional fields. They&apos;re off by default.</p>
                    <button
                      onClick={dismissNewFieldsBanner}
                      className="text-emerald-400 hover:text-emerald-600 ml-2 shrink-0"
                      aria-label="Dismiss"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Core fields */}
                {coreFieldsByStep[activeTab].length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Core Fields (always included)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {coreFieldsByStep[activeTab].map((f) => (
                        <span key={f} className="flex items-center gap-1 bg-gray-100 rounded-lg px-2.5 py-1 text-[10px] text-gray-600 font-medium">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional fields */}
                {configuringFields.length > 0 ? (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Optional Fields</p>
                    {configuringFields.map((field, idx) => {
                      const toggle = getFieldToggle(configuringType, field.key);
                      const isLast = idx === configuringFields.length - 1;
                      return (
                        <div
                          key={field.key}
                          className={`py-2 px-3 rounded-lg transition-colors duration-150 ${
                            toggle.show
                              ? "bg-emerald-50/40 hover:bg-emerald-50/70"
                              : "hover:bg-gray-50"
                          } ${!isLast ? "mb-0.5" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {/* Active/inactive indicator dot */}
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${toggle.show ? "bg-emerald-500" : "bg-gray-300"}`} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-sm font-medium ${toggle.show ? "text-gray-900" : "text-gray-500"}`}>
                                    {field.label}
                                  </span>
                                  {toggle.show && (
                                    <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                      Visible
                                    </span>
                                  )}
                                  {toggle.show && toggle.required && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                                      <span className="text-red-500">*</span>Required
                                    </span>
                                  )}
                                  {!toggle.show && (
                                    <span className="text-[9px] font-medium text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                                      Hidden
                                    </span>
                                  )}
                                </div>
                                <p className={`text-[11px] mt-0 ${toggle.show ? "text-gray-500" : "text-gray-400"}`}>{field.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <ToggleSwitch
                                label="Show"
                                checked={toggle.show}
                                onChange={() => toggleFieldShow(configuringType, field.key)}
                              />
                              <ToggleSwitch
                                label="Req"
                                checked={toggle.required}
                                onChange={() => toggleFieldRequired(configuringType, field.key)}
                                disabled={!toggle.show}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">No configurable fields for this step</p>
                  </div>
                )}

                {/* Per-step custom fields */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                    Custom Fields for this step
                  </p>
                  {perTypeCustomFields.length === 0 && !showCfForm && (
                    <div className="flex flex-col items-center py-4 mb-3">
                      <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8h16M8 16h32M8 24h32M8 32h32M16 40h16" />
                      </svg>
                      <p className="text-sm font-medium text-gray-500">No custom fields yet.</p>
                      <p className="text-xs text-gray-400 mt-0.5">Add one to collect extra info.</p>
                    </div>
                  )}
                  {perTypeCustomFields.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {perTypeCustomFields.map((cf) => (
                        <div key={cf.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 group">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium text-gray-800 truncate">{cf.label}</span>
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">
                              {EXT_CF_TYPE_OPTIONS.find((o) => o.value === cf.type)?.label}
                            </span>
                            {cf.required && <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Req</span>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditCf(cf)} className="p-1 text-gray-400 hover:text-gray-600 rounded" aria-label="Edit">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => deleteCf(cf.id)} className="p-1 text-gray-400 hover:text-red-500 rounded" aria-label="Delete">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {extConfig.customFields.length < 10 && !showCfForm && (
                    <button
                      onClick={() => { resetCfForm(); setShowCfForm(true); }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs font-medium text-gray-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                    >
                      + Add Custom Field to {tabs.find((t) => t.id === activeTab)?.label} step
                    </button>
                  )}

                  {/* Inline custom field form */}
                  {showCfForm && (
                    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white shadow-sm mt-2">
                      <div>
                        <label className="block text-[11px] font-medium text-gray-600 mb-1">Field Label</label>
                        <input
                          type="text"
                          value={cfLabel}
                          onChange={(e) => setCfLabel(e.target.value)}
                          className="w-full px-3 py-2 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                          placeholder="e.g., Referral Source"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-gray-600 mb-1">Field Type</label>
                          <select
                            value={cfType}
                            onChange={(e) => setCfType(e.target.value as ExtCFType)}
                            className="w-full px-3 py-2 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                          >
                            {EXT_CF_TYPE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                        <label className="flex items-end gap-2 pb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cfRequired}
                            onChange={(e) => setCfRequired(e.target.checked)}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-xs text-gray-600">Required</span>
                        </label>
                      </div>
                      {cfType === "select" && (
                        <div>
                          <label className="block text-[11px] font-medium text-gray-600 mb-1">Options</label>
                          <div className="space-y-1.5">
                            {cfOptions.map((opt, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => { const n = [...cfOptions]; n[i] = e.target.value; setCfOptions(n); }}
                                  className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                                  placeholder={`Option ${i + 1}`}
                                />
                                {cfOptions.length > 1 && (
                                  <button onClick={() => setCfOptions(cfOptions.filter((_, j) => j !== i))} className="p-1 text-gray-400 hover:text-red-500">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          <button onClick={() => setCfOptions([...cfOptions, ""])} className="mt-1.5 text-xs text-emerald-600 font-medium hover:text-emerald-700">+ Add option</button>
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => saveCf(activeTab, configuringType)}
                          disabled={!cfLabel.trim()}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-emerald-700 active:scale-[0.98] transition-all"
                        >
                          {editingCfId ? "Update" : "Add Field"}
                        </button>
                        <button onClick={resetCfForm} className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })()}

          {/* Global Custom Fields Section */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-gray-900">Global Custom Fields</h2>
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{extConfig.customFields.length} / 10</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              These fields appear for all insurance types. For type-specific fields, use the config panel above.
            </p>

            {globalCustomFields.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {globalCustomFields.map((cf) => (
                  <div key={cf.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 group hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-sm font-medium text-gray-900 truncate">{cf.label}</span>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                        {EXT_CF_TYPE_OPTIONS.find((o) => o.value === cf.type)?.label}
                      </span>
                      {cf.required && <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">Required</span>}
                      <span className="text-[9px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                        {TABS_BY_TYPE.auto_personal.find((t) => t.id === cf.step)?.label ?? cf.step}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditCf(cf)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" aria-label="Edit">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => deleteCf(cf.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" aria-label="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {globalCustomFields.length === 0 && (
              <div className="border-2 border-dashed border-gray-200 rounded-xl px-4 py-6 text-center mb-3">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8h16M8 16h32M8 24h32M8 32h32M16 40h16" />
                </svg>
                <p className="text-sm font-medium text-gray-500 mb-0.5">No custom fields yet.</p>
                <p className="text-xs text-gray-400">Add one to collect extra info from your clients.</p>
              </div>
            )}

            {extConfig.customFields.length < 10 && (
              <button
                onClick={() => {
                  resetCfForm();
                  // For global custom fields, we show a simple modal-like inline form
                  // We'll reuse the showCfForm state but save with insuranceType='all'
                  // Only show if not already in config panel mode
                  if (!configuringType) {
                    setShowCfForm(true);
                    setConfiguringType(null);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-150"
              >
                + Add Global Custom Field
              </button>
            )}

            {/* Global custom field form (when not in config panel) */}
            {showCfForm && !configuringType && (
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white shadow-sm mt-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-600 mb-1">Field Label</label>
                  <input
                    type="text"
                    value={cfLabel}
                    onChange={(e) => setCfLabel(e.target.value)}
                    className="w-full px-3 py-2 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    placeholder="e.g., Referral Source"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Field Type</label>
                    <select
                      value={cfType}
                      onChange={(e) => setCfType(e.target.value as ExtCFType)}
                      className="w-full px-3 py-2 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    >
                      {EXT_CF_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Which Step?</label>
                    <select
                      value={activeTab}
                      onChange={(e) => setActiveTab(e.target.value as InsuranceStep)}
                      className="w-full px-3 py-2 h-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                    >
                      <option value="personal_info">Personal Info</option>
                      <option value="drivers">Drivers</option>
                      <option value="vehicles">Vehicles</option>
                      <option value="property">Property</option>
                      <option value="coverage">Coverage</option>
                      <option value="current_insurance">Current Insurance</option>
                    </select>
                  </div>
                </div>
                {cfType === "select" && (
                  <div>
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Options</label>
                    <div className="space-y-1.5">
                      {cfOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => { const n = [...cfOptions]; n[i] = e.target.value; setCfOptions(n); }}
                            className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                            placeholder={`Option ${i + 1}`}
                          />
                          {cfOptions.length > 1 && (
                            <button onClick={() => setCfOptions(cfOptions.filter((_, j) => j !== i))} className="p-1 text-gray-400 hover:text-red-500">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setCfOptions([...cfOptions, ""])} className="mt-1.5 text-xs text-emerald-600 font-medium hover:text-emerald-700">+ Add option</button>
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={cfRequired} onChange={(e) => setCfRequired(e.target.checked)} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-xs text-gray-600">Required field</span>
                </label>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => saveCf(activeTab, "all")}
                    disabled={!cfLabel.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 hover:bg-emerald-700 active:scale-[0.98] transition-all"
                  >
                    {editingCfId ? "Update" : "Add Field"}
                  </button>
                  <button onClick={resetCfForm} className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column — Preview (40%) */}
        <div className="lg:basis-[40%] shrink-0">
          <div className="lg:sticky lg:top-6">
            {/* Desktop preview */}
            <div className="hidden lg:block">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <FormPreview
                  enabledTypes={enabledTypes}
                  formConfig={legacyConfig}
                  extendedConfig={extConfig}
                  brokerBranding={{ name: data.slug, logoUrl: isPro ? data.logo_url : null, brandColor: isPro ? data.brand_color : null, isPro }}
                  activeStep={previewStep}
                  onStepChange={handlePreviewStepChange}
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
                  <button onClick={() => setShowMobilePreview(false)} className="p-2 text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <FormPreview
                    enabledTypes={enabledTypes}
                    formConfig={legacyConfig}
                    brokerBranding={{ name: data.slug, logoUrl: isPro ? data.logo_url : null, brandColor: isPro ? data.brand_color : null, isPro }}
                    activeStep={previewStep}
                    onStepChange={handlePreviewStepChange}
                    previewInsuranceType={previewType}
                    onTypeSelect={handlePreviewTypeSelect}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile floating preview button */}
      <button
        type="button"
        onClick={() => setShowMobilePreview(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-full shadow-lg hover:bg-emerald-700 active:scale-[0.98] transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Preview
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
                <button onClick={() => { setShowAliasModal(false); setAliasError(""); }} className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
                <button
                  onClick={createAlias}
                  disabled={creatingAlias}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium disabled:opacity-50 hover:bg-emerald-700 active:scale-[0.98] transition-all"
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

// ── Toggle Switch ──────────────────────────────────────────

function ToggleSwitch({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer px-0.5 py-1">
      <span className={`text-[10px] font-medium uppercase tracking-wide ${disabled ? "text-gray-300" : checked ? "text-emerald-600" : "text-gray-400"}`}>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`w-8 h-[18px] rounded-full relative transition-colors duration-200 shrink-0 ${checked ? "bg-emerald-500" : "bg-gray-300"} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <span className={`block w-3 h-3 bg-white rounded-full shadow-sm absolute top-[3px] transition-transform duration-200 ${checked ? "translate-x-[15px]" : "translate-x-[3px]"}`} />
      </button>
    </label>
  );
}
