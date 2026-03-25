'use client';

import type {
  AutoPersonalData,
  Driver,
  PersonalInfo,
  FormConfig,
} from '@/lib/types/intake-form';
import { DriverCard } from '../shared/driver-card';

interface DriverErrors {
  [driverIndex: number]: Record<string, string>;
}

interface AutoPersonalDriversProps {
  data: AutoPersonalData;
  personalInfo: PersonalInfo;
  onChange: (data: AutoPersonalData) => void;
  formConfig?: FormConfig;
  driverErrors?: DriverErrors;
}

function emptyDriver(): Driver {
  return {
    fullName: '',
    dateOfBirth: '',
    licenseNumber: '',
    licenseState: '',
    relationship: 'spouse',
    maritalStatus: 'single',
    goodStudentDiscount: false,
    sr22Required: false,
    hasViolations: false,
    violations: [],
  };
}

export function AutoPersonalDrivers({
  data,
  personalInfo,
  onChange,
  formConfig,
  driverErrors,
}: AutoPersonalDriversProps) {
  if (data.drivers.length === 0) {
    const primary = emptyDriver();
    primary.fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
    primary.dateOfBirth = personalInfo.dateOfBirth;
    primary.relationship = 'self';
    data = { ...data, drivers: [primary] };
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
    const updated = data.drivers.filter((_, i) => i !== index);
    onChange({ ...data, drivers: updated });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Drivers</h3>
        <div className="space-y-4">
          {data.drivers.map((driver, i) => (
            <DriverCard
              key={i}
              driver={driver}
              index={i}
              onChange={(d) => updateDriver(i, d)}
              onRemove={i > 0 ? () => removeDriver(i) : undefined}
              mode="personal"
              isPrimary={i === 0}
              formConfig={formConfig}
              errors={driverErrors?.[i]}
            />
          ))}
        </div>
        {data.drivers.length < 4 && (
          <button
            type="button"
            onClick={addDriver}
            className="w-full mt-3 group flex items-center justify-center gap-2.5 py-4 border-2 border-dashed border-emerald-300 rounded-2xl text-sm font-semibold text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200"
          >
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold leading-none group-hover:border-emerald-500 transition-colors">+</span>
            Add Another Driver
          </button>
        )}
      </div>
    </div>
  );
}
