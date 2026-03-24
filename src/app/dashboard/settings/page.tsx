'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface BrokerData {
  id: string;
  email: string;
  brokerage_name: string;
  slug: string;
  logo_url: string | null;
  brand_color: string | null;
  phone: string | null;
  address: string | null;
  plan: 'starter' | 'pro';
  status: string;
}

interface PrimaryLink {
  id: string;
  slug: string;
}

type ToastType = 'success' | 'error';

interface Toast {
  message: string;
  type: ToastType;
}

export default function SettingsPage() {
  const [broker, setBroker] = useState<BrokerData | null>(null);
  const [primaryLink, setPrimaryLink] = useState<PrimaryLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: brokerData } = await supabase
        .from('brokers')
        .select('id, email, brokerage_name, slug, logo_url, brand_color, phone, address, plan, status')
        .eq('id', user.id)
        .single();

      if (brokerData) setBroker(brokerData as BrokerData);

      const { data: linkData } = await supabase
        .from('broker_links')
        .select('id, slug')
        .eq('broker_id', user.id)
        .eq('is_primary', true)
        .single();

      if (linkData) setPrimaryLink(linkData as PrimaryLink);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
        Failed to load settings. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      <BusinessInfoSection broker={broker} setBroker={setBroker} showToast={showToast} />
      <YourLinkSection primaryLink={primaryLink} setPrimaryLink={setPrimaryLink} showToast={showToast} />
      <BrandingSection broker={broker} setBroker={setBroker} showToast={showToast} supabase={supabase} />
      <AccountSection broker={broker} showToast={showToast} supabase={supabase} />
      <DataRetentionSection broker={broker} showToast={showToast} />
      <DangerZoneSection broker={broker} />
    </div>
  );
}

// ============================================================
// Section 1 — Business Info
// ============================================================

interface BusinessInfoProps {
  broker: BrokerData;
  setBroker: React.Dispatch<React.SetStateAction<BrokerData | null>>;
  showToast: (message: string, type: ToastType) => void;
}

function BusinessInfoSection({ broker, setBroker, showToast }: BusinessInfoProps) {
  const [name, setName] = useState(broker.brokerage_name);
  const [phone, setPhone] = useState(broker.phone || '');
  const [address, setAddress] = useState(broker.address || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      showToast('Brokerage name is required', 'error');
      return;
    }

    setSaving(true);
    const res = await fetch('/api/settings/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brokerage_name: name, phone, address }),
    });

    if (res.ok) {
      setBroker((prev) => prev ? { ...prev, brokerage_name: name, phone: phone || null, address: address || null } : prev);
      showToast('Business info updated', 'success');
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to save', 'error');
    }
    setSaving(false);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Info</h2>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Brokerage Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, State ZIP"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </section>
  );
}

// ============================================================
// Section 2 — Your Link
// ============================================================

interface YourLinkProps {
  primaryLink: PrimaryLink | null;
  setPrimaryLink: React.Dispatch<React.SetStateAction<PrimaryLink | null>>;
  showToast: (message: string, type: ToastType) => void;
}

