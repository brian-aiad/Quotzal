"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/ui/auth-shell";
import { ProgressIndicator } from "./components/progress-indicator";
import { StepBusinessInfo } from "./components/step-business-info";
import { StepInsuranceTypes } from "./components/step-insurance-types";
import { StepBranding } from "./components/step-branding";
import type { InsuranceType } from "@/lib/types/intake-form";
import { Building2, Sparkles, Shield } from "lucide-react";

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

function OnboardingLeftContent() {
  return (
    <>
      <div className="max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-emerald-400 tracking-wide uppercase">Getting Started</span>
        </div>
        <h2 className="text-3xl text-white font-bold leading-tight mb-4">
          Set up your brokerage in minutes
        </h2>
        <p className="text-base text-gray-400 leading-relaxed mb-10">
          Three quick steps and your custom intake form is live. Start collecting quotes today.
        </p>

        <div className="space-y-4">
          {[
            { icon: Building2, label: "Add your business details" },
            { icon: Shield, label: "Choose your insurance types" },
            { icon: Sparkles, label: "Customize your brand" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center mt-12 pt-8 border-t border-white/10">
        {[
          { n: "2 min", l: "SETUP TIME" },
          { n: "Free", l: "30-DAY TRIAL" },
          { n: "Live", l: "INSTANT FORM" },
        ].map((s, i) => (
          <div
            key={s.n}
            className={`flex-1 ${i > 0 ? "border-l border-white/10 pl-6" : ""}`}
          >
            <div className="text-2xl font-bold text-white">{s.n}</div>
            <div className="text-[10px] font-medium tracking-widest text-gray-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </>
  );
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

      // Update status — broker_links already created by save-onboarding
      const { error: updateError } = await supabase
        .from("brokers")
        .update({ status: "trialing" })
        .eq("id", user.id);

      if (updateError) {
        setError("Failed to activate your account. Please contact support.");
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
    } else if (checkout === "cancelled") {
      // User cancelled Stripe checkout — stay on step 3 so they can retry
      setStep(3);
      setError("");
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
      <AuthShell leftContent={<OnboardingLeftContent />}>
        <div className="max-w-sm w-full mx-auto text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="mt-4 text-lg font-semibold text-gray-900">
            Setting up your account...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            This will only take a moment
          </p>
          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </AuthShell>
    );
  }

  const displaySlug = data.slug || generateSlugFromName(data.brokerageName) || "your-brokerage";

  return (
    <AuthShell leftContent={<OnboardingLeftContent />}>
      <div className="max-w-md w-full mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Set up your brokerage
        </h1>
        <p className="text-sm text-gray-500 mt-1 mb-8">
          Complete these steps to launch your intake form
        </p>

        <ProgressIndicator
          currentStep={step}
          totalSteps={3}
          stepLabels={STEP_LABELS}
        />

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
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
    </AuthShell>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <OnboardingWizard />
    </Suspense>
  );
}
