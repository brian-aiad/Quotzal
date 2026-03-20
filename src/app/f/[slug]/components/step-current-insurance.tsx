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
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Current Insurance
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Do you currently have insurance for this?
      </p>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => update('hasCurrentInsurance', true)}
            className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
              data.hasCurrentInsurance === true
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
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
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            No
          </button>
        </div>

        {data.hasCurrentInsurance && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Carrier
              </label>
              <input
                type="text"
                value={data.currentCarrier ?? ''}
                onChange={(e) => update('currentCarrier', e.target.value)}
                placeholder="e.g., State Farm, GEICO"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Coverage Limits
              </label>
              <input
                type="text"
                value={data.currentCoverageLimits ?? ''}
                onChange={(e) =>
                  update('currentCoverageLimits', e.target.value)
                }
                placeholder="e.g., 100/300/100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Policy Expiry Date
              </label>
              <input
                type="date"
                value={data.policyExpiryDate ?? ''}
                onChange={(e) => update('policyExpiryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
