"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { QuotzalLogo } from "@/components/ui/logo";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-400">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro'>('starter');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan === 'starter' || plan === 'pro') {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    localStorage.setItem("quotzal_selected_plan", selectedPlan);

    setEmailSent(true);
    setLoading(false);
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    await supabase.auth.resend({ type: "signup", email });
    setResendCooldown(60);
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-sm text-slate-600 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
          </p>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark brand */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-950 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="relative z-10">
          <QuotzalLogo size="md" dark />
        </div>
        <div className="relative z-10 max-w-sm">
          <div className="text-5xl text-emerald-500 font-serif leading-none mb-4 select-none">&ldquo;</div>
          <p className="text-xl text-white font-medium leading-relaxed mb-6">
            I used to spend 45 minutes per quote chasing info. Now I send one link and I&apos;m quoting in 10 minutes.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">JR</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Jane R.</p>
              <p className="text-xs text-gray-400">Independent Auto Broker · Texas</p>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Quotzal. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 bg-white flex flex-col justify-center px-8 md:px-14 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden mb-10">
            <Link href="/"><QuotzalLogo size="md" /></Link>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">Start your free trial</h1>
          <p className="text-emerald-600 text-sm font-medium mb-8">30 days free — no credit card required</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mb-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Choose your plan</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'starter' as const, label: 'Starter', price: '$19/mo' },
                  { value: 'pro' as const, label: 'Pro', price: '$39/mo' },
                ] as const).map((plan) => (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan.value);
                      localStorage.setItem('quotzal_selected_plan', plan.value);
                    }}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                      selectedPlan === plan.value
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    <div>{plan.label}</div>
                    <div className={`text-xs font-normal mt-0.5 ${selectedPlan === plan.value ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {plan.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
