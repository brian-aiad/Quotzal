'use client';

import { useState, useRef, useEffect } from 'react';
import type { CurrentInsurance, FormConfig, InsuranceType } from '@/lib/types/intake-form';
import type { ExtendedFormConfig, FieldToggle } from '@/lib/types/form-config';
import { getTypeConfig } from '@/lib/types/form-config';

interface StepCurrentInsuranceProps {
  data: CurrentInsurance;
  onChange: (data: CurrentInsurance) => void;
  formConfig?: FormConfig;
  extendedConfig?: ExtendedFormConfig;
  insuranceType?: InsuranceType;
  extraFields?: Record<string, string>;
  onExtraFieldChange?: (key: string, value: string) => void;
}

function getToggle(extConfig: ExtendedFormConfig | undefined, type: InsuranceType | undefined, key: string): FieldToggle | null {
  if (!extConfig || !type) return null;
  const tc = getTypeConfig(extConfig, type);
  if (!tc) return null;
  return (tc as unknown as Record<string, FieldToggle>)[key] ?? null;
}

const CARRIERS = [
  'State Farm', 'GEICO', 'Progressive', 'Allstate', 'USAA',
  'Liberty Mutual', 'Farmers', 'Nationwide', 'Travelers', 'American Family',
  'Erie Insurance', 'The Hartford', 'Amica', 'AAA', 'Esurance',
  'Safeco', 'Mercury Insurance', '21st Century', 'Bristol West',
  'Dairyland', 'The General', 'Infinity Insurance', 'National General',
  'Kemper', 'Gainsco',
];

interface CoverageLimitPreset {
  value: string;
  descriptor?: string;
  warning?: boolean;
  recommended?: boolean;
}

