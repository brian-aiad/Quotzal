'use client';

import { useState, useRef, useEffect } from 'react';
import type { CurrentInsurance } from '@/lib/types/intake-form';

interface StepCurrentInsuranceProps {
  data: CurrentInsurance;
  onChange: (data: CurrentInsurance) => void;
}

const CARRIERS = [
  'State Farm', 'GEICO', 'Progressive', 'Allstate', 'USAA',
  'Liberty Mutual', 'Farmers', 'Nationwide', 'Travelers', 'American Family',
  'Erie Insurance', 'The Hartford', 'Amica', 'AAA', 'Esurance',
  'Safeco', 'Mercury Insurance', '21st Century', 'Bristol West',
  'Dairyland', 'The General', 'Infinity Insurance', 'National General',
  'Kemper', 'Gainsco',
];

const COVERAGE_LIMITS = [
  'State Minimum', '15/30/5', '25/50/10', '25/50/25', '50/100/25',
  '50/100/50', '100/300/50', '100/300/100', '250/500/250', '500/500/500',
];

function Combobox({ value, options, onChange, placeholder, label }: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
      />
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {filtered.map(item => (
              <button
                key={item}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(item);
                  onChange(item);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors border-b border-gray-50 last:border-0"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function StepCurrentInsurance({ data, onChange }: StepCurrentInsuranceProps) {
  function update(field: keyof CurrentInsurance, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
        Current Insurance
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Do you currently have insurance for this?
      </p>

      <div className="space-y-5">
        {/* Yes/No toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => update('hasCurrentInsurance', true)}
            className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-2xl border-2 transition-all duration-200 text-center ${
              data.hasCurrentInsurance === true
                ? 'bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-100/50'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className={`text-lg font-bold ${data.hasCurrentInsurance === true ? 'text-emerald-600' : 'text-gray-300'}`}>✓</span>
            <span className={`text-sm font-semibold leading-tight ${data.hasCurrentInsurance === true ? 'text-emerald-800' : 'text-gray-500'}`}>
              Yes, I&apos;m insured
            </span>
          </button>
          <button
            type="button"
            onClick={() => onChange({ hasCurrentInsurance: false, currentCarrier: undefined, currentCoverageLimits: undefined, policyExpiryDate: undefined })}
            className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-2xl border-2 transition-all duration-200 text-center ${
              data.hasCurrentInsurance === false
                ? 'bg-gray-100 border-gray-400 shadow-sm'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className={`text-lg font-bold ${data.hasCurrentInsurance === false ? 'text-gray-600' : 'text-gray-300'}`}>✗</span>
            <span className={`text-sm font-semibold leading-tight ${data.hasCurrentInsurance === false ? 'text-gray-700' : 'text-gray-500'}`}>
              No, I&apos;m uninsured
            </span>
          </button>
        </div>

        {data.hasCurrentInsurance && (
          <div className="space-y-5 pt-2">
            <Combobox
              label="Current Carrier"
              value={data.currentCarrier ?? ''}
              options={CARRIERS}
              onChange={(v) => update('currentCarrier', v)}
              placeholder="e.g., State Farm, GEICO"
            />

            <Combobox
              label="Coverage Limits"
              value={data.currentCoverageLimits ?? ''}
              options={COVERAGE_LIMITS}
              onChange={(v) => update('currentCoverageLimits', v)}
              placeholder="e.g., 100/300/100"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Policy Expiry Date
              </label>
              <input
                type="date"
                value={data.policyExpiryDate ?? ''}
                onChange={(e) => update('policyExpiryDate', e.target.value)}
                className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
