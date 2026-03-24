'use client';

import { useState, useCallback } from 'react';

interface VinInputProps {
  value: string;
  year: string;
  make: string;
  model: string;
  onChange: (fields: {
    vin: string;
    year?: string;
    make?: string;
    model?: string;
    trim?: string;
  }) => void;
  expectedLength?: number;
  label?: string;
  error?: string;
  required?: boolean;
}

interface NHTSAResult {
  Variable: string;
  Value: string | null;
}

function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(str.includes('-') ? '-' : ' ');
}

export function VinInput({
  value,
  year,
  make,
  model,
  onChange,
  expectedLength = 17,
  label = 'VIN',
  error,
  required,
}: VinInputProps) {
  const [decoding, setDecoding] = useState(false);
  const [decodeError, setDecodeError] = useState('');

  const decodeVin = useCallback(
    async (vin: string) => {
      if (vin.length !== expectedLength) return;
      if (expectedLength !== 17) return;

      setDecoding(true);
      setDecodeError('');

      try {
        const res = await fetch(
          `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`
        );
        const json = (await res.json()) as {
          Results: NHTSAResult[];
        };
        const results = json.Results;

        const getValue = (variable: string): string => {
          const found = results.find(
            (r: NHTSAResult) => r.Variable === variable
          );
          return found?.Value?.trim() ?? '';
        };

        const decodedYear = getValue('Model Year');
        const rawMake = getValue('Make');
        const decodedMake = rawMake ? toTitleCase(rawMake) : '';
        const decodedModel = getValue('Model');
        const decodedTrim = getValue('Trim');

        if (decodedYear || decodedMake || decodedModel) {
          onChange({
            vin,
            year: decodedYear || year,
            make: decodedMake || make,
            model: decodedModel || model,
            trim: decodedTrim || undefined,
          });
        } else {
          setDecodeError('Could not decode VIN. Please enter details manually.');
        }
      } catch {
        setDecodeError('VIN lookup failed. Please enter details manually.');
      } finally {
        setDecoding(false);
      }
    },
    [expectedLength, onChange, year, make, model]
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newVin = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    onChange({ vin: newVin });

    if (newVin.length === expectedLength && expectedLength === 17) {
      decodeVin(newVin);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required ? ' — Required for accurate quote' : ''} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          maxLength={expectedLength}
          placeholder={`Enter ${expectedLength}-character ${label}`}
          className={`w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
          }`}
        />
        {decoding && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {decodeError && (
        <p className="mt-1 text-xs text-amber-600">{decodeError}</p>
      )}
      <p className="mt-1 text-xs text-gray-400">
        {value.length}/{expectedLength} characters
      </p>
    </div>
  );
}
