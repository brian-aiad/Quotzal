'use client';

import type { Driver, DriverRelationship, DriverRole } from '@/lib/types/intake-form';
import { US_STATES } from '@/lib/constants/states';
import { ViolationEntry } from './violation-entry';

interface DriverCardProps {
  driver: Driver;
  index: number;
  onChange: (driver: Driver) => void;
  onRemove?: () => void;
  mode: 'personal' | 'commercial';
  isPrimary?: boolean;
}

const RELATIONSHIPS: { value: DriverRelationship; label: string }[] = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

const ROLES: { value: DriverRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'employee', label: 'Employee' },
  { value: 'contractor', label: 'Contractor' },
];

export function DriverCard({
  driver,
  index,
  onChange,
  onRemove,
  mode,
  isPrimary,
}: DriverCardProps) {
  function update(field: string, value: unknown) {
    onChange({ ...driver, [field]: value });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">
          {isPrimary ? 'Primary Driver' : `Driver ${index + 1}`}
        </h4>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={driver.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            value={driver.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Number
          </label>
          <input
            type="text"
            value={driver.licenseNumber}
            onChange={(e) => update('licenseNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License State
          </label>
          <select
            value={driver.licenseState}
            onChange={(e) => update('licenseState', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {mode === 'personal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <select
              value={driver.relationship ?? ''}
              onChange={(e) => update('relationship', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === 'commercial' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={driver.role ?? ''}
              onChange={(e) => update('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* SR-22 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={driver.sr22Required}
            onChange={(e) => update('sr22Required', e.target.checked)}
            className="rounded border-gray-300"
          />
          SR-22 Required
        </label>
        {driver.sr22Required && (
          <select
            value={driver.sr22State ?? ''}
            onChange={(e) => update('sr22State', e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Violations */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={driver.hasViolations}
            onChange={(e) => {
              update('hasViolations', e.target.checked);
              if (!e.target.checked) {
                update('violations', []);
              }
            }}
            className="rounded border-gray-300"
          />
          Violations in last 5 years
        </label>
        {driver.hasViolations && (
          <ViolationEntry
            violations={driver.violations}
            onChange={(v) => update('violations', v)}
          />
        )}
      </div>
    </div>
  );
}
