'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  Vehicle,
  CoverageType,
  Driver,
  FormConfig,
} from '@/lib/types/intake-form';
import { VinInput } from './vin-input';

interface VehicleCardProps {
  vehicle: Vehicle;
  index: number;
  drivers: Driver[];
  onChange: (vehicle: Vehicle) => void;
  onRemove?: () => void;
  errors?: Record<string, string>;
  formConfig?: FormConfig;
}

const COVERAGE_OPTIONS: { value: CoverageType; label: string }[] = [
  { value: 'full', label: 'Full Coverage' },
  { value: 'liability_only', label: 'Liability Only' },
];

const VEHICLE_MAKES = [
  'Acura', 'BMW', 'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Dodge',
  'Ford', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jeep', 'Kia', 'Lexus',
  'Lincoln', 'Mazda', 'Mercedes-Benz', 'Mitsubishi', 'Nissan', 'RAM',
  'Subaru', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo', 'Other',
];

function generateYears(): string[] {
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;
  const years: string[] = [];
  for (let y = maxYear; y >= 1990; y--) {
    years.push(String(y));
  }
  return years;
}

const YEAR_OPTIONS = generateYears();

const INPUT_CLASS = 'w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200';
const SELECT_CLASS = 'w-full h-11 px-4 pr-10 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 appearance-none bg-[length:16px_16px] bg-[right_12px_center] bg-no-repeat focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E")]';
const READONLY_CLASS = 'w-full h-11 px-4 text-sm border border-gray-100 rounded-xl text-gray-500 bg-gray-50 focus:outline-none cursor-not-allowed';

interface NHTSAModelResult {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}

