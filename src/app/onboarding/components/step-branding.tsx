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

  const formUrl = `quotzal.com/f/${slug}-link`;

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
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mx-auto">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-900">
          {plan === "pro" ? "Almost there!" : "You're all set!"}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Your intake form is ready
        </p>
        <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
          <span className="text-sm text-slate-500 block mb-1">Your form link:</span>
          <span className="text-sm font-mono font-semibold text-emerald-700">
            {formUrl}
          </span>
        </div>
      </div>

      {plan === "pro" && (
        <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-700">
            Personalize your intake form
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Logo
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              PNG, JPG, or WebP. Max 2MB.
            </p>

            {logoUrl ? (
              <div className="mt-2 flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
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
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-sm text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50"
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
              <p className="mt-1 text-sm text-red-600">{uploadError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="brandColor"
              className="block text-sm font-medium text-slate-700"
            >
              Brand Color
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="color"
                value={brandColor || "#2563eb"}
                onChange={(e) => onUpdate({ brandColor: e.target.value })}
                className="h-10 w-10 cursor-pointer rounded border border-slate-300 p-0.5"
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
                className="block w-32 rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onFinish}
          disabled={isSubmitting}
          className="w-full rounded-md bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Setting up your account..." : "Start Free Trial"}
        </button>

        {plan === "starter" && (
          <p className="text-xs text-slate-400">
            Want white-label branding?{" "}
            <a
              href="/dashboard/billing"
              className="text-emerald-500 hover:text-emerald-600 underline"
            >
              Upgrade to Pro after signup
            </a>
          </p>
        )}
      </div>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50"
        >
          &larr; Back
        </button>
      </div>
    </div>
  );
}
