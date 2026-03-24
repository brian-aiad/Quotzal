'use client';

import type {
  AutoPersonalData,
  Driver,
  Vehicle,
  PersonalInfo,
} from '@/lib/types/intake-form';
import { DriverCard } from '../shared/driver-card';
import { VehicleCard } from '../shared/vehicle-card';

interface AutoPersonalFieldsProps {
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
    relationship: 'other',
    maritalStatus: undefined,
    goodStudentDiscount: false,
    sr22Required: false,
    hasViolations: false,
    violations: [],
  };
}

function emptyVehicle(): Vehicle {
  return {
    vin: '',
    year: '',
    make: '',
    model: '',
    trim: '',
    primaryDriverIndex: 0,
    coverageType: 'full',
  };
}

export function AutoPersonalFields({
  data,
  personalInfo,
  onChange,
}: AutoPersonalFieldsProps) {
  // Initialize with primary driver pre-filled if empty
  if (data.drivers.length === 0) {
    const primary = emptyDriver();
    primary.fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
    primary.dateOfBirth = personalInfo.dateOfBirth;
    primary.relationship = 'self';
    data = { ...data, drivers: [primary], vehicles: data.vehicles };
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

  function updateVehicle(index: number, vehicle: Vehicle) {
    const updated = [...data.vehicles];
    updated[index] = vehicle;
    onChange({ ...data, vehicles: updated });
  }

  function addVehicle() {
    if (data.vehicles.length < 4) {
      onChange({ ...data, vehicles: [...data.vehicles, emptyVehicle()] });
    }
  }

  function removeVehicle(index: number) {
    const updated = data.vehicles.filter((_, i) => i !== index);
    onChange({ ...data, vehicles: updated });
  }

  return (
    <div className="space-y-6">
      {/* Drivers Section */}
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

      {/* Vehicles Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Vehicles</h3>
        <div className="space-y-4">
          {data.vehicles.map((vehicle, i) => (
            <VehicleCard
              key={i}
              vehicle={vehicle}
              index={i}
              drivers={data.drivers}
              onChange={(v) => updateVehicle(i, v)}
              onRemove={data.vehicles.length > 1 ? () => removeVehicle(i) : undefined}
            />
          ))}
        </div>
        {data.vehicles.length < 4 && (
          <button
            type="button"
            onClick={addVehicle}
            className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            + Add Vehicle
          </button>
        )}
      </div>
    </div>
  );
}
