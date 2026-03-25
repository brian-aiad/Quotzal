'use client';

import type { InsuranceType } from '@/lib/types/intake-form';
import { INSURANCE_TYPE_OPTIONS } from '@/lib/constants/insurance-types';

interface StepInsuranceTypeProps {
  selected: InsuranceType | '';
  enabledTypes: InsuranceType[];
  onSelect: (type: InsuranceType) => void;
  brandColor?: string | null;
}

export function StepInsuranceType({
  selected,
  enabledTypes,
  onSelect,
  brandColor,
}: StepInsuranceTypeProps) {
  const accentColor = brandColor ?? '#059669';
  const filteredOptions = INSURANCE_TYPE_OPTIONS.filter((opt) =>
    enabledTypes.includes(opt.value)
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
        What type of insurance do you need?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Select one to get started.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {filteredOptions.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`relative flex flex-col items-center justify-center p-4 pt-5 pb-4 rounded-2xl border-2 transition-all duration-200 min-h-[96px] cursor-pointer text-center ${
                isSelected
                  ? 'shadow-md'
                  : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-sm'
              }`}
              style={
                isSelected
                  ? {
                      borderColor: accentColor,
                      backgroundColor: `${accentColor}0d`,
                      boxShadow: `0 4px 14px -3px ${accentColor}25`,
                    }
                  : undefined
              }
            >
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: accentColor }}
                >
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <span className="text-2xl mb-2">{opt.icon}</span>
              <span
                className={`text-xs font-semibold leading-tight ${
                  isSelected ? '' : 'text-gray-700'
                }`}
                style={isSelected ? { color: accentColor } : undefined}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
