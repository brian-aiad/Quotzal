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

const INPUT_BASE =
  "w-full h-11 px-4 text-sm border rounded-xl bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-150 focus:outline-none";
const INPUT_NORMAL =
  `${INPUT_BASE} border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10`;
const INPUT_ERROR =
  `${INPUT_BASE} border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10`;

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
    <div className="space-y-5">
      <div>
        <label
          htmlFor="brokerageName"
          className="block text-sm font-medium text-gray-700 mb-1.5"
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
          className={errors.brokerageName ? INPUT_ERROR : INPUT_NORMAL}
        />
        {errors.brokerageName && (
          <p className="mt-1.5 text-sm text-red-600">{errors.brokerageName}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="(555) 123-4567"
          className={errors.phone ? INPUT_ERROR : INPUT_NORMAL}
        />
        {errors.phone && (
          <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-1.5"
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
          className={errors.address ? INPUT_ERROR : INPUT_NORMAL}
        />
        {errors.address && (
          <p className="mt-1.5 text-sm text-red-600">{errors.address}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all duration-150 cursor-pointer hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 active:translate-y-0 active:shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:outline-none"
      >
        Continue
      </button>
    </div>
  );
}
