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
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        What type of insurance do you need?
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Select one to get started.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filteredOptions.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all text-center hover:shadow-md ${
                isSelected
                  ? 'shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
              style={
                isSelected
                  ? {
                      borderColor: accentColor,
                      backgroundColor: `${accentColor}08`,
                    }
                  : undefined
              }
            >
              <span className="text-2xl">{opt.icon}</span>
              <span
                className={`text-sm font-medium ${
                  isSelected ? '' : 'text-slate-700'
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
