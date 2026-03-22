'use client';

import type {
  AutoCommercialData,
  Vehicle,
} from '@/lib/types/intake-form';
import { VehicleCard } from '../shared/vehicle-card';

interface AutoCommercialVehiclesProps {
  data: AutoCommercialData;
  onChange: (data: AutoCommercialData) => void;
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

export function AutoCommercialVehicles({
  data,
  onChange,
}: AutoCommercialVehiclesProps) {
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
    onChange({ ...data, vehicles: data.vehicles.filter((_, i) => i !== index) });
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
            />
          ))}
        </div>
        {data.vehicles.length < 4 && (
          <button
            type="button"
            onClick={addVehicle}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Vehicle
          </button>
        )}
      </div>
    </div>
  );
}
