"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Gift, Check, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/ui/auth-shell";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-slate-400">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}

interface PlanOption {
  value: "starter" | "pro";
  label: string;
  price: string;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    value: "starter",
    label: "Starter",
    price: "$19",
    features: ["1 intake form link", "Email notifications", "CSV export"],
  },
  {
    value: "pro",
    label: "Pro",
    price: "$39",
    features: ["Everything in Starter", "Custom branding & logo", "Unlimited link aliases"],
  },
];

function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(4, score);
}

const STRENGTH_CONFIG: { label: string; color: string }[] = [
  { label: "", color: "" },
  { label: "Weak", color: "bg-red-500" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Good", color: "bg-emerald-500" },
  { label: "Strong", color: "bg-emerald-500" },
];

function SignupForm() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro">("starter");
  const [shaking, setShaking] = useState(false);

  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan === "starter" || plan === "pro") {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
      return;
    }

    localStorage.setItem("quotzal_selected_plan", selectedPlan);

    // If a session was returned, email confirmation is disabled — go straight to onboarding
    if (data.session) {
      window.location.href = "/onboarding";
      return;
    }

    // No session means email confirmation is required
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
      <AuthShell>
        <div className="max-w-sm w-full mx-auto text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-sm text-gray-500 mb-6">
            We sent a confirmation link to <strong className="text-gray-700">{email}</strong>. Click the link to activate your account.
          </p>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend email"}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="max-w-[26rem] w-full mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Start your free trial</h1>
        <p className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium mt-1 mb-8">
          <Gift size={14} />
          30 days free &middot; No credit card required
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

          {/* Plan selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose your plan</label>
            <div className="grid grid-cols-2 gap-3">
              {PLANS.map((plan) => {
                const selected = selectedPlan === plan.value;
                return (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan.value);
                      localStorage.setItem("quotzal_selected_plan", plan.value);
                    }}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer ${
                      selected
                        ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <div className="text-sm font-bold text-gray-900">{plan.label}</div>
                    <div className="mt-0.5">
                      <span className="text-lg font-bold text-gray-900">{plan.price}</span>
                      <span className="text-sm text-gray-400">/mo</span>
                    </div>
                    <ul className="mt-2 space-y-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Check size={10} className="text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 text-sm md:text-sm text-base border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 pr-11 text-sm md:text-sm text-base border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                        seg <= strength ? STRENGTH_CONFIG[strength].color : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-xs ${strength <= 1 ? "text-red-500" : strength <= 2 ? "text-amber-500" : "text-emerald-600"}`}>
                  {STRENGTH_CONFIG[strength].label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
            <div className="relative">
              <input
                id="signup-confirm"
                type={showConfirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 px-4 pr-11 text-sm md:text-sm text-base border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
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
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Terms */}
        <p className="mt-4 text-center text-xs text-gray-400">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-gray-500 underline hover:text-gray-700 transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-gray-500 underline hover:text-gray-700 transition-colors">Privacy Policy</Link>
        </p>

        {/* Sign in link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
            Sign in
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
