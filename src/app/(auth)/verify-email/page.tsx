"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, [supabase.auth]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleResend() {
    if (resendCooldown > 0 || !email) return;
    await supabase.auth.resend({ type: "signup", email });
    setResendCooldown(60);
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Verify your email</h2>
      <p className="text-sm text-slate-600 mb-6">
        {email ? (
          <>We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.</>
        ) : (
          "Please check your email for a confirmation link."
        )}
      </p>
      <button
        onClick={handleResend}
        disabled={resendCooldown > 0 || !email}
        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 disabled:cursor-not-allowed"
      >
        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend confirmation email"}
      </button>
    </div>
  );
}
