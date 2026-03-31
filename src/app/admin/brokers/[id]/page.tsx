"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface BrokerDetail {
  id: string;
  email: string;
  brokerage_name: string;
  slug: string;
  logo_url: string | null;
  brand_color: string | null;
  phone: string | null;
  address: string | null;
  plan: string;
  status: string;
  insurance_types_enabled: string[];
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  stripe_invoice_id: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

interface BrokerLink {
  slug: string;
  is_primary: boolean;
  is_active: boolean;
}

export default function BrokerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [broker, setBroker] = useState<BrokerDetail | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [links, setLinks] = useState<BrokerLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [planOverride, setPlanOverride] = useState("");
  const [statusOverride, setStatusOverride] = useState("");
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/brokers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBroker(data.broker);
        setPayments(data.payments);
        setSubmissionCount(data.submissionCount);
        setLinks(data.links);
        setPlanOverride(data.broker.plan);
        setStatusOverride(data.broker.status);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave(field: "plan" | "status") {
    setSaving(true);
    const value = field === "plan" ? planOverride : statusOverride;
    await fetch(`/api/admin/brokers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (broker) {
      setBroker({ ...broker, [field]: value });
    }
    setSaving(false);
    setConfirmAction(null);
  }

  async function handleImpersonate() {
    await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brokerId: id }),
    });
    router.push("/dashboard");
  }

  async function handleStatusAction(newStatus: string) {
    setSaving(true);
    await fetch(`/api/admin/brokers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (broker) {
      setBroker({ ...broker, status: newStatus });
      setStatusOverride(newStatus);
    }
    setSaving(false);
    setConfirmAction(null);
  }

  if (loading) {
    return <p className="text-slate-500 py-8 text-center">Loading...</p>;
  }

  if (!broker) {
    return <p className="text-red-400 py-8 text-center">Broker not found.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-slate-500 hover:text-slate-300 mb-2 block"
          >
            ← Back to Overview
          </button>
          <h1 className="text-2xl font-bold text-white">{broker.brokerage_name}</h1>
          <p className="text-sm text-slate-400">{broker.email}</p>
        </div>
        <button
          onClick={handleImpersonate}
          className="px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm font-medium hover:bg-yellow-500/20 transition-colors"
        >
          Impersonate
        </button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard label="Slug" value={broker.slug} />
        <InfoCard label="Phone" value={broker.phone || "—"} />
        <InfoCard label="Address" value={broker.address || "—"} />
        <InfoCard label="Plan" value={broker.plan} />
        <InfoCard label="Status" value={broker.status} />
        <InfoCard label="Submissions" value={String(submissionCount)} />
        <InfoCard label="Stripe Customer" value={broker.stripe_customer_id || "—"} />
        <InfoCard label="Stripe Subscription" value={broker.stripe_subscription_id || "—"} />
        <InfoCard
          label="Trial Ends"
          value={broker.trial_ends_at ? new Date(broker.trial_ends_at).toLocaleDateString() : "—"}
        />
        <InfoCard label="Joined" value={new Date(broker.created_at).toLocaleDateString()} />
        <InfoCard
          label="Insurance Types"
          value={(broker.insurance_types_enabled || []).join(", ")}
        />
        <InfoCard
          label="Links"
          value={links.map((l) => `${l.slug}${l.is_primary ? " (primary)" : ""}${!l.is_active ? " [inactive]" : ""}`).join(", ") || "—"}
        />
      </div>

      {/* Override controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plan override */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Override Plan</h3>
          <div className="flex gap-2">
            <select
              value={planOverride}
              onChange={(e) => setPlanOverride(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
            >
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
            </select>
            <button
              onClick={() => setConfirmAction("plan")}
              disabled={planOverride === broker.plan || saving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-emerald-500 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Status override */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">Override Status</h3>
          <div className="flex gap-2">
            <select
              value={statusOverride}
              onChange={(e) => setStatusOverride(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
            >
              <option value="trialing">Trialing</option>
              <option value="active">Active</option>
              <option value="past_due">Past Due</option>
              <option value="cancelled">Cancelled</option>
              <option value="suspended">Suspended</option>
            </select>
            <button
              onClick={() => setConfirmAction("status")}
              disabled={statusOverride === broker.status || saving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-emerald-500 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {broker.status !== "suspended" && (
          <button
            onClick={() => setConfirmAction("suspend")}
            className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/20"
          >
            Suspend
          </button>
        )}
        {(broker.status === "suspended" || broker.status === "cancelled") && (
          <button
            onClick={() => setConfirmAction("reactivate")}
            className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium hover:bg-green-500/20"
          >
            Reactivate
          </button>
        )}
        {broker.status !== "cancelled" && (
          <button
            onClick={() => setConfirmAction("cancel")}
            className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/20"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Payment history */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-400">Payment History</h3>
        </div>
        {payments.length === 0 ? (
          <p className="px-4 py-6 text-center text-slate-500 text-sm">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-4 py-2 text-slate-500 font-medium">Amount</th>
                <th className="text-left px-4 py-2 text-slate-500 font-medium">Status</th>
                <th className="text-left px-4 py-2 text-slate-500 font-medium">Period</th>
                <th className="text-left px-4 py-2 text-slate-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-slate-800/50">
                  <td className="px-4 py-2 text-slate-300">${(p.amount / 100).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        p.status === "paid"
                          ? "bg-green-400/10 text-green-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-400">
                    {new Date(p.period_start).toLocaleDateString()} –{" "}
                    {new Date(p.period_end).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-slate-400">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-2">
              Confirm {confirmAction === "plan" ? "Plan Change" : confirmAction === "status" ? "Status Change" : confirmAction === "suspend" ? "Suspend" : confirmAction === "cancel" ? "Cancel" : "Reactivate"}
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              {confirmAction === "plan"
                ? `Change plan to "${planOverride}" for ${broker.brokerage_name}?`
                : confirmAction === "status"
                ? `Change status to "${statusOverride}" for ${broker.brokerage_name}?`
                : `${confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1)} ${broker.brokerage_name}?`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction === "plan") handleSave("plan");
                  else if (confirmAction === "status") handleSave("status");
                  else if (confirmAction === "suspend") handleStatusAction("suspended");
                  else if (confirmAction === "cancel") handleStatusAction("cancelled");
                  else if (confirmAction === "reactivate") handleStatusAction("active");
                }}
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-emerald-500"
              >
                {saving ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-slate-200 break-all">{value}</p>
    </div>
  );
}
