"use client";

import { useState } from "react";

type RecipientFilter = "all_active" | "trialing" | "pro" | "starter" | "past_due";

export default function AdminBroadcastPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientFilter, setRecipientFilter] = useState<RecipientFilter>("all_active");
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  async function fetchRecipientCount() {
    const res = await fetch(`/api/admin/broadcast?filter=${recipientFilter}`);
    if (res.ok) {
      const data = await res.json();
      setRecipientCount(data.count);
    }
  }

  async function handlePreview() {
    if (!subject.trim() || !body.trim()) {
      setError("Subject and body are required.");
      return;
    }
    setError("");
    await fetchRecipientCount();
    setShowConfirm(true);
  }

  async function handleSend() {
    setSending(true);
    setError("");
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, filter: recipientFilter }),
    });
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to send.");
    }
    setSending(false);
    setShowConfirm(false);
  }

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Broadcast Sent</h1>
        <p className="text-slate-400 mb-6">
          Your email has been sent to {recipientCount} broker{recipientCount !== 1 ? "s" : ""}.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setSubject("");
            setBody("");
            setRecipientCount(null);
          }}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500"
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Broadcast Email</h1>

      <div className="space-y-4">
        {/* Recipient filter */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Recipients</label>
          <select
            value={recipientFilter}
            onChange={(e) => {
              setRecipientFilter(e.target.value as RecipientFilter);
              setRecipientCount(null);
            }}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all_active">All Active Brokers</option>
            <option value="trialing">Trialing Only</option>
            <option value="pro">Pro Only</option>
            <option value="starter">Starter Only</option>
            <option value="past_due">Past Due Only</option>
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Body (HTML supported)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder="Email body content..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handlePreview}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors"
        >
          Preview & Send
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-2">Confirm Broadcast</h3>
            <p className="text-sm text-slate-400 mb-1">
              <strong className="text-white">Subject:</strong> {subject}
            </p>
            <p className="text-sm text-yellow-400 mb-4">
              You are about to email <strong>{recipientCount}</strong> broker
              {recipientCount !== 1 ? "s" : ""}.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-red-500"
              >
                {sending ? "Sending..." : "Send Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
