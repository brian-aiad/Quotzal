'use client';

import type { CurrentInsurance } from '@/lib/types/intake-form';

interface StepCurrentInsuranceProps {
  data: CurrentInsurance;
  onChange: (data: CurrentInsurance) => void;
}

export function StepCurrentInsurance({
  data,
  onChange,
}: StepCurrentInsuranceProps) {
  function update(field: keyof CurrentInsurance, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Current Insurance
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Do you currently have insurance for this?
      </p>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => update('hasCurrentInsurance', true)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
              data.hasCurrentInsurance === true
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() =>
              onChange({
                hasCurrentInsurance: false,
                currentCarrier: undefined,
                currentCoverageLimits: undefined,
                policyExpiryDate: undefined,
              })
            }
            className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
              data.hasCurrentInsurance === false
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            No
          </button>
        </div>

        {data.hasCurrentInsurance && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Carrier
              </label>
              <input
                type="text"
                list="carriers-list"
                value={data.currentCarrier ?? ''}
                onChange={(e) => update('currentCarrier', e.target.value)}
                placeholder="e.g., State Farm, GEICO"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <datalist id="carriers-list">
                <option value="State Farm" />
                <option value="GEICO" />
                <option value="Progressive" />
                <option value="Allstate" />
                <option value="USAA" />
                <option value="Liberty Mutual" />
                <option value="Farmers" />
                <option value="Nationwide" />
                <option value="Travelers" />
                <option value="American Family" />
                <option value="Erie Insurance" />
                <option value="The Hartford" />
                <option value="Amica" />
                <option value="AAA" />
                <option value="Esurance" />
                <option value="Safeco" />
                <option value="Mercury Insurance" />
                <option value="21st Century" />
                <option value="Bristol West" />
                <option value="Dairyland" />
                <option value="The General" />
                <option value="Infinity Insurance" />
                <option value="National General" />
                <option value="Kemper" />
                <option value="Gainsco" />
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Current Coverage Limits
              </label>
              <input
                type="text"
                list="limits-list"
                value={data.currentCoverageLimits ?? ''}
                onChange={(e) =>
                  update('currentCoverageLimits', e.target.value)
                }
                placeholder="e.g., 100/300/100"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <datalist id="limits-list">
                <option value="15/30/5" />
                <option value="25/50/10" />
                <option value="25/50/25" />
                <option value="50/100/25" />
                <option value="50/100/50" />
                <option value="100/300/50" />
                <option value="100/300/100" />
                <option value="250/500/250" />
                <option value="500/500/500" />
                <option value="State Minimum" />
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Policy Expiry Date
              </label>
              <input
                type="date"
                value={data.policyExpiryDate ?? ''}
                onChange={(e) => update('policyExpiryDate', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
