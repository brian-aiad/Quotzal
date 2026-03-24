"use client";

import { useEffect, useState, useCallback } from "react";

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
  links: BrokerLink[];
}

const ALL_INSURANCE_TYPES = [
  { key: "auto_personal", label: "Auto (Personal)" },
  { key: "auto_commercial", label: "Auto (Commercial)" },
  { key: "home", label: "Home" },
  { key: "life", label: "Life" },
  { key: "motorcycle", label: "Motorcycle" },
  { key: "boat", label: "Boat" },
  { key: "rv", label: "RV" },
  { key: "other", label: "Other" },
];

export default function MyFormPage() {
  const [data, setData] = useState<BrokerFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [aliasSlug, setAliasSlug] = useState("");
  const [aliasLabel, setAliasLabel] = useState("");
  const [aliasError, setAliasError] = useState("");
  const [showAliasModal, setShowAliasModal] = useState(false);
  const [creatingAlias, setCreatingAlias] = useState(false);
  const [togglingType, setTogglingType] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/dashboard/form");
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function toggleInsuranceType(type: string) {
    if (!data) return;
    const enabled = data.insurance_types_enabled;
    const isEnabled = enabled.includes(type);

    // Block disabling last type
    if (isEnabled && enabled.length <= 1) return;

    setTogglingType(type);
    const newTypes = isEnabled
      ? enabled.filter((t) => t !== type)
      : [...enabled, type];

    const res = await fetch("/api/dashboard/form/toggle-type", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insuranceTypes: newTypes }),
    });

    if (res.ok) {
      setData({ ...data, insurance_types_enabled: newTypes });
    }
    setTogglingType(null);
  }

  async function createAlias() {
    setAliasError("");
    if (!aliasSlug.trim() || !aliasLabel.trim()) {
      setAliasError("Slug and label are required.");
      return;
    }

    setCreatingAlias(true);

    // Check availability
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
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-gray-500">Unable to load form data.</p>;
  }

  const primaryLink = data.links.find((l) => l.is_primary);
  const aliases = data.links.filter((l) => !l.is_primary);
  const formUrl = `quotzal.com/f/${primaryLink?.slug || data.slug}`;
  const fullUrl = `https://${formUrl}`;
  const isPro = data.plan === "pro";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Form</h1>

      {/* Primary Link */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Primary Link</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <p className="text-base font-medium text-gray-900 truncate">{formUrl}</p>
          </div>
          <button
            onClick={() => copyToClipboard(fullUrl)}
            className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors text-sm shrink-0"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm shrink-0"
          >
            Open Form
          </a>
        </div>
      </div>

      {/* Link Aliases */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-500">Link Aliases</h2>
          {isPro && (
            <button
              onClick={() => setShowAliasModal(true)}
              className="text-sm text-blue-600 font-medium hover:text-blue-500"
            >
              + Create New Alias
            </button>
          )}
        </div>
        {!isPro ? (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Unlimited link aliases are available on the Pro plan.
            </p>
            <a
              href="/dashboard/billing"
              className="text-sm text-blue-600 font-medium hover:text-blue-500"
            >
              Upgrade to Pro — $39/mo
            </a>
          </div>
        ) : aliases.length === 0 ? (
          <p className="text-sm text-gray-500">No aliases yet. Create one to get a custom URL.</p>
        ) : (
          <div className="space-y-2">
            {aliases.map((alias) => (
              <div
                key={alias.id}
                className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    quotzal.com/f/{alias.slug}
                  </p>
                  <p className="text-xs text-gray-500">{alias.label}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(`https://quotzal.com/f/${alias.slug}`)}
                    className="text-xs text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => toggleAliasActive(alias.id, !alias.is_active)}
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      alias.is_active
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-200 text-gray-500"
                    }`}
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
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-medium text-gray-500 mb-4">Insurance Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ALL_INSURANCE_TYPES.map((type) => {
            const enabled = data.insurance_types_enabled.includes(type.key);
            const isLast = enabled && data.insurance_types_enabled.length <= 1;
            const isToggling = togglingType === type.key;

            return (
              <button
                key={type.key}
                onClick={() => toggleInsuranceType(type.key)}
                disabled={isLast || isToggling}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                  enabled
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-gray-50 border-gray-200 text-gray-500"
                } ${isLast ? "opacity-50 cursor-not-allowed" : "hover:opacity-80"}`}
              >
                <span>{type.label}</span>
                <span className={`w-3 h-3 rounded-full ${enabled ? "bg-blue-600" : "bg-gray-300"}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-medium text-gray-500 mb-4">Form Preview</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: "600px" }}>
          <iframe
            src={`/f/${primaryLink?.slug || data.slug}?preview=true`}
            className="w-full h-full"
            title="Form Preview"
          />
        </div>
      </div>

      {/* Alias creation modal */}
      {showAliasModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Alias</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="aliasSlug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-500">quotzal.com/f/</span>
                  <input
                    id="aliasSlug"
                    type="text"
                    value={aliasSlug}
                    onChange={(e) => setAliasSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="my-custom-link"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="aliasLabel" className="block text-sm font-medium text-gray-700 mb-1">
                  Label
                </label>
                <input
                  id="aliasLabel"
                  type="text"
                  value={aliasLabel}
                  onChange={(e) => setAliasLabel(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Website quote form"
                />
              </div>
              {aliasError && <p className="text-sm text-red-600">{aliasError}</p>}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => {
                    setShowAliasModal(false);
                    setAliasError("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={createAlias}
                  disabled={creatingAlias}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-500"
                >
                  {creatingAlias ? "Creating..." : "Create Alias"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
