'use client';

import type { Violation, ViolationType } from '@/lib/types/intake-form';

interface ViolationEntryProps {
  violations: Violation[];
  onChange: (violations: Violation[]) => void;
  maxViolations?: number;
}

const VIOLATION_TYPES: { value: ViolationType; label: string }[] = [
  { value: 'speeding_1_10', label: 'Speeding (1-10 mph over)' },
  { value: 'speeding_11_20', label: 'Speeding (11-20 mph over)' },
  { value: 'speeding_21_plus', label: 'Speeding (21+ mph over)' },
  { value: 'dui_dwi', label: 'DUI / DWI' },
  { value: 'at_fault_accident', label: 'At-Fault Accident' },
  { value: 'not_at_fault_accident', label: 'Not-At-Fault Accident' },
  { value: 'reckless_driving', label: 'Reckless Driving' },
  { value: 'other_moving', label: 'Other Moving Violation' },
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
  return { type: 'speeding_1_10', month: '1', year: currentYear, notes: '' };
}

const INPUT_CLASS = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const SELECT_CLASS = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

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
        <div key={i}>
          {i > 0 && (
            <hr className="border-gray-200 mb-3" />
          )}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Violation {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeViolation(i)}
                className="text-xs text-red-500 hover:text-red-700"
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

            <div className="grid grid-cols-2 gap-2">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={v.notes}
                onChange={(e) => updateViolation(i, 'notes', e.target.value)}
                maxLength={200}
                placeholder="Briefly describe what happened (optional)"
                rows={2}
                className={`${INPUT_CLASS} resize-none`}
              />
              <p className="text-xs text-gray-400 text-right">
                {v.notes.length}/200
              </p>
            </div>
          </div>
        </div>
      ))}

      {violations.length < maxViolations && (
        <button
          type="button"
          onClick={addViolation}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Another Violation
        </button>
      )}
    </div>
  );
}
