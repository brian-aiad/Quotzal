"use client";

import { useState } from "react";
import { INSURANCE_TYPE_OPTIONS } from "@/lib/constants/insurance-types";
import type { InsuranceType } from "@/lib/types/intake-form";
import { Check } from "lucide-react";

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
    <div className="space-y-5">
      <div>
        <p className="text-sm text-gray-500">
          Select the types of insurance you offer. Your intake form will only
          show the types you choose.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          You can change this anytime in your dashboard
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {INSURANCE_TYPE_OPTIONS.map((option) => {
          const isSelected = selectedTypes.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleType(option.value)}
              className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-3.5 text-center transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
              <span className="text-xl">{option.icon}</span>
              <span
                className={`text-xs font-medium ${
                  isSelected ? "text-emerald-700" : "text-gray-700"
                }`}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-400">
        {selectedTypes.length} of {INSURANCE_TYPE_OPTIONS.length} selected
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-11 border border-gray-200 bg-white text-gray-700 font-medium text-sm rounded-xl transition-all duration-150 cursor-pointer hover:bg-gray-50 hover:border-gray-300 focus:ring-4 focus:ring-gray-500/10 focus:outline-none"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-all duration-150 cursor-pointer hover:-translate-y-px hover:shadow-lg hover:shadow-emerald-500/25 active:translate-y-0 active:shadow-sm focus:ring-4 focus:ring-emerald-500/20 focus:outline-none"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
