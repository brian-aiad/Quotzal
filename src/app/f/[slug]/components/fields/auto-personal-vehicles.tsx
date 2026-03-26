'use client';

import type {
  AutoPersonalData,
  Vehicle,
  FormConfig,
  InsuranceType,
} from '@/lib/types/intake-form';
import type { ExtendedFormConfig } from '@/lib/types/form-config';
import { VehicleCard } from '../shared/vehicle-card';

interface AutoPersonalVehiclesProps {
  data: AutoPersonalData;
  onChange: (data: AutoPersonalData) => void;
  formConfig?: FormConfig;
  extendedConfig?: ExtendedFormConfig;
  insuranceType?: InsuranceType;
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

export function AutoPersonalVehicles({
  data,
  onChange,
  formConfig,
  extendedConfig,
  insuranceType,
}: AutoPersonalVehiclesProps) {
  // Auto-add one vehicle if empty
  if (data.vehicles.length === 0) {
    data = { ...data, vehicles: [emptyVehicle()] };
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
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicles</h3>
        <div className="space-y-4">
          {data.vehicles.map((vehicle, i) => (
            <VehicleCard
              key={i}
              vehicle={vehicle}
              index={i}
              drivers={data.drivers}
              onChange={(v) => updateVehicle(i, v)}
              onRemove={data.vehicles.length > 1 ? () => removeVehicle(i) : undefined}
              formConfig={formConfig}
              extendedConfig={extendedConfig}
              insuranceType={insuranceType}
            />
          ))}
        </div>
        {data.vehicles.length < 4 && (
          <button
            type="button"
            onClick={addVehicle}
            className="w-full mt-3 group flex items-center justify-center gap-2.5 py-4 border-2 border-dashed border-emerald-300 rounded-2xl text-sm font-semibold text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-200"
          >
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold leading-none group-hover:border-emerald-500 transition-colors">+</span>
            Add Another Vehicle
          </button>
        )}
      </div>
    </div>
  );
}
