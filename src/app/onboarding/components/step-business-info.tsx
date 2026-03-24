"use client";

import { useState } from "react";

interface StepBusinessInfoProps {
  brokerageName: string;
  phone: string;
  address: string;
  onUpdate: (fields: {
    brokerageName?: string;
    phone?: string;
    address?: string;
  }) => void;
  onNext: () => void;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isPhoneComplete(value: string): boolean {
  return value.replace(/\D/g, "").length === 10;
}

export function StepBusinessInfo({
  brokerageName,
  phone,
  address,
  onUpdate,
  onNext,
}: StepBusinessInfoProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    onUpdate({ phone: formatted });
    if (errors.phone && isPhoneComplete(formatted)) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!brokerageName.trim()) {
      newErrors.brokerageName = "Brokerage name is required";
    }
    if (!isPhoneComplete(phone)) {
      newErrors.phone = "Valid 10-digit phone number is required";
    }
    if (!address.trim()) {
      newErrors.address = "Business address is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Business Information
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Tell us about your brokerage
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="brokerageName"
            className="block text-sm font-medium text-slate-700"
          >
            Brokerage Name <span className="text-red-500">*</span>
          </label>
          <input
            id="brokerageName"
            type="text"
            value={brokerageName}
            onChange={(e) => {
              onUpdate({ brokerageName: e.target.value });
              if (errors.brokerageName && e.target.value.trim()) {
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.brokerageName;
                  return next;
                });
              }
            }}
            placeholder="Acme Insurance Group"
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 ${
              errors.brokerageName
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
            }`}
          />
          {errors.brokerageName && (
            <p className="mt-1 text-sm text-red-600">{errors.brokerageName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-slate-700"
          >
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(555) 123-4567"
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 ${
              errors.phone
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-slate-700"
          >
            Business Address <span className="text-red-500">*</span>
          </label>
          <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => {
                onUpdate({ address: e.target.value });
                if (errors.address && e.target.value.trim()) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.address;
                    return next;
                  });
                }
              }}
              placeholder="123 Main St, City, State ZIP"
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 ${
                errors.address
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
              }`}
            />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
