'use client';

import type {
  AutoCommercialData,
  Driver,
  PersonalInfo,
} from '@/lib/types/intake-form';
import { DriverCard } from '../shared/driver-card';

interface AutoCommercialDriversProps {
  data: AutoCommercialData;
  personalInfo: PersonalInfo;
  onChange: (data: AutoCommercialData) => void;
}

function emptyDriver(): Driver {
  return {
    fullName: '',
    dateOfBirth: '',
    licenseNumber: '',
    licenseState: '',
    role: 'employee',
    maritalStatus: 'single',
    goodStudentDiscount: false,
    sr22Required: false,
    hasViolations: false,
    violations: [],
  };
}

const BUSINESS_TYPES = [
  'LLC',
  'Sole Proprietor',
  'Corporation',
  'Partnership',
  'Other',
];

export function AutoCommercialDrivers({
  data,
  personalInfo,
  onChange,
}: AutoCommercialDriversProps) {
  if (data.drivers.length === 0) {
    const primary = emptyDriver();
    primary.fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
    primary.dateOfBirth = personalInfo.dateOfBirth;
    primary.role = 'owner';
    data = { ...data, drivers: [primary] };
  }

  function update(field: string, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  function updateDriver(index: number, driver: Driver) {
    const updated = [...data.drivers];
    updated[index] = driver;
    onChange({ ...data, drivers: updated });
  }

  function addDriver() {
    if (data.drivers.length < 4) {
      onChange({ ...data, drivers: [...data.drivers, emptyDriver()] });
    }
  }

  function removeDriver(index: number) {
    onChange({ ...data, drivers: data.drivers.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-6">
      {/* Business Info */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={data.businessName}
              onChange={(e) => update('businessName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Type
            </label>
            <select
              value={data.businessType}
              onChange={(e) => update('businessType', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="" disabled>Select</option>
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Number of Vehicles in Fleet
            </label>
            <input
              type="number"
              min={1}
              max={99}
              value={data.numberOfVehicles}
              onChange={(e) => update('numberOfVehicles', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={data.driversAreEmployees}
                onChange={(e) => update('driversAreEmployees', e.target.checked)}
                className="rounded border-slate-300"
              />
              Are drivers employees?
            </label>
          </div>
        </div>
      </div>

      {/* Drivers */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Drivers</h3>
        <div className="space-y-4">
          {data.drivers.map((driver, i) => (
            <DriverCard
              key={i}
              driver={driver}
              index={i}
              onChange={(d) => updateDriver(i, d)}
              onRemove={i > 0 ? () => removeDriver(i) : undefined}
              mode="commercial"
              isPrimary={i === 0}
            />
          ))}
        </div>
        {data.drivers.length < 4 && (
          <button
            type="button"
            onClick={addDriver}
            className="w-full mt-3 group flex items-center justify-center gap-2.5 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm font-semibold text-gray-400 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/40 transition-all duration-200"
          >
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold leading-none group-hover:border-emerald-500 transition-colors">+</span>
            Add Another Driver
          </button>
        )}
      </div>
    </div>
  );
}
