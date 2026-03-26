'use client';

import type { RvData, RvClass } from '@/lib/types/intake-form';
import { VinInput } from '../shared/vin-input';
import { ViolationEntry } from '../shared/violation-entry';

interface RvFieldsProps {
  data: RvData;
  onChange: (data: RvData) => void;
}

const RV_CLASSES: { value: RvClass; label: string }[] = [
  { value: 'class_a', label: 'Class A' },
  { value: 'class_b', label: 'Class B' },
  { value: 'class_c', label: 'Class C' },
  { value: 'travel_trailer', label: 'Travel Trailer' },
  { value: '5th_wheel', label: '5th Wheel' },
  { value: 'other', label: 'Other' },
];

const OWNERSHIP_OPTIONS = [
  { value: 'owned', label: 'Owned' },
  { value: 'financed', label: 'Financed' },
  { value: 'leased', label: 'Leased' },
];

const STORED_LOCATIONS = [
  { value: 'home', label: 'Home' },
  { value: 'storage_facility', label: 'Storage Facility' },
  { value: 'rv_park', label: 'RV Park' },
  { value: 'other', label: 'Other' },
];

export function RvFields({ data, onChange }: RvFieldsProps) {
  function update(field: keyof RvData, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">
        RV / Motorhome Details
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
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Year
          </label>
          <input
            type="number"
            value={data.year}
            onChange={(e) => update('year', e.target.value.slice(0, 4))}
            min={1900}
            max={new Date().getFullYear() + 1}
            placeholder="2024"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Make
          </label>
          <input
            type="text"
            value={data.make}
            onChange={(e) => update('make', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Model
          </label>
          <input
            type="text"
            value={data.model}
            onChange={(e) => update('model', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            RV Class
          </label>
          <select
            value={data.rvClass}
            onChange={(e) => update('rvClass', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Select</option>
            {RV_CLASSES.map((rc) => (
              <option key={rc.value} value={rc.value}>
                {rc.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Ownership
          </label>
          <select
            value={data.ownership}
            onChange={(e) => update('ownership', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lienholder Name
            </label>
            <input
              type="text"
              value={data.lienholderName ?? ''}
              onChange={(e) => update('lienholderName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Stored Location
          </label>
          <select
            value={data.storedLocation}
            onChange={(e) => update('storedLocation', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Coverage Type
          </label>
          <select
            value={data.coverageType}
            onChange={(e) => update('coverageType', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Select</option>
            <option value="full">Full Coverage</option>
            <option value="liability_only">Liability Only</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={data.isFullTimeResidence}
            onChange={(e) =>
              update('isFullTimeResidence', e.target.checked)
            }
            className="rounded border-slate-300"
          />
          Full-time residence?
        </label>

        <div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={data.hasViolations}
              onChange={(e) => {
                update('hasViolations', e.target.checked);
                if (!e.target.checked) update('violations', []);
              }}
              className="rounded border-slate-300"
            />
            Violations in last 5 years?
          </label>
          {data.hasViolations && (
            <div className="mt-2">
              <ViolationEntry
                violations={data.violations}
                onChange={(v) => update('violations', v)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
