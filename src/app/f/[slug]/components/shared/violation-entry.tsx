'use client';

import type { Violation, ViolationType } from '@/lib/types/intake-form';

interface ViolationEntryProps {
  violations: Violation[];
  onChange: (violations: Violation[]) => void;
  maxViolations?: number;
}

const VIOLATION_TYPES: { value: ViolationType; label: string }[] = [
  { value: 'speeding', label: 'Speeding' },
  { value: 'dui', label: 'DUI' },
  { value: 'at_fault_accident', label: 'At-fault accident' },
  { value: 'not_at_fault_accident', label: 'Not-at-fault accident' },
  { value: 'reckless_driving', label: 'Reckless driving' },
  { value: 'other', label: 'Other' },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function getYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(String(y));
  }
  return years;
}

function emptyViolation(): Violation {
  return { type: 'speeding', month: '', year: '', notes: '' };
}

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
          className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Incident {i + 1}
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
            onChange={(e) =>
              updateViolation(i, 'type', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Month</option>
              {MONTHS.map((m, mi) => (
                <option key={m} value={String(mi + 1)}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={v.year}
              onChange={(e) => updateViolation(i, 'year', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={v.notes}
            onChange={(e) => updateViolation(i, 'notes', e.target.value)}
            maxLength={200}
            placeholder="Notes (optional)"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 text-right">
            {v.notes.length}/200
          </p>
        </div>
      ))}

      {violations.length < maxViolations && (
        <button
          type="button"
          onClick={addViolation}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Another Incident
        </button>
      )}
    </div>
  );
}
