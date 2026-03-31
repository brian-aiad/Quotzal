'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getInsuranceTypeLabel } from '@/lib/constants/insurance-types';
import type { InsuranceType } from '@/lib/types/intake-form';

interface RenewalItem {
  id: string;
  clientName: string;
  email: string;
  phone: string | null;
  insuranceType: string;
  carrier: string | null;
  expiryDate: string;
  daysUntilExpiry: number;
}

interface RenewalCounts {
  next30: number;
  next60: number;
  next90: number;
}

interface RenewalsResponse {
  success: boolean;
  data: {
    renewals: RenewalItem[];
    counts: RenewalCounts;
    plan: string;
  };
}

type TabKey = 'next30' | 'next60' | 'next90';

const TABS: { key: TabKey; label: string; filterFn: (r: RenewalItem) => boolean }[] = [
  { key: 'next30', label: 'Next 30 days', filterFn: (r) => r.daysUntilExpiry <= 30 },
  { key: 'next60', label: '31\u201360 days', filterFn: (r) => r.daysUntilExpiry > 30 && r.daysUntilExpiry <= 60 },
  { key: 'next90', label: '61\u201390 days', filterFn: (r) => r.daysUntilExpiry > 60 && r.daysUntilExpiry <= 90 },
];

function getDaysColor(days: number): string {
  if (days <= 14) return 'text-red-600';
  if (days <= 30) return 'text-amber-600';
  return 'text-gray-600';
}

function getDaysBadgeClasses(days: number): string {
  if (days <= 14) return 'bg-red-50 text-red-700 ring-red-200';
  if (days <= 30) return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-gray-50 text-gray-700 ring-gray-200';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<RenewalItem[]>([]);
  const [counts, setCounts] = useState<RenewalCounts>({ next30: 0, next60: 0, next90: 0 });
  const [plan, setPlan] = useState<string>('pro');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('next30');
  const [archivingIds, setArchivingIds] = useState<Set<string>>(new Set());

  const fetchRenewals = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/renewals');
      if (!res.ok) throw new Error('Failed to fetch renewals');
      const json: RenewalsResponse = await res.json();
      if (json.success) {
        setRenewals(json.data.renewals);
        setCounts(json.data.counts);
        setPlan(json.data.plan);
      }
    } catch {
      toast.error('Failed to load renewals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRenewals();
  }, [fetchRenewals]);

  async function handleArchive(id: string) {
    setArchivingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/dashboard/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      if (!res.ok) throw new Error('Failed to archive');
      setRenewals((prev) => prev.filter((r) => r.id !== id));
      setCounts((prev) => {
        const removed = renewals.find((r) => r.id === id);
        if (!removed) return prev;
        const updated = { ...prev };
        if (removed.daysUntilExpiry <= 30) updated.next30 = Math.max(0, updated.next30 - 1);
        else if (removed.daysUntilExpiry <= 60) updated.next60 = Math.max(0, updated.next60 - 1);
        else updated.next90 = Math.max(0, updated.next90 - 1);
        return updated;
      });
      toast.success('Marked as handled');
    } catch {
      toast.error('Failed to archive submission');
    } finally {
      setArchivingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const totalCount = counts.next30 + counts.next60 + counts.next90;
  const activeTabConfig = TABS.find((t) => t.key === activeTab);
  const filteredRenewals = activeTabConfig ? renewals.filter(activeTabConfig.filterFn) : [];

  // Pro-only lock overlay
  if (!loading && plan !== 'pro') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Renewal Tracker</h1>
        <div className="relative">
          {/* Blurred preview behind the overlay */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 blur-sm pointer-events-none select-none" aria-hidden="true">
            <div className="flex gap-2 mb-6">
              <div className="h-10 bg-slate-100 rounded-lg w-28" />
              <div className="h-10 bg-slate-100 rounded-lg w-28" />
              <div className="h-10 bg-slate-100 rounded-lg w-28" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="py-4 border-b border-slate-100 flex gap-4">
                <div className="h-4 bg-slate-100 rounded w-36" />
                <div className="h-4 bg-slate-100 rounded w-28" />
                <div className="h-4 bg-slate-100 rounded w-24" />
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
            <div className="text-center max-w-sm">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Pro Feature</h3>
              <p className="text-sm text-gray-500 mb-4">
                Upgrade to Pro to track upcoming policy renewals and never miss a follow-up.
              </p>
              <a
                href="/dashboard/billing"
                className="inline-flex items-center justify-center h-10 px-5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all"
              >
                Upgrade to Pro
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded-lg w-72" />
          <div className="h-6 bg-slate-200 rounded-full w-20" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-slate-200 rounded-lg w-28" />
          <div className="h-10 bg-slate-200 rounded-lg w-28" />
          <div className="h-10 bg-slate-200 rounded-lg w-28" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-slate-100 flex gap-4">
              <div className="h-4 bg-slate-200 rounded w-36" />
              <div className="h-4 bg-slate-200 rounded w-28" />
              <div className="h-4 bg-slate-200 rounded w-24" />
              <div className="h-4 bg-slate-200 rounded w-20" />
              <div className="h-4 bg-slate-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Renewal Tracker
        </h1>
        {totalCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
            {totalCount} upcoming
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Policy renewals in the next 90 days
      </p>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => {
          const count = counts[tab.key];
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Renewal list */}
      {filteredRenewals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            {totalCount === 0
              ? 'No policies renewing in the next 90 days.'
              : `No renewals in the ${activeTabConfig?.label.toLowerCase() ?? ''} window.`}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1fr_100px_100px_140px] gap-4 px-5 py-3 border-b border-slate-200 bg-slate-50/50">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Insurance Type</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Carrier</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expiry</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Days Left</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</span>
          </div>

          {/* Rows */}
          {filteredRenewals.map((renewal) => (
            <div
              key={renewal.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_100px_100px_140px] gap-2 sm:gap-4 px-5 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors"
            >
              {/* Client name + email */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{renewal.clientName}</p>
                <p className="text-xs text-gray-500 truncate">{renewal.email}</p>
              </div>

              {/* Insurance type */}
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  {getInsuranceTypeLabel(renewal.insuranceType as InsuranceType)}
                </span>
              </div>

              {/* Carrier */}
              <div className="flex items-center">
                <span className="text-sm text-gray-600 truncate">
                  {renewal.carrier ?? '\u2014'}
                </span>
              </div>

              {/* Expiry date */}
              <div className="flex items-center">
                <span className={`text-sm ${getDaysColor(renewal.daysUntilExpiry)}`}>
                  {formatDate(renewal.expiryDate)}
                </span>
              </div>

              {/* Days until expiry */}
              <div className="flex items-center">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${getDaysBadgeClasses(renewal.daysUntilExpiry)}`}>
                  {renewal.daysUntilExpiry === 0 ? 'Today' : `${renewal.daysUntilExpiry}d`}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <a
                  href={`mailto:${renewal.email}?subject=Policy Renewal Reminder`}
                  className="inline-flex items-center h-8 px-3 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors ring-1 ring-inset ring-emerald-200"
                >
                  Contact
                </a>
                <button
                  type="button"
                  onClick={() => handleArchive(renewal.id)}
                  disabled={archivingIds.has(renewal.id)}
                  className="inline-flex items-center h-8 px-3 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors ring-1 ring-inset ring-gray-200 disabled:opacity-50"
                >
                  {archivingIds.has(renewal.id) ? 'Archiving\u2026' : 'Handled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
