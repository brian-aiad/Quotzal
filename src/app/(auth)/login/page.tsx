"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { QuotzalLogo } from "@/components/ui/logo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark brand */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-950 flex-col p-12 relative overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] login-grid" />

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px] animate-glow-pulse pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 pt-2">
          <QuotzalLogo size="md" dark />
        </div>

        {/* Testimonial */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md">
          <div className="text-8xl text-emerald-500/80 font-serif leading-none mb-2 -ml-2 select-none">&ldquo;</div>
          <p className="text-2xl text-white font-medium leading-snug mb-8">
            I used to spend 45 minutes per quote chasing info. Now I send one link and I&apos;m quoting in 10 minutes.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">JR</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Jane R.</p>
              <p className="text-xs text-gray-400">Independent Auto Broker · Texas</p>
            </div>
          </div>

          {/* Trust bar */}
          <div className="flex items-center gap-0 mt-12 pt-10 border-t border-white/10">
            {[
              { n: "500+", l: "BROKERS" },
              { n: "12k+", l: "QUOTES" },
              { n: "4.9★", l: "RATING" },
            ].map((s, i) => (
              <div key={s.n} className={`flex-1 ${i > 0 ? "border-l border-white/10 pl-6" : ""}`}>
                <div className="text-2xl font-bold text-white">{s.n}</div>
                <div className="text-[10px] font-medium tracking-widest text-gray-500 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Quotzal. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-6 sm:px-8 md:px-14 lg:px-20 py-12">
        <div className="max-w-md w-full animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link href="/"><QuotzalLogo size="md" /></Link>
          </div>

          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tighter mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-10">Sign in to your Quotzal account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:shadow-md transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-11 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:shadow-md transition-all duration-200"
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-shimmer mt-2 w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Signup CTA */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-1.5 bg-gray-50 rounded-full px-5 py-2.5">
              <span className="text-sm text-gray-500">Don&apos;t have an account?</span>
              <Link href="/signup" className="text-sm text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                Start free trial &rarr;
              </Link>
            </div>
          </div>

          {/* Trust badge */}
          <div className="mt-10 flex items-center justify-center gap-1.5 text-gray-300">
            <Lock size={12} />
            <span className="text-[11px] font-medium tracking-wide">SSL SECURED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
