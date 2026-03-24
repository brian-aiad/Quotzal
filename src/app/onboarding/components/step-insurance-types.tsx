"use client";

import { useState } from "react";
import { INSURANCE_TYPE_OPTIONS } from "@/lib/constants/insurance-types";
import type { InsuranceType } from "@/lib/types/intake-form";

interface StepInsuranceTypesProps {
  selectedTypes: InsuranceType[];
  onUpdate: (types: InsuranceType[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepInsuranceTypes({
  selectedTypes,
  onUpdate,
  onNext,
  onBack,
}: StepInsuranceTypesProps) {
  const [error, setError] = useState("");

  const toggleType = (type: InsuranceType) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    onUpdate(updated);
    if (error && updated.length > 0) {
      setError("");
    }
  };

  const handleNext = () => {
    if (selectedTypes.length === 0) {
      setError("Select at least one insurance type");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Insurance Types
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Select the types of insurance you offer. Your intake form will only
          show the types you choose.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          You can change this anytime in your dashboard
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {INSURANCE_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedTypes.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleType(option.value)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <span
                className={`text-xs font-medium sm:text-sm ${
                  isSelected ? "text-emerald-700" : "text-slate-700"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-sm text-slate-500">
        {selectedTypes.length} of {INSURANCE_TYPE_OPTIONS.length} selected
      </p>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-slate-300 bg-white px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Back
        </button>
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
