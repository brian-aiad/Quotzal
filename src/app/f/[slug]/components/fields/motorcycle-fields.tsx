'use client';

import type { MotorcycleData } from '@/lib/types/intake-form';
import { VinInput } from '../shared/vin-input';
import { ViolationEntry } from '../shared/violation-entry';

interface MotorcycleFieldsProps {
  data: MotorcycleData;
  onChange: (data: MotorcycleData) => void;
}

const OWNERSHIP_OPTIONS = [
  { value: 'owned', label: 'Owned' },
  { value: 'financed', label: 'Financed' },
  { value: 'leased', label: 'Leased' },
];

const STORED_LOCATIONS = [
  { value: 'home_garage', label: 'Home Garage' },
  { value: 'storage_unit', label: 'Storage Unit' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'other', label: 'Other' },
];

export function MotorcycleFields({ data, onChange }: MotorcycleFieldsProps) {
  function update(field: keyof MotorcycleData, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Motorcycle Details
      </h3>

      <VinInput
        value={data.vin}
        year={data.year}
        make={data.make}
        model={data.model}
        onChange={(fields) => {
          onChange({
            ...data,
            vin: fields.vin,
            year: fields.year ?? data.year,
            make: fields.make ?? data.make,
            model: fields.model ?? data.model,
          });
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="text"
            value={data.year}
            onChange={(e) => update('year', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make
          </label>
          <input
            type="text"
            value={data.make}
            onChange={(e) => update('make', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            type="text"
            value={data.model}
            onChange={(e) => update('model', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ownership
          </label>
          <select
            value={data.ownership}
            onChange={(e) => update('ownership', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select</option>
            {OWNERSHIP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {(data.ownership === 'financed' || data.ownership === 'leased') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lienholder Name
            </label>
            <input
              type="text"
              value={data.lienholderName ?? ''}
              onChange={(e) => update('lienholderName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stored Location
          </label>
          <select
            value={data.storedLocation}
            onChange={(e) => update('storedLocation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select</option>
            {STORED_LOCATIONS.map((sl) => (
              <option key={sl.value} value={sl.value}>
                {sl.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coverage Type
          </label>
          <select
            value={data.coverageType}
            onChange={(e) => update('coverageType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select</option>
            <option value="full">Full Coverage</option>
            <option value="liability_only">Liability Only</option>
          </select>
        </div>
      </div>

      {/* Violations */}
      <div className="space-y-2 pt-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.hasViolations}
            onChange={(e) => {
              update('hasViolations', e.target.checked);
              if (!e.target.checked) update('violations', []);
            }}
            className="rounded border-gray-300"
          />
          Violations in last 5 years?
        </label>
        {data.hasViolations && (
          <ViolationEntry
            violations={data.violations}
            onChange={(v) => update('violations', v)}
          />
        )}
      </div>
    </div>
  );
}
