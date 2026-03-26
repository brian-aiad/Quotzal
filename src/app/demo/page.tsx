"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, Smartphone, Mail, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/ui/auth-shell";

export default function DemoPage() {
  const [form, setForm] = useState({
    brokerageName: "",
    fullName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [shaking, setShaking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/demo/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      setSentEmail(data.email);
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
    setLoading(false);
  }

  const FEATURES = [
    {
      icon: Link2,
      title: "A real, live form",
      desc: "Not a screenshot — an actual form you can share.",
    },
    {
      icon: Smartphone,
      title: "Works on any device",
      desc: "Mobile-optimized. Clients fill it out from their phone.",
    },
    {
      icon: Mail,
      title: "See the email",
      desc: "You\u2019ll get a real notification showing what brokers receive.",
    },
  ];

  const demoLeftContent = (
    <>
      <div className="max-w-sm">
        <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
          See exactly what your clients will see.
        </h2>
        <p className="text-gray-400 leading-relaxed mb-8">
          We&apos;ll create a live intake form with your brokerage name. Share the link — clients fill it out in under 3 minutes.
        </p>
        <div className="space-y-4">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  if (success) {
    return (
      <AuthShell leftContent={demoLeftContent}>
        <div className="flex flex-col items-center justify-center text-center max-w-sm mx-auto">
          {/* Animated check circle */}
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Your demo link is ready!
          </h1>

          {/* Email confirmation */}
          <p className="text-gray-500 text-sm mt-2 mb-8">
            Check <span className="font-semibold text-gray-700">{sentEmail}</span> — your personalized form link should arrive in under a minute.
          </p>

          {/* What to expect next */}
          <div className="w-full text-left space-y-3 mb-8">
            {[
              "Open the link in your email",
              "See exactly what your clients will fill out",
              "Ready to go live? Start your free trial"
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-emerald-600">{i + 1}</span>
                </div>
                <span className="text-sm text-gray-600">{step}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a href="/signup" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center transition-colors duration-150">
            Start free trial →
          </a>

          {/* Back link */}
          <a href="/" className="mt-4 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            ← Back to home
          </a>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell leftContent={demoLeftContent}>
      <div className="max-w-sm w-full mx-auto">
        {/* Live badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Free &middot; No account needed
          </span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Get your demo link</h1>
        <p className="text-sm text-gray-500 mt-1 mb-8">See the live form your clients will fill out.</p>

        <form
          onSubmit={handleSubmit}
          className={`space-y-5 ${shaking ? "animate-shake" : ""}`}
        >
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="demo-brokerage" className="block text-sm font-medium text-gray-700 mb-1.5">Brokerage Name</label>
            <input
              id="demo-brokerage"
              type="text"
              required
              value={form.brokerageName}
              onChange={(e) => setForm({ ...form, brokerageName: e.target.value })}
              maxLength={100}
              className="w-full h-11 px-4 text-sm md:text-sm text-base border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
              placeholder="ABC Insurance"
            />
          </div>

          <div>
            <label htmlFor="demo-name" className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
            <input
              id="demo-name"
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              maxLength={80}
              className="w-full h-11 px-4 text-sm md:text-sm text-base border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label htmlFor="demo-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              id="demo-email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-11 px-4 text-sm md:text-sm text-base border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
              placeholder="john@abcinsurance.com"
            />
          </div>

          <div>
            <label htmlFor="demo-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="demo-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                if (digits.length === 0) { setForm({ ...form, phone: '' }); return; }
                let formatted = '(' + digits.slice(0, 3);
                if (digits.length >= 3) formatted += ') ';
                if (digits.length > 3) formatted += digits.slice(3, 6);
                if (digits.length > 6) formatted += '-' + digits.slice(6);
                setForm({ ...form, phone: formatted });
              }}
              maxLength={14}
              className="w-full h-11 px-4 text-sm md:text-sm text-base border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
              placeholder="(555) 123-4567"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all duration-150 cursor-pointer hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none focus:ring-4 focus:ring-emerald-500/20 focus:outline-none"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating your link...
              </span>
            ) : (
              "Get My Demo Link \u2192"
            )}
          </button>
        </form>

        {/* CTA */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Ready to go live?{" "}
          <Link href="/signup" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
            Start your free trial &rarr;
          </Link>
        </p>

        {/* Trust badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-gray-400">
          <ShieldCheck size={14} className="text-gray-300" />
          <span className="text-xs">SSL secured</span>
        </div>
      </div>
    </AuthShell>
  );
}
