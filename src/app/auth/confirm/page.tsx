"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Handles hash-based Supabase auth flows where tokens arrive as URL fragments
 * (#access_token=...&refresh_token=...&type=email_change).
 * This is needed because URL hash fragments are not sent to the server.
 */
export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function handleHashAuth() {
      const hash = window.location.hash.substring(1);
      if (!hash) {
        // No hash — redirect to dashboard
        router.replace("/dashboard");
        return;
      }

      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (!accessToken || !refreshToken) {
        // Check for error in hash
        const errorDesc = params.get("error_description");
        if (errorDesc) {
          if (type === "email_change") {
            router.replace("/dashboard/settings?error=link_expired");
            return;
          }
          setStatus("error");
          setErrorMessage(errorDesc.replace(/\+/g, " "));
          return;
        }
        router.replace("/dashboard");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        if (type === "email_change") {
          router.replace("/dashboard/settings?error=link_expired");
          return;
        }
        setStatus("error");
        setErrorMessage("Session could not be established. Please try again.");
        return;
      }

      // Route based on type
      switch (type) {
        case "signup":
          router.replace("/onboarding");
          break;
        case "recovery":
          router.replace("/dashboard");
          break;
        case "email_change":
          router.replace("/dashboard/settings?success=email_changed");
          break;
        default:
          router.replace("/dashboard");
      }
    }

    handleHashAuth();
  }, [router]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full mx-4 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Confirmation failed</h1>
          <p className="text-sm text-gray-600 mb-6">
            {errorMessage || "This link has expired or is invalid. Please request a new one."}
          </p>
          <a
            href="/dashboard/settings"
            className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Go to Settings
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-600">Confirming your request...</p>
      </div>
    </div>
  );
}