const COVERAGE_LIMIT_PRESETS: CoverageLimitPreset[] = [
  { value: '30/60/15', descriptor: 'CA State Minimum', warning: true },
  { value: '50/100/25' },
  { value: '50/100/50' },
  { value: '100/300/50' },
  { value: '100/300/100', descriptor: 'Most common in CA', recommended: true },
  { value: '250/500/100' },
  { value: '250/500/250' },
  { value: '500/1000/250' },
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
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
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

function CoverageLimitsCombobox({ value, onChange }: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
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

  // Auto-detect custom value on mount
  const isPreset = COVERAGE_LIMIT_PRESETS.some(p => p.value === value);
  useEffect(() => {
    if (value && !isPreset) setIsCustom(true);
  }, [value, isPreset]);

  const filtered = query && !isCustom
    ? COVERAGE_LIMIT_PRESETS.filter(p =>
        p.value.includes(query) ||
        (p.descriptor ?? '').toLowerCase().includes(query.toLowerCase())
      )
    : COVERAGE_LIMIT_PRESETS;

  if (isCustom) {
    return (
      <div ref={ref}>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Coverage Limits</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); }}
            placeholder="e.g., 100/300/100"
            className="flex-1 h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => { setIsCustom(false); setQuery(''); onChange(''); }}
            className="px-3 text-xs text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
          >
            Use preset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Coverage Limits</label>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Select or type coverage limits"
        autoComplete="off"
        className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
      />
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {filtered.map(preset => (
              <button
                key={preset.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(preset.value);
                  onChange(preset.value);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  {preset.warning && <span className="text-amber-500 text-sm">&#9888;&#65039;</span>}
                  {preset.recommended && <span className="text-emerald-500 text-sm">&#10003;</span>}
                  <span className="text-sm font-medium text-gray-900">{preset.value}</span>
                  {preset.descriptor && (
                    <span className={`text-xs ${preset.warning ? 'text-amber-500' : preset.recommended ? 'text-emerald-500' : 'text-gray-400'}`}>&mdash; {preset.descriptor}</span>
                  )}
                </div>
              </button>
            ))}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsCustom(true);
                setQuery('');
                onChange('');
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 transition-colors border-t border-gray-100"
            >
              <span className="text-sm font-medium text-emerald-600">Custom...</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function StepCurrentInsurance({ data, onChange, formConfig, extendedConfig, insuranceType, extraFields = {}, onExtraFieldChange }: StepCurrentInsuranceProps) {
  const showCoverageLimits = formConfig?.fields.coverage_limits?.enabled ?? true;
  const showPolicyExpiry = formConfig?.fields.policy_expiry?.enabled ?? true;

  // New extended fields
  const policyNumberToggle = getToggle(extendedConfig, insuranceType, 'policyNumber');
  const yearsWithCarrierToggle = getToggle(extendedConfig, insuranceType, 'yearsWithCarrier');
  const continuousCoverageToggle = getToggle(extendedConfig, insuranceType, 'continuousCoverage');

  function updateExtra(key: string, value: string) {
    onExtraFieldChange?.(key, value);
  }

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
            className={`flex flex-col items-center justify-center gap-2 py-5 px-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
              data.hasCurrentInsurance === true
                ? 'border-emerald-500 bg-emerald-50 shadow-md'
                : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
              data.hasCurrentInsurance === true ? 'border-emerald-500 bg-emerald-500' : 'border-gray-200'
            }`}>
              {data.hasCurrentInsurance === true && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              )}
            </div>
            <span className={`text-sm font-bold ${data.hasCurrentInsurance === true ? 'text-emerald-800' : 'text-gray-700'}`}>
              Yes, I&apos;m insured
            </span>
            <span className={`text-xs ${data.hasCurrentInsurance === true ? 'text-emerald-600' : 'text-gray-400'}`}>
              I have current coverage
            </span>
          </button>
          <button
            type="button"
            onClick={() => onChange({ hasCurrentInsurance: false, currentCarrier: undefined, currentCoverageLimits: undefined, policyExpiryDate: undefined })}
            className={`flex flex-col items-center justify-center gap-2 py-5 px-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
              data.hasCurrentInsurance === false
                ? 'border-gray-400 bg-gray-50 shadow-md'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
              data.hasCurrentInsurance === false ? 'border-gray-500 bg-gray-500' : 'border-gray-200'
            }`}>
              {data.hasCurrentInsurance === false && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              )}
            </div>
            <span className={`text-sm font-bold ${data.hasCurrentInsurance === false ? 'text-gray-800' : 'text-gray-700'}`}>
              No, I&apos;m uninsured
            </span>
            <span className={`text-xs ${data.hasCurrentInsurance === false ? 'text-gray-500' : 'text-gray-400'}`}>
              No current policy
            </span>
          </button>
        </div>

        {data.hasCurrentInsurance && (
          <div className="space-y-5 pt-2 transition-all duration-200">
            <Combobox
              label="Current Carrier"
              value={data.currentCarrier ?? ''}
              options={CARRIERS}
              onChange={(v) => update('currentCarrier', v)}
              placeholder="e.g., State Farm, GEICO"
            />

            {showCoverageLimits && (
              <CoverageLimitsCombobox
                value={data.currentCoverageLimits ?? ''}
                onChange={(v) => update('currentCoverageLimits', v)}
              />
            )}

            {showPolicyExpiry && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Policy Expiry Date
                </label>
                <input
                  type="date"
                  value={data.policyExpiryDate ?? ''}
                  onChange={(e) => update('policyExpiryDate', e.target.value)}
                  className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
            )}

            {policyNumberToggle?.show && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Policy Number
                  {policyNumberToggle.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="text"
                  value={extraFields.policyNumber ?? ''}
                  onChange={(e) => updateExtra('policyNumber', e.target.value)}
                  placeholder="e.g., POL-123456"
                  className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
            )}

            {yearsWithCarrierToggle?.show && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Years with Current Carrier
                  {yearsWithCarrierToggle.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <select
                  value={extraFields.yearsWithCarrier ?? ''}
                  onChange={(e) => updateExtra('yearsWithCarrier', e.target.value)}
                  className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
                >
                  <option value="">Select...</option>
                  <option value="less_than_1">Less than 1 year</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
            )}

            {continuousCoverageToggle?.show && (
              <label className="flex items-center gap-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={extraFields.continuousCoverage === 'yes'}
                  onChange={(e) => updateExtra('continuousCoverage', e.target.checked ? 'yes' : 'no')}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Continuous coverage with no lapses</span>
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
