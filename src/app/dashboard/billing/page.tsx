'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

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

type ToastType = 'success' | 'error';

interface Toast {
  message: string;
  type: ToastType;
}

const PLAN_PRICES: Record<string, number> = {
  starter: 19,
  pro: 39,
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  trialing: 'bg-blue-50 text-blue-700',
  past_due: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  paid: 'bg-green-50 text-green-700',
  failed: 'bg-red-50 text-red-700',
};

export default function BillingPage() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loadData = useCallback(async () => {
    const res = await fetch('/api/billing/subscription');
    if (res.ok) {
      const data = await res.json();
      setSubscription(data.subscription);
      setPayments(data.payments);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
        Failed to load billing information. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      <PlanCard subscription={subscription} showToast={showToast} onUpdate={loadData} />
      <PaymentActions subscription={subscription} showToast={showToast} onUpdate={loadData} />
      <PaymentHistory payments={payments} />
    </div>
  );
}

// ============================================================
// Current Plan Card
// ============================================================

interface PlanCardProps {
  subscription: SubscriptionInfo;
  showToast: (message: string, type: ToastType) => void;
  onUpdate: () => Promise<void>;
}

function PlanCard({ subscription, showToast, onUpdate }: PlanCardProps) {
  const [managingPayment, setManagingPayment] = useState(false);

  async function handleManagePayment() {
    setManagingPayment(true);
    const res = await fetch('/api/create-portal-session', { method: 'POST' });

    if (res.ok) {
      const data = await res.json();
      window.location.href = data.url;
    } else {
      showToast('Failed to open billing portal', 'error');
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
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-900 capitalize">
              {subscription.plan}
            </span>
            <span className="text-lg text-gray-500">
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
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 shrink-0"
        >
          {managingPayment ? 'Opening...' : 'Manage payment method'}
        </button>
      </div>
    </section>
  );
}

// ============================================================
// Payment Actions (Upgrade / Downgrade / Cancel)
// ============================================================

interface PaymentActionsProps {
  subscription: SubscriptionInfo;
  showToast: (message: string, type: ToastType) => void;
  onUpdate: () => Promise<void>;
}

function PaymentActions({ subscription, showToast, onUpdate }: PaymentActionsProps) {
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
        upgrade: 'Upgraded to Pro! Changes take effect immediately.',
        downgrade: 'Downgraded to Starter. Changes take effect at next billing cycle.',
        cancel: 'Subscription will cancel at end of billing period.',
        reactivate: 'Subscription reactivated!',
      };
      showToast(messages[action] || 'Updated successfully', 'success');
      setShowUpgradeModal(false);
      setShowDowngradeModal(false);
      setShowCancelModal(false);
      await onUpdate();
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to update subscription', 'error');
    }
    setProcessing(false);
  }

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Subscription</h2>
      <div className="flex flex-wrap gap-3">
        {subscription.plan === 'starter' && (
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Upgrade to Pro — $39/mo
          </button>
        )}
        {subscription.plan === 'pro' && (
          <button
            type="button"
            onClick={() => setShowDowngradeModal(true)}
            className="px-4 py-2 text-sm text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Downgrade to Starter — $19/mo
          </button>
        )}
        {subscription.cancel_at_period_end ? (
          <button
            type="button"
            onClick={() => handleAction('reactivate')}
            disabled={processing}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Reactivate subscription'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2 text-sm text-red-600 font-medium border border-red-200 rounded-lg hover:bg-red-50"
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
          confirmStyle="bg-blue-600 hover:bg-blue-700"
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
      <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className={`px-4 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-50 ${confirmStyle}`}
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
      <section className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
        <p className="text-sm text-gray-500">No payments recorded yet.</p>
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
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-2 font-medium text-gray-500">Amount</th>
              <th className="text-left py-3 px-2 font-medium text-gray-500">Period</th>
              <th className="text-left py-3 px-2 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-100">
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
