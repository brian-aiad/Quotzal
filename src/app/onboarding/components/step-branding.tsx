"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface StepBrandingProps {
  plan: "starter" | "pro";
  logoUrl: string;
  brandColor: string;
  slug: string;
  onUpdate: (fields: { logoUrl?: string; brandColor?: string }) => void;
  onFinish: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function StepBranding({
  plan,
  logoUrl,
  brandColor,
  slug,
  onUpdate,
  onFinish,
  onBack,
  isSubmitting,
}: StepBrandingProps) {
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://quotzal.com').replace(/^https?:\/\//, '');
  const formUrl = `${baseUrl}/f/${slug}-link`;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError("Only PNG, JPG, and WebP files are allowed");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File must be under 2MB");
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUploadError("You must be logged in to upload");
        setUploading(false);
        return;
      }

      const ext = file.name.split(".").pop() ?? "png";
      const filePath = `${user.id}/logo.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) {
        setUploadError("Upload failed. Please try again.");
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(filePath);

      onUpdate({ logoUrl: publicUrl });
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    onUpdate({ logoUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle className="h-7 w-7 text-emerald-600" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          {plan === "pro" ? "Almost there!" : "You're all set!"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Your intake form is ready
        </p>
        <div className="mt-3 w-full rounded-xl bg-emerald-50/50 border border-emerald-200 px-4 py-3">
          <span className="text-xs text-gray-400 block mb-1">Your form link</span>
          <span className="text-sm font-mono font-semibold text-emerald-700">
            {formUrl}
          </span>
        </div>
      </div>

      {plan === "pro" && (
        <div className="space-y-5 rounded-xl border border-gray-200 bg-gray-50/50 p-5">
          <p className="text-sm font-medium text-gray-700">
            Personalize your intake form
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Logo
            </label>
            <p className="text-xs text-gray-400 mb-2">
              PNG, JPG, or WebP. Max 2MB.
            </p>

            {logoUrl ? (
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-6 text-sm text-gray-500 hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-600 transition-all duration-150 disabled:opacity-50 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Click to upload your logo
                  </>
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploadError && (
              <p className="mt-1.5 text-sm text-red-600">{uploadError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="brandColor"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor || "#2563eb"}
                onChange={(e) => onUpdate({ brandColor: e.target.value })}
                className="h-11 w-11 cursor-pointer rounded-xl border border-gray-200 p-1"
              />
              <input
                id="brandColor"
                type="text"
                value={brandColor}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^#[0-9a-fA-F]{0,6}$/.test(val)) {
                    onUpdate({ brandColor: val });
                  }
                }}
                placeholder="#2563eb"
                maxLength={7}
                className="w-32 h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          onClick={onFinish}
          disabled={isSubmitting}
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all duration-150 cursor-pointer hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none focus:ring-4 focus:ring-emerald-500/20 focus:outline-none"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Setting up your account...
            </span>
          ) : (
            "Start Free Trial"
          )}
        </button>

        {plan === "starter" && (
          <p className="text-xs text-gray-400 text-center">
            Want white-label branding?{" "}
            <a
              href="/dashboard/billing"
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Upgrade to Pro after signup
            </a>
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onBack}
        disabled={isSubmitting}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
      >
        &larr; Back
      </button>
    </div>
  );
}
