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
  const [showInvalidCharWarning, setShowInvalidCharWarning] = useState(false);

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
          setDecodeError('Could not decode this VIN');
        }
      } catch {
        setDecodeError('VIN lookup failed');
      } finally {
        setDecoding(false);
      }
    },
    [expectedLength, onChange, year, make, model]
  );

  const isValidLength = value.length === expectedLength;
  const hasInvalidChars = /[IOQ]/i.test(value);
  const isValid = isValidLength && !hasInvalidChars;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.toUpperCase();
    if (/[IOQ]/i.test(raw)) {
      setShowInvalidCharWarning(true);
    } else {
      setShowInvalidCharWarning(false);
    }
    const newVin = raw.replace(/[^A-HJ-NPR-Z0-9]/g, '');
    onChange({ vin: newVin });

    if (newVin.length === expectedLength && expectedLength === 17) {
      decodeVin(newVin);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
        {required && <span className="text-gray-400 font-normal ml-1">— Required for accurate quote</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          maxLength={expectedLength}
          placeholder={`Enter ${expectedLength}-character ${label}`}
          className={`w-full h-11 px-4 text-sm font-mono tracking-wider border rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-200 ${
            error
              ? 'border-red-300 focus:ring-red-500/30 focus:border-red-400'
              : isValid
              ? 'border-emerald-300 focus:ring-emerald-500/30 focus:border-emerald-500'
              : 'border-gray-200 focus:ring-emerald-500/30 focus:border-emerald-500'
          }`}
        />
        {decoding && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {isValid && !decoding && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>⚠</span> {error}</p>}
      {showInvalidCharWarning && (
        <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          VINs don&apos;t contain the letters I, O, or Q
        </p>
      )}
      {decodeError && (
        <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
          We couldn&apos;t decode this VIN — fill in the details below
        </p>
      )}
      <div className="flex items-center justify-between mt-1.5">
        <p className="text-xs text-gray-400">
          {isValid && !decoding ? '✓ Valid VIN' : value.length > 0 && value.length < expectedLength ? `VIN must be ${expectedLength} characters` : value.length === 0 ? 'Find it on your dashboard or registration' : decoding ? 'Decoding...' : 'VIN decodes automatically at 17 characters'}
        </p>
        <span className={`text-xs ${isValid ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
          {value.length}/{expectedLength}
        </span>
      </div>
    </div>
  );
}