function YourLinkSection({ primaryLink, setPrimaryLink, showToast }: YourLinkProps) {
  const [editing, setEditing] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!newSlug || newSlug === primaryLink?.slug) {
      setAvailable(null);
      setSlugError('');
      return;
    }

    const timeout = setTimeout(async () => {
      setChecking(true);
      const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(newSlug)}`);
      const data = await res.json();
      setAvailable(data.available);
      setSlugError(data.available ? '' : data.reason || 'Slug unavailable');
      setChecking(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [newSlug, primaryLink?.slug]);

  async function handleSaveSlug() {
    setSaving(true);
    const res = await fetch('/api/settings/update-slug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: newSlug }),
    });

    if (res.ok) {
      setPrimaryLink((prev) => prev ? { ...prev, slug: newSlug } : prev);
      showToast('Slug updated successfully', 'success');
      setEditing(false);
      setShowConfirm(false);
      setNewSlug('');
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to update slug', 'error');
      setShowConfirm(false);
    }
    setSaving(false);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Link</h2>
      <div className="max-w-lg">
        <p className="text-sm text-slate-600 mb-2">
          Your current form link:
        </p>
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg mb-4">
          <span className="text-sm text-slate-500">quotzal.com/f/</span>
          <span className="text-sm font-medium text-slate-900">{primaryLink?.slug || '—'}</span>
        </div>

        {!editing ? (
          <button
            type="button"
            onClick={() => { setEditing(true); setNewSlug(primaryLink?.slug || ''); }}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Change slug
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700">
                Changing your slug will break existing links. Consider creating an alias in My Form instead.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">quotzal.com/f/</span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>
              {checking && <p className="text-xs text-slate-400 mt-1">Checking availability...</p>}
              {!checking && available === true && newSlug !== primaryLink?.slug && (
                <p className="text-xs text-green-600 mt-1">Available</p>
              )}
              {!checking && slugError && (
                <p className="text-xs text-red-600 mt-1">{slugError}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={!available || saving || newSlug === primaryLink?.slug}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setNewSlug(''); setAvailable(null); setSlugError(''); }}
                className="px-4 py-2 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirm slug change</h3>
            <p className="text-sm text-slate-600 mb-4">
              This will change your form link from <strong>quotzal.com/f/{primaryLink?.slug}</strong> to{' '}
              <strong>quotzal.com/f/{newSlug}</strong>. Any existing links will stop working.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSlug}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Confirm change'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ============================================================
// Section 3 — Branding
// ============================================================

interface BrandingProps {
  broker: BrokerData;
  setBroker: React.Dispatch<React.SetStateAction<BrokerData | null>>;
  showToast: (message: string, type: ToastType) => void;
  supabase: ReturnType<typeof createBrowserClient>;
}

function BrandingSection({ broker, setBroker, showToast, supabase }: BrandingProps) {
  const [color, setColor] = useState(broker.brand_color || '#3B82F6');
  const [hexInput, setHexInput] = useState(broker.brand_color || '#3B82F6');
  const [uploading, setUploading] = useState(false);
  const [savingColor, setSavingColor] = useState(false);
  const [removingBranding, setRemovingBranding] = useState(false);

  if (broker.plan !== 'pro') {
    return (
      <section className="relative bg-slate-50 border border-slate-200 rounded-xl p-6 overflow-hidden">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 mb-2">🔒 Pro feature</p>
            <a
              href="/dashboard/billing"
              className="inline-block px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
            >
              Upgrade to Pro
            </a>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Branding</h2>
        <p className="text-sm text-slate-500">Upload your logo, set brand colors, and remove Quotzal branding.</p>
      </section>
    );
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image must be under 2MB', 'error');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${broker.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      showToast('Failed to upload logo', 'error');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
    const logoUrl = urlData.publicUrl;

    const res = await fetch('/api/settings/update-branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logo_url: logoUrl }),
    });

    if (res.ok) {
      setBroker((prev) => prev ? { ...prev, logo_url: logoUrl } : prev);
      showToast('Logo updated', 'success');
    } else {
      showToast('Failed to save logo', 'error');
    }
    setUploading(false);
  }

  async function handleSaveColor() {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(hexInput)) {
      showToast('Invalid hex color', 'error');
      return;
    }

    setSavingColor(true);
    const res = await fetch('/api/settings/update-branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_color: hexInput }),
    });

    if (res.ok) {
      setBroker((prev) => prev ? { ...prev, brand_color: hexInput } : prev);
      setColor(hexInput);
      showToast('Brand color updated', 'success');
    } else {
      showToast('Failed to save color', 'error');
    }
    setSavingColor(false);
  }

  async function handleRemoveBranding() {
    setRemovingBranding(true);
    const res = await fetch('/api/settings/update-branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remove_branding: true }),
    });

    if (res.ok) {
      setBroker((prev) => prev ? { ...prev, logo_url: null, brand_color: null } : prev);
      setColor('#3B82F6');
      setHexInput('#3B82F6');
      showToast('Branding removed', 'success');
    } else {
      showToast('Failed to remove branding', 'error');
    }
    setRemovingBranding(false);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Branding</h2>
      <div className="space-y-6 max-w-lg">
        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Logo</label>
          {broker.logo_url ? (
            <div className="flex items-center gap-4">
              <img
                src={broker.logo_url}
                alt="Brokerage logo"
                className="w-16 h-16 rounded-lg object-contain border border-slate-200"
              />
              <label className="px-3 py-2 text-sm text-emerald-600 font-medium cursor-pointer hover:bg-emerald-50 rounded-lg">
                {uploading ? 'Uploading...' : 'Replace'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          ) : (
            <label className="inline-block px-4 py-2 bg-slate-100 text-sm text-slate-700 font-medium cursor-pointer hover:bg-slate-200 rounded-lg">
              {uploading ? 'Uploading...' : 'Upload logo'}
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
            </label>
          )}
          <p className="text-xs text-slate-400 mt-1">Max 2MB. PNG, JPG, or SVG.</p>
        </div>

        {/* Brand Color */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Brand Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => { setColor(e.target.value); setHexInput(e.target.value); }}
              className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer p-0"
            />
            <input
              type="text"
              value={hexInput}
              onChange={(e) => {
                setHexInput(e.target.value);
                if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                  setColor(e.target.value);
                }
              }}
              placeholder="#3B82F6"
              className="w-28 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <button
              type="button"
              onClick={handleSaveColor}
              disabled={savingColor}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {savingColor ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Remove Branding */}
        <div>
          <button
            type="button"
            onClick={handleRemoveBranding}
            disabled={removingBranding}
            className="px-4 py-2 text-sm text-slate-600 font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            {removingBranding ? 'Removing...' : 'Remove branding'}
          </button>
          <p className="text-xs text-slate-400 mt-1">Removes your logo and resets brand color to default.</p>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Section 4 — Account
// ============================================================

interface AccountProps {
  broker: BrokerData;
  showToast: (message: string, type: ToastType) => void;
  supabase: ReturnType<typeof createBrowserClient>;
}

function AccountSection({ broker, showToast, supabase }: AccountProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleChangeEmail() {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      showToast(error.message || 'Failed to update email', 'error');
    } else {
      showToast('Confirmation email sent to your new address', 'success');
      setShowEmailModal(false);
      setNewEmail('');
    }
    setSavingEmail(false);
  }

  async function handleResetPassword() {
    const { error } = await supabase.auth.resetPasswordForEmail(broker.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      showToast(error.message || 'Failed to send reset email', 'error');
    } else {
      setResetSent(true);
      showToast('Check your email for a password reset link', 'success');
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Account</h2>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-900">{broker.email}</span>
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Change email
            </button>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={resetSent}
            className="px-4 py-2 text-sm text-slate-600 font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
          >
            {resetSent ? 'Check your email' : 'Change password'}
          </button>
        </div>
      </div>

      {/* Change Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowEmailModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Change email</h3>
            <p className="text-sm text-slate-600 mb-4">
              A confirmation link will be sent to your new email address.
            </p>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowEmailModal(false); setNewEmail(''); }}
                className="px-4 py-2 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangeEmail}
                disabled={savingEmail}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {savingEmail ? 'Sending...' : 'Send confirmation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ============================================================
// Section 5 — Data Retention
// ============================================================

interface DataRetentionProps {
  broker: BrokerData;
  showToast: (message: string, type: ToastType) => void;
}

function DataRetentionSection({ broker, showToast }: DataRetentionProps) {
  const [extended, setExtended] = useState(false);
  const [saving, setSaving] = useState(false);

  if (broker.plan !== 'pro') {
    return (
      <section className="relative bg-slate-50 border border-slate-200 rounded-xl p-6 overflow-hidden">
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 mb-2">🔒 Pro feature</p>
            <a
              href="/dashboard/billing"
              className="inline-block px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
            >
              Upgrade to Pro
            </a>
          </div>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Data Retention</h2>
        <p className="text-sm text-slate-500">Extend submission data retention from 12 months to 24 months.</p>
      </section>
    );
  }

  async function handleToggle() {
    const newValue = !extended;
    setSaving(true);

    const res = await fetch('/api/settings/update-retention', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extended: newValue }),
    });

    if (res.ok) {
      setExtended(newValue);
      showToast(`Retention set to ${newValue ? '24' : '12'} months`, 'success');
    } else {
      showToast('Failed to update retention', 'error');
    }
    setSaving(false);
  }

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Data Retention</h2>
      <div className="flex items-center justify-between max-w-lg">
        <div>
          <p className="text-sm font-medium text-slate-900">
            Extend retention to 24 months
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Default is 12 months. Extending updates all existing submissions.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={extended}
          onClick={handleToggle}
          disabled={saving}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 ${
            extended ? 'bg-emerald-600' : 'bg-slate-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              extended ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </section>
  );
}

// ============================================================
// Section 6 — Danger Zone
// ============================================================

interface DangerZoneProps {
  broker: BrokerData;
}

function DangerZoneSection({ broker }: DangerZoneProps) {
  const [showModal, setShowModal] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    if (confirmation !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setDeleting(true);
    setError('');

    const res = await fetch('/api/settings/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: 'DELETE' }),
    });

    if (res.ok) {
      window.location.href = '/login';
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to delete account');
      setDeleting(false);
    }
  }

  return (
    <section className="bg-red-50 border border-red-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-red-600 mb-2 flex items-center gap-2">⚠️ Danger Zone</h2>
      <p className="text-sm text-slate-600 mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
      >
        Delete my account
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Delete account</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <p>This will permanently:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Cancel your Stripe subscription</li>
                <li>Delete all your submissions</li>
                <li>Deactivate your form links</li>
                <li>Remove your account from Quotzal</li>
              </ul>
              <p className="font-medium text-slate-900 mt-4">
                Type <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                value={confirmation}
                onChange={(e) => { setConfirmation(e.target.value); setError(''); }}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              {error && <p className="text-red-600 text-xs">{error}</p>}
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => { setShowModal(false); setConfirmation(''); setError(''); }}
                className="px-4 py-2 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || confirmation !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
