"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/ui/auth-shell";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <AuthShell>
      <div className="max-w-sm w-full mx-auto">
        {sent ? (
          /* Success state */
          <div className="text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
            <p className="text-sm text-gray-500 mb-8">
              We sent a reset link to <strong className="text-gray-700">{email}</strong>
            </p>
            <Link
              href="/login"
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Back to sign in &rarr;
            </Link>
          </div>
        ) : (
          /* Form state */
          <>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6"
            >
              <ChevronLeft size={16} />
              Back to sign in
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reset your password</h1>
            <p className="text-sm text-gray-500 mt-1 mb-8">
              Enter your email and we&apos;ll send you a reset link.
            </p>

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
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 text-sm md:text-sm text-base border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                  placeholder="you@example.com"
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
                    Sending...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Remember your password?{" "}
              <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                Sign in
              </Link>
            </p>

            {/* Trust badge */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-gray-400">
              <ShieldCheck size={14} className="text-gray-300" />
              <span className="text-xs">SSL secured</span>
            </div>
          </>
        )}
      </div>
    </AuthShell>
  );
}
