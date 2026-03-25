"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { QuotzalLogo } from "@/components/ui/logo";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
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
      <div className="flex-1 bg-white flex flex-col justify-center px-8 md:px-12 lg:px-16 py-12">
        <div className="max-w-sm w-full mx-auto">
          <div className="lg:hidden mb-10">
            <Link href="/"><QuotzalLogo size="md" /></Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your Quotzal account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-emerald-600 font-semibold hover:underline">
                Start free trial →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
