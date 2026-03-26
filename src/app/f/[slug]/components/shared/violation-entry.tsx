'use client';

import type { Violation, ViolationType } from '@/lib/types/intake-form';

interface ViolationEntryProps {
  violations: Violation[];
  onChange: (violations: Violation[]) => void;
  maxViolations?: number;
}

const VIOLATION_TYPES: { value: ViolationType; label: string }[] = [
  { value: 'speeding', label: 'Speeding' },
  { value: 'ran_red_light', label: 'Ran Red Light' },
  { value: 'ran_stop_sign', label: 'Ran Stop Sign' },
  { value: 'failure_to_yield', label: 'Failure to Yield' },
  { value: 'unsafe_lane_change', label: 'Unsafe Lane Change' },
  { value: 'following_too_closely', label: 'Following Too Closely / Tailgating' },
  { value: 'reckless_driving', label: 'Reckless Driving' },
  { value: 'at_fault_accident', label: 'At-Fault Accident' },
  { value: 'not_at_fault_accident', label: 'Not-At-Fault Accident' },
  { value: 'dui_dwi', label: 'DUI / DWI' },
  { value: 'distracted_driving', label: 'Distracted Driving / Cell Phone' },
  { value: 'parking_violation', label: 'Parking Violation' },
  { value: 'other', label: 'Other' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(String(y));
  }
  return years;
}

export function emptyViolation(): Violation {
  const currentYear = String(new Date().getFullYear());
  return { type: 'speeding', month: '1', year: currentYear, notes: '' };
}

const SELECT_CLASS = 'w-full h-11 px-4 pr-10 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 appearance-none bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E")]';

export function ViolationEntry({
  violations,
  onChange,
  maxViolations = 5,
}: ViolationEntryProps) {
  const years = getYearOptions();

  function updateViolation(index: number, field: keyof Violation, value: string) {
    const updated = [...violations];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  function addViolation() {
    if (violations.length < maxViolations) {
      onChange([...violations, emptyViolation()]);
    }
  }

  function removeViolation(index: number) {
    onChange(violations.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {violations.map((v, i) => (
        <div
          key={i}
          className="border-l-4 border-amber-400 bg-amber-50/50 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              Violation {i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeViolation(i)}
              className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              Remove
            </button>
          </div>

          <select
            value={v.type}
            onChange={(e) => updateViolation(i, 'type', e.target.value)}
            className={SELECT_CLASS}
          >
            {VIOLATION_TYPES.map((vt) => (
              <option key={vt.value} value={vt.value}>
                {vt.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <div className="w-[60%]">
              <select
                value={v.month}
                onChange={(e) => updateViolation(i, 'month', e.target.value)}
                className={SELECT_CLASS}
              >
                {MONTHS.map((m, mi) => (
                  <option key={m} value={String(mi + 1)}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-[40%]">
              <select
                value={v.year}
                onChange={(e) => updateViolation(i, 'year', e.target.value)}
                className={SELECT_CLASS}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="relative">
              <textarea
                value={v.notes}
                onChange={(e) => updateViolation(i, 'notes', e.target.value)}
                maxLength={200}
                placeholder="Briefly describe what happened (optional)"
                rows={2}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 resize-none"
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">
                {v.notes.length}/200
              </span>
            </div>
          </div>
        </div>
      ))}

      {violations.length < maxViolations && (
        <button
          type="button"
          onClick={addViolation}
          className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Another Violation
        </button>
      )}
    </div>
  );
}
