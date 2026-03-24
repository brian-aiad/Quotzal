"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProgressIndicator } from "./components/progress-indicator";
import { StepBusinessInfo } from "./components/step-business-info";
import { StepInsuranceTypes } from "./components/step-insurance-types";
import { StepBranding } from "./components/step-branding";
import type { InsuranceType } from "@/lib/types/intake-form";

const STEP_LABELS = ["Business Info", "Insurance Types", "Branding"];
const ONBOARDING_STORAGE_KEY = "quotzal_onboarding_state";

interface OnboardingData {
  brokerageName: string;
  phone: string;
  address: string;
  slug: string;
  insuranceTypes: InsuranceType[];
  plan: "starter" | "pro";
  logoUrl: string;
  brandColor: string;
}

function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

async function findAvailableSlug(baseName: string): Promise<string> {
  const baseSlug = generateSlugFromName(baseName);

  if (baseSlug.length < 3) {
    const padded = baseSlug + "brokerage".slice(0, 3 - baseSlug.length);
    return findAvailableSlug(padded);
  }

  const res = await fetch(
    `/api/check-slug?slug=${encodeURIComponent(baseSlug)}`
  );
  const data = (await res.json()) as { available: boolean };

  if (data.available) {
    return baseSlug;
  }

  for (let i = 2; i <= 99; i++) {
    const candidate = `${baseSlug}-${i}`.slice(0, 30);
    const checkRes = await fetch(
      `/api/check-slug?slug=${encodeURIComponent(candidate)}`
    );
    const checkData = (await checkRes.json()) as { available: boolean };

    if (checkData.available) {
      return candidate;
    }
  }

  const fallback = `${baseSlug}-${Date.now().toString(36)}`.slice(0, 30);
  return fallback;
}

function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    brokerageName: "",
    phone: "",
    address: "",
    slug: "",
    insuranceTypes: [],
    plan: "starter",
    logoUrl: "",
    brandColor: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { step: number; data: OnboardingData };
        if (parsed.data && parsed.step) {
          setData(parsed.data);
          setStep(parsed.step);
          setInitialized(true);
          return;
        }
      } catch {
        // ignore malformed data
      }
    }

    const stored = localStorage.getItem("quotzal_selected_plan");
    if (stored === "pro" || stored === "starter") {
      setData((prev) => ({ ...prev, plan: stored }));
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ step, data })
    );
  }, [step, data, initialized]);

  const handleCheckoutSuccess = useCallback(async () => {
    setCheckoutProcessing(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: broker, error: fetchError } = await supabase
        .from("brokers")
        .select("slug")
        .eq("id", user.id)
        .single();

      if (fetchError || !broker) {
        setError("Could not find your account. Please try again.");
        setCheckoutProcessing(false);
        return;
      }

      const linkSlug = `${broker.slug}-link`;

      const { error: updateError } = await supabase
        .from("brokers")
        .update({ status: "trialing" })
        .eq("id", user.id);

      if (updateError) {
        setError("Failed to activate your account. Please contact support.");
        setCheckoutProcessing(false);
        return;
      }

      const { error: linkError } = await supabase
        .from("broker_links")
        .insert({
          broker_id: user.id,
          slug: linkSlug,
          label: "Primary Link",
          is_primary: true,
          is_active: true,
        });

      if (linkError) {
        setError("Failed to create your form link. Please contact support.");
        setCheckoutProcessing(false);
        return;
      }

      localStorage.removeItem("quotzal_selected_plan");
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setCheckoutProcessing(false);
    }
  }, [router]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      handleCheckoutSuccess();
    }
  }, [searchParams, handleCheckoutSuccess]);

  const updateData = useCallback(
    (fields: Partial<OnboardingData>) => {
      setData((prev) => ({ ...prev, ...fields }));
    },
    []
  );

  const handleFinish = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const slug = await findAvailableSlug(data.brokerageName);

      const saveRes = await fetch("/api/save-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brokerageName: data.brokerageName,
          phone: data.phone,
          address: data.address,
          slug,
          insuranceTypes: data.insuranceTypes,
          plan: data.plan,
          logoUrl: data.logoUrl || undefined,
          brandColor: data.brandColor || undefined,
        }),
      });

      if (!saveRes.ok) {
        const saveData = (await saveRes.json()) as { error: string };
        setError(saveData.error || "Failed to save your information");
        setIsSubmitting(false);
        return;
      }

      setData((prev) => ({ ...prev, slug }));

      const stripeCustomerRes = await fetch("/api/create-stripe-customer", {
        method: "POST",
      });

      if (!stripeCustomerRes.ok) {
        const custData = (await stripeCustomerRes.json()) as { error: string };
        setError(custData.error || "Failed to set up billing");
        setIsSubmitting(false);
        return;
      }

      const checkoutRes = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: data.plan }),
      });

      if (!checkoutRes.ok) {
        const checkData = (await checkoutRes.json()) as { error: string };
        setError(checkData.error || "Failed to create checkout session");
        setIsSubmitting(false);
        return;
      }

      const { url } = (await checkoutRes.json()) as { url: string };

      if (url) {
        window.location.href = url;
      } else {
        setError("Could not redirect to checkout. Please try again.");
        setIsSubmitting(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (checkoutProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="mt-4 text-lg font-medium text-slate-900">
            Setting up your account...
          </p>
          <p className="mt-1 text-sm text-slate-500">
            This will only take a moment
          </p>
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const displaySlug = data.slug || generateSlugFromName(data.brokerageName) || "your-brokerage";

  return (
    <div className="flex min-h-screen items-start justify-center bg-slate-50 px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome to Quotzal
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Let&apos;s get your brokerage set up in a few steps
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <ProgressIndicator
            currentStep={step}
            totalSteps={3}
            stepLabels={STEP_LABELS}
          />

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {step === 1 && (
            <StepBusinessInfo
              brokerageName={data.brokerageName}
              phone={data.phone}
              address={data.address}
              onUpdate={(fields) => updateData(fields)}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepInsuranceTypes
              selectedTypes={data.insuranceTypes}
              onUpdate={(types) => updateData({ insuranceTypes: types })}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <StepBranding
              plan={data.plan}
              logoUrl={data.logoUrl}
              brandColor={data.brandColor}
              slug={displaySlug}
              onUpdate={(fields) => updateData(fields)}
              onFinish={handleFinish}
              onBack={() => setStep(2)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}
