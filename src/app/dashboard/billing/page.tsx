'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';

interface SubscriptionInfo {
  plan: 'starter' | 'pro';
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface PaymentRecord {
  id: string;
  amount: number;
  status: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

const PLAN_PRICES: Record<string, number> = {
  starter: 19,
  pro: 39,
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  trialing: 'bg-amber-50 text-amber-700 border border-amber-200',
  past_due: 'bg-red-50 text-red-700 border border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
  paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  failed: 'bg-red-50 text-red-700 border border-red-200',
};

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Detect return from Stripe Portal or checkout
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      toast.success('Plan updated successfully.');
      window.history.replaceState({}, '', '/dashboard/billing');
    }
  }, [searchParams]);

  const loadData = useCallback(async () => {
    const res = await fetch('/api/billing/subscription');
    if (res.ok) {
      const data = await res.json();
      setSubscription(data.data.subscription);
      setPayments(data.data.payments);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-gray-200 rounded-lg w-32 animate-pulse" />
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="h-5 bg-gray-100 rounded w-32 animate-pulse" />
          <div className="h-8 bg-gray-100 rounded w-48 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-64 animate-pulse" />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="h-5 bg-gray-100 rounded w-40 animate-pulse" />
          <div className="flex gap-3">
            <div className="h-11 w-48 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    // Trial users have no subscription yet — show helpful trial state
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Billing</h1>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">Trial</span>
            <h2 className="text-lg font-semibold text-gray-900">Free Trial Active</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            You&apos;re on a free 30-day trial. Subscribe to a plan before your trial ends to keep your form link active.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Starter</h3>
              <p className="text-2xl font-bold text-gray-900 mb-3">$19<span className="text-sm font-normal text-gray-500">/mo</span></p>
              <button onClick={async () => {
                const res = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'starter' }) });
                if (res.ok) { const data = await res.json(); window.location.href = data.data.url; }
              }} className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl h-11 px-5 active:scale-[0.98] transition-all text-sm">Choose Starter</button>
            </div>
            <div className="border-2 border-emerald-600 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-1">Pro</h3>
              <p className="text-2xl font-bold text-gray-900 mb-3">$39<span className="text-sm font-normal text-gray-500">/mo</span></p>
              <button onClick={async () => {
                const res = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: 'pro' }) });
                if (res.ok) { const data = await res.json(); window.location.href = data.data.url; }
              }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 px-5 active:scale-[0.98] transition-all text-sm">Choose Pro</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Billing</h1>

      <PlanCard subscription={subscription} onUpdate={loadData} />
      <PaymentActions subscription={subscription} onUpdate={loadData} />
      <PaymentHistory payments={payments} />
    </div>
  );
}

// ============================================================
// Current Plan Card
// ============================================================

interface PlanCardProps {
  subscription: SubscriptionInfo;
  onUpdate: () => Promise<void>;
}

