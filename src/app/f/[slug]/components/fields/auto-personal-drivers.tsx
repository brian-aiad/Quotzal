'use client';

import type {
  AutoPersonalData,
  Driver,
  PersonalInfo,
} from '@/lib/types/intake-form';
import { DriverCard } from '../shared/driver-card';

interface AutoPersonalDriversProps {
  data: AutoPersonalData;
  personalInfo: PersonalInfo;
  onChange: (data: AutoPersonalData) => void;
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
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Drivers</h3>
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
            />
          ))}
        </div>
        {data.drivers.length < 4 && (
          <button
            type="button"
            onClick={addDriver}
            className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            + Add Driver
          </button>
        )}
      </div>
    </div>
  );
}
