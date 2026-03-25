"use client";

import { useState } from "react";
import Link from "next/link";
import { QuotzalLogo } from "@/components/ui/logo";

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
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-sm border border-gray-800 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Your demo link is ready!
          </h1>
          <p className="text-gray-400 mb-6">
            Check your email at <strong className="text-gray-200">{sentEmail}</strong> for your personalized demo link.
          </p>
          <Link
            href="/signup"
            className="inline-block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors mb-4"
          >
            Sign up free →
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-400 font-medium"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-950 flex-col p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="relative z-10 pt-0">
          <Link href="/"><QuotzalLogo size="md" dark /></Link>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            See exactly what your clients will see.
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            We&apos;ll create a live intake form with your brokerage name. Share the link — clients fill it out in under 3 minutes.
          </p>
          <div className="space-y-4">
            {[
              { icon: "🔗", title: "A real, live form", desc: "Not a screenshot — an actual form you can share." },
              { icon: "📱", title: "Works on any device", desc: "Mobile-optimized. Clients fill it out from their phone." },
              { icon: "📧", title: "See the email", desc: "You'll get a real notification showing what brokers receive." },
            ].map(item => (
              <div key={item.title} className="flex gap-3">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Quotzal · No account required</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-white flex flex-col justify-center px-8 md:px-14 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-10">
            <Link href="/"><QuotzalLogo size="md" /></Link>
          </div>
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Free · No account needed
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mt-3 mb-1">Get your demo link</h1>
          <p className="text-sm text-gray-500 mb-8">See the live form your clients will fill out.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="brokerageName" className="block text-sm font-semibold text-gray-700 mb-1.5">Brokerage Name</label>
              <input id="brokerageName" type="text" required value={form.brokerageName} onChange={(e) => setForm({ ...form, brokerageName: e.target.value })}
                className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" placeholder="ABC Insurance" />
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
              <input id="fullName" type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" placeholder="John Smith" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" placeholder="john@abcinsurance.com" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
              <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" placeholder="(555) 123-4567" />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm">
              {loading ? 'Creating your link...' : 'Get My Demo Link →'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Ready to go live?{' '}
              <Link href="/signup" className="text-emerald-600 font-semibold hover:underline">Start your free trial →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