export function VehicleCard({
  vehicle,
  index,
  drivers,
  onChange,
  onRemove,
  errors,
  formConfig,
}: VehicleCardProps) {
  const vinEnabled = formConfig?.fields.vin.enabled ?? true;
  const vinRequired = vinEnabled && (formConfig?.fields.vin.required ?? false);
  const trimEnabled = formConfig?.fields.trim_package?.enabled ?? true;
  const coverageTypeEnabled = formConfig?.fields.coverage_type?.enabled ?? true;
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelFetchFailed, setModelFetchFailed] = useState(false);
  const [vinDecoded, setVinDecoded] = useState(false);

  function update(field: string, value: unknown) {
    onChange({ ...vehicle, [field]: value });
  }

  const isLocked = vinDecoded && vehicle.vin.length === 17;

  const fetchModels = useCallback(async (make: string, year: string) => {
    if (!make || !year || make === 'Other') {
      setModels([]);
      return;
    }

    setLoadingModels(true);
    setModelFetchFailed(false);

    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
      );
      const json = (await res.json()) as { Results: NHTSAModelResult[] };
      const modelNames = json.Results
        .map((r) => r.Model_Name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      setModels([...new Set(modelNames)]);
    } catch {
      setModelFetchFailed(true);
      setModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, []);

  useEffect(() => {
    if (!isLocked && vehicle.year && vehicle.make && vehicle.make !== 'Other') {
      fetchModels(vehicle.make, vehicle.year);
    } else if (!isLocked) {
      setModels([]);
    }
  }, [vehicle.year, vehicle.make, fetchModels, isLocked]);

  function handleYearChange(year: string) {
    if (isLocked) return;
    onChange({ ...vehicle, year, make: '', model: '' });
    setVinDecoded(false);
  }

  function handleMakeChange(make: string) {
    if (isLocked) return;
    onChange({ ...vehicle, make, model: '' });
    setVinDecoded(false);
  }

  function handleModelChange(model: string) {
    if (isLocked) return;
    onChange({ ...vehicle, model });
    setVinDecoded(false);
  }

  function handleVinChange(fields: {
    vin: string;
    year?: string;
    make?: string;
    model?: string;
    trim?: string;
  }) {
    const hasDecoded = fields.year || fields.make || fields.model;

    if (fields.vin.length === 0) {
      setVinDecoded(false);
      onChange({ ...vehicle, vin: '' });
      return;
    }

    if (fields.vin.length < 17 && vinDecoded) {
      setVinDecoded(false);
    }

    if (hasDecoded) {
      setVinDecoded(true);
    }

    onChange({
      ...vehicle,
      vin: fields.vin,
      year: fields.year ?? vehicle.year,
      make: fields.make ?? vehicle.make,
      model: fields.model ?? vehicle.model,
      trim: fields.trim ?? vehicle.trim,
    });
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 bg-emerald-50 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xs font-bold text-white">{index + 1}</span>
          </div>
          <div>
            <span className="text-sm font-bold text-emerald-900">Vehicle {index + 1}</span>
            {vehicle.make && vehicle.model && (
              <span className="text-xs text-emerald-600 ml-2 font-medium">
                — {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
            )}
          </div>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>
      <div className="p-5 space-y-4">

      {/* VIN */}
      {vinEnabled && (
        <>
          <VinInput
            value={vehicle.vin}
            year={vehicle.year}
            make={vehicle.make}
            model={vehicle.model}
            onChange={handleVinChange}
            error={errors?.vin}
            required={vinRequired}
          />

          {/* VIN info box */}
          {isLocked ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              &#10003; Vehicle confirmed — Year, Make, and Model have been auto-filled from your VIN.
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              &#128161; Entering your VIN ensures your quote reflects your vehicle&apos;s exact features, safety equipment, and history. Find it on your dashboard (driver&apos;s side) or vehicle registration.
            </div>
          )}
        </>
      )}

      {/* Year / Make / Model */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year <span className="text-red-500">*</span>
          </label>
          {isLocked ? (
            <input type="text" value={vehicle.year} readOnly className={READONLY_CLASS} />
          ) : (
            <select
              value={vehicle.year}
              onChange={(e) => handleYearChange(e.target.value)}
              className={SELECT_CLASS}
            >
              <option value="" disabled>Select year</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make <span className="text-red-500">*</span>
          </label>
          {isLocked ? (
            <input type="text" value={vehicle.make} readOnly className={READONLY_CLASS} />
          ) : (
            <select
              value={vehicle.make}
              onChange={(e) => handleMakeChange(e.target.value)}
              disabled={!vehicle.year}
              className={`${SELECT_CLASS} ${!vehicle.year ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="" disabled>
                {vehicle.year ? 'Select make' : 'Select year first'}
              </option>
              {VEHICLE_MAKES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model <span className="text-red-500">*</span>
          </label>
          {isLocked ? (
            <input type="text" value={vehicle.model} readOnly className={READONLY_CLASS} />
          ) : loadingModels ? (
            <div className={`${SELECT_CLASS} flex items-center gap-2`}>
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-slate-500">Loading models...</span>
            </div>
          ) : modelFetchFailed || vehicle.make === 'Other' ? (
            <input
              type="text"
              value={vehicle.model}
              onChange={(e) => handleModelChange(e.target.value)}
              placeholder="Enter model"
              disabled={!vehicle.make}
              className={`${INPUT_CLASS} ${!vehicle.make ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          ) : (
            <select
              value={vehicle.model}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={!vehicle.make}
              className={`${SELECT_CLASS} ${!vehicle.make ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="" disabled>
                {vehicle.make ? 'Select model' : 'Select make first'}
              </option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Trim */}
      {trimEnabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trim / Package <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={vehicle.trim ?? ''}
            onChange={(e) => update('trim', e.target.value)}
            placeholder="e.g. LX, Sport, Limited"
            className={INPUT_CLASS}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Driver
          </label>
          <select
            value={vehicle.primaryDriverIndex}
            onChange={(e) => update('primaryDriverIndex', Number(e.target.value))}
            className={SELECT_CLASS}
          >
            {drivers.map((d, i) => (
              <option key={i} value={i}>
                {d.fullName || `Driver ${i + 1}`}
              </option>
            ))}
          </select>
        </div>

        {coverageTypeEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coverage Type
            </label>
            <select
              value={vehicle.coverageType}
              onChange={(e) => update('coverageType', e.target.value)}
              className={SELECT_CLASS}
            >
              {COVERAGE_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
