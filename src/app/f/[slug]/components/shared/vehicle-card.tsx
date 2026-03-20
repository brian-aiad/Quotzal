'use client';

import type {
  Vehicle,
  OwnershipType,
  CoverageType,
  AnnualMileage,
  Driver,
} from '@/lib/types/intake-form';
import { VinInput } from './vin-input';

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
  drivers: Driver[];
  onChange: (vehicle: Vehicle) => void;
  onRemove?: () => void;
}

const OWNERSHIP_OPTIONS: { value: OwnershipType; label: string }[] = [
  { value: 'owned', label: 'Owned' },
  { value: 'financed', label: 'Financed' },
  { value: 'leased', label: 'Leased' },
];

const MILEAGE_OPTIONS: { value: AnnualMileage; label: string }[] = [
  { value: 'under_5000', label: 'Under 5,000' },
  { value: '5000_10000', label: '5,000 - 10,000' },
  { value: '10000_15000', label: '10,000 - 15,000' },
  { value: '15000_20000', label: '15,000 - 20,000' },
  { value: '20000_plus', label: '20,000+' },
];

const COVERAGE_OPTIONS: { value: CoverageType; label: string }[] = [
  { value: 'full', label: 'Full Coverage' },
  { value: 'liability_only', label: 'Liability Only' },
];

export function VehicleCard({
  vehicle,
  index,
  drivers,
  onChange,
  onRemove,
}: VehicleCardProps) {
  function update(field: string, value: unknown) {
    onChange({ ...vehicle, [field]: value });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-800">
          Vehicle {index + 1}
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

      <VinInput
        value={vehicle.vin}
        year={vehicle.year}
        make={vehicle.make}
        model={vehicle.model}
        onChange={(fields) => {
          onChange({
            ...vehicle,
            vin: fields.vin,
            year: fields.year ?? vehicle.year,
            make: fields.make ?? vehicle.make,
            model: fields.model ?? vehicle.model,
          });
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="text"
            value={vehicle.year}
            onChange={(e) => update('year', e.target.value)}
            placeholder="2024"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make
          </label>
          <input
            type="text"
            value={vehicle.make}
            onChange={(e) => update('make', e.target.value)}
            placeholder="Toyota"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model
          </label>
          <input
            type="text"
            value={vehicle.model}
            onChange={(e) => update('model', e.target.value)}
            placeholder="Camry"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ownership
          </label>
          <select
            value={vehicle.ownership}
            onChange={(e) => update('ownership', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {OWNERSHIP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {(vehicle.ownership === 'financed' || vehicle.ownership === 'leased') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lienholder Name
            </label>
            <input
              type="text"
              value={vehicle.lienholderName ?? ''}
              onChange={(e) => update('lienholderName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Driver
          </label>
          <select
            value={vehicle.primaryDriverIndex}
            onChange={(e) =>
              update('primaryDriverIndex', Number(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {drivers.map((d, i) => (
              <option key={i} value={i}>
                {d.fullName || `Driver ${i + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Mileage
          </label>
          <select
            value={vehicle.annualMileage}
            onChange={(e) => update('annualMileage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {MILEAGE_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coverage Type
          </label>
          <select
            value={vehicle.coverageType}
            onChange={(e) => update('coverageType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {COVERAGE_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
