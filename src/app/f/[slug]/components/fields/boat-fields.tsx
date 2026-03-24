'use client';

import type { BoatData, HullType } from '@/lib/types/intake-form';

interface BoatFieldsProps {
  data: BoatData;
  onChange: (data: BoatData) => void;
}

const HULL_TYPES: { value: HullType; label: string }[] = [
  { value: 'fiberglass', label: 'Fiberglass' },
  { value: 'aluminum', label: 'Aluminum' },
  { value: 'wood', label: 'Wood' },
  { value: 'inflatable', label: 'Inflatable' },
  { value: 'other', label: 'Other' },
];

const STORED_LOCATIONS = [
  { value: 'marina', label: 'Marina' },
  { value: 'storage_facility', label: 'Storage Facility' },
  { value: 'home', label: 'Home' },
  { value: 'on_trailer', label: 'On Trailer' },
  { value: 'other', label: 'Other' },
];

export function BoatFields({ data, onChange }: BoatFieldsProps) {
  function update(field: keyof BoatData, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Boat / Watercraft Details
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          HIN / VIN
        </label>
        <input
          type="text"
          value={data.hin}
          onChange={(e) =>
            update('hin', e.target.value.toUpperCase().slice(0, 12))
          }
          maxLength={12}
          placeholder="12-character HIN"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          {data.hin.length}/12 characters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="text"
            value={data.year}
            onChange={(e) => update('year', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Boat Length (feet)
          </label>
          <input
            type="number"
            value={data.boatLength}
            onChange={(e) => update('boatLength', e.target.value)}
            placeholder="22"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hull Type
          </label>
          <select
            value={data.hullType}
            onChange={(e) => update('hullType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select</option>
            {HULL_TYPES.map((ht) => (
              <option key={ht.value} value={ht.value}>
                {ht.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stored Location
          </label>
          <select
            value={data.storedLocation}
            onChange={(e) => update('storedLocation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select</option>
            <option value="full">Full Coverage</option>
            <option value="liability_only">Liability Only</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.isFinanced}
            onChange={(e) => update('isFinanced', e.target.checked)}
            className="rounded border-gray-300"
          />
          Financed?
        </label>
        {data.isFinanced && (
          <div className="ml-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lienholder Name
            </label>
            <input
              type="text"
              value={data.lienholderName ?? ''}
              onChange={(e) => update('lienholderName', e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