function PlanCard({ subscription, onUpdate }: PlanCardProps) {
  const [managingPayment, setManagingPayment] = useState(false);

  async function handleManagePayment() {
    setManagingPayment(true);
    const res = await fetch('/api/create-portal-session', { method: 'POST' });

    if (res.ok) {
      const data = await res.json();
      window.location.href = data.data.url;
    } else {
      toast.error('Failed to open billing portal');
      setManagingPayment(false);
    }
  }

  const nextBillingDate = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-1" />
      <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900 capitalize">
              {subscription.plan}
            </span>
            <span className="text-lg text-gray-600">
              ${PLAN_PRICES[subscription.plan]}/month
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                STATUS_STYLES[subscription.status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {subscription.status.replace('_', ' ')}
            </span>
          </div>
          {nextBillingDate && (
            <p className="text-sm text-gray-500">
              {subscription.cancel_at_period_end
                ? `Cancels on ${nextBillingDate}`
                : `Next billing date: ${nextBillingDate}`}
            </p>
          )}
          {subscription.cancel_at_period_end && (
            <p className="text-sm text-amber-600">
              Your subscription is set to cancel at the end of the current billing period. Your form link will remain active until then.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleManagePayment}
          disabled={managingPayment}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl h-11 px-5 active:scale-[0.98] transition-all text-sm disabled:opacity-50 shrink-0"
        >
          {managingPayment ? 'Opening...' : 'Manage payment method'}
        </button>
      </div>
      </div>
    </section>
  );
}

// ============================================================
// Payment Actions (Upgrade / Downgrade / Cancel)
// ============================================================

interface PaymentActionsProps {
  subscription: SubscriptionInfo;
  onUpdate: () => Promise<void>;
}

function PaymentActions({ subscription, onUpdate }: PaymentActionsProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function handleAction(action: string, plan?: string) {
    setProcessing(true);
    const res = await fetch('/api/billing/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, plan }),
    });

    if (res.ok) {
      const messages: Record<string, string> = {
        upgrade: "You're now on Pro. Welcome!",
        downgrade: 'Downgraded to Starter. Changes take effect at next billing cycle.',
        cancel: 'Subscription will cancel at end of billing period.',
        reactivate: 'Subscription reactivated!',
      };
      toast.success(messages[action] || 'Updated successfully');
      setShowUpgradeModal(false);
      setShowDowngradeModal(false);
      setShowCancelModal(false);
      await onUpdate();
    } else {
      toast.error('Failed to update subscription. Please try again.');
    }
    setProcessing(false);
  }

  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Subscription</h2>
      <div className="flex flex-wrap gap-3">
        {subscription.plan === 'starter' && (
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 px-5 active:scale-[0.98] transition-all text-sm"
          >
            Upgrade to Pro — $39/mo
          </button>
        )}
        {subscription.plan === 'pro' && (
          <button
            type="button"
            onClick={() => setShowDowngradeModal(true)}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl h-11 px-5 active:scale-[0.98] transition-all text-sm"
          >
            Downgrade to Starter — $19/mo
          </button>
        )}
        {subscription.cancel_at_period_end ? (
          <button
            type="button"
            onClick={() => handleAction('reactivate')}
            disabled={processing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 px-5 active:scale-[0.98] transition-all text-sm disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Reactivate subscription'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            Cancel subscription
          </button>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <ConfirmModal
          title="Upgrade to Pro"
          description="You'll be upgraded to the Pro plan ($39/month). The price difference will be prorated for the current billing period. You'll get access to branding customization, extended data retention, and more."
          confirmLabel={processing ? 'Upgrading...' : 'Confirm upgrade'}
          confirmStyle="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={() => handleAction('upgrade', 'pro')}
          onCancel={() => setShowUpgradeModal(false)}
          disabled={processing}
        />
      )}

      {/* Downgrade Modal */}
      {showDowngradeModal && (
        <ConfirmModal
          title="Downgrade to Starter"
          description="You'll be downgraded to the Starter plan ($19/month). Pro features (branding, extended retention) will be removed. The change takes effect at your next billing cycle."
          confirmLabel={processing ? 'Downgrading...' : 'Confirm downgrade'}
          confirmStyle="bg-amber-600 hover:bg-amber-700"
          onConfirm={() => handleAction('downgrade', 'starter')}
          onCancel={() => setShowDowngradeModal(false)}
          disabled={processing}
        />
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <ConfirmModal
          title="Cancel subscription"
          description="Your subscription will remain active until the end of the current billing period. Your form link will continue to work until then. After cancellation, your data will be retained for 90 days."
          confirmLabel={processing ? 'Cancelling...' : 'Cancel subscription'}
          confirmStyle="bg-red-600 hover:bg-red-700"
          onConfirm={() => handleAction('cancel')}
          onCancel={() => setShowCancelModal(false)}
          disabled={processing}
        />
      )}
    </section>
  );
}

// ============================================================
// Confirmation Modal
// ============================================================

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  confirmStyle: string;
  onConfirm: () => void;
  onCancel: () => void;
  disabled: boolean;
}

function ConfirmModal({ title, description, confirmLabel, confirmStyle, onConfirm, onCancel, disabled }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl h-11 px-5 transition-all text-sm"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className={`text-white font-semibold rounded-xl h-11 px-5 transition-all text-sm disabled:opacity-50 ${confirmStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Payment History Table
// ============================================================

interface PaymentHistoryProps {
  payments: PaymentRecord[];
}

function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
        <div className="text-center py-6">
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-sm font-medium text-gray-500">Your first payment receipt will show here after your trial ends.</p>
        </div>
      </section>
    );
  }

  function formatAmount(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-3 px-2 text-xs font-bold uppercase tracking-wider text-gray-400">Date</th>
              <th className="text-left py-3 px-2 text-xs font-bold uppercase tracking-wider text-gray-400">Amount</th>
              <th className="text-left py-3 px-2 text-xs font-bold uppercase tracking-wider text-gray-400">Period</th>
              <th className="text-left py-3 px-2 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors">
                <td className="py-3 px-2 text-gray-900">{formatDate(payment.created_at)}</td>
                <td className="py-3 px-2 text-gray-900 font-medium">{formatAmount(payment.amount)}</td>
                <td className="py-3 px-2 text-gray-500">
                  {formatDate(payment.period_start)} — {formatDate(payment.period_end)}
                </td>
                <td className="py-3 px-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      STATUS_STYLES[payment.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
