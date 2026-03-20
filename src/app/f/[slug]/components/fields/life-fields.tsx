'use client';

import type {
  LifeData,
  CoverageAmount,
  PolicyLifeType,
  TermLength,
  BeneficiaryRelationship,
} from '@/lib/types/intake-form';

interface LifeFieldsProps {
  data: LifeData;
  onChange: (data: LifeData) => void;
}

const COVERAGE_AMOUNTS: { value: CoverageAmount; label: string }[] = [
  { value: 'under_100k', label: 'Under $100K' },
  { value: '100k_250k', label: '$100K - $250K' },
  { value: '250k_500k', label: '$250K - $500K' },
  { value: '500k_1m', label: '$500K - $1M' },
  { value: 'over_1m', label: 'Over $1M' },
];

const POLICY_TYPES: { value: PolicyLifeType; label: string }[] = [
  { value: 'term', label: 'Term' },
  { value: 'whole', label: 'Whole' },
  { value: 'not_sure', label: 'Not Sure' },
];

const TERM_LENGTHS: { value: TermLength; label: string }[] = [
  { value: '10', label: '10 years' },
  { value: '15', label: '15 years' },
  { value: '20', label: '20 years' },
  { value: '25', label: '25 years' },
  { value: '30', label: '30 years' },
];

const BENEFICIARY_RELATIONSHIPS: {
  value: BeneficiaryRelationship;
  label: string;
}[] = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

function feetOptions(): string[] {
  return ['4', '5', '6', '7'];
}

function inchesOptions(): string[] {
  return Array.from({ length: 12 }, (_, i) => String(i));
}

export function LifeFields({ data, onChange }: LifeFieldsProps) {
  function update(field: keyof LifeData, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Life Insurance Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coverage Amount
          </label>
          <select
            value={data.coverageAmount}
            onChange={(e) => update('coverageAmount', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {COVERAGE_AMOUNTS.map((ca) => (
              <option key={ca.value} value={ca.value}>
                {ca.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Policy Type
          </label>
          <select
            value={data.policyType}
            onChange={(e) => update('policyType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {POLICY_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value}>
                {pt.label}
              </option>
            ))}
          </select>
        </div>

        {data.policyType === 'term' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Term Length
            </label>
            <select
              value={data.termLength ?? ''}
              onChange={(e) => update('termLength', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              {TERM_LENGTHS.map((tl) => (
                <option key={tl.value} value={tl.value}>
                  {tl.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.isSmoker}
            onChange={(e) => update('isSmoker', e.target.checked)}
            className="rounded border-gray-300"
          />
          Smoker?
        </label>

        <div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={data.hasHealthConditions}
              onChange={(e) =>
                update('hasHealthConditions', e.target.checked)
              }
              className="rounded border-gray-300"
            />
            Major health conditions?
          </label>
          {data.hasHealthConditions && (
            <div className="mt-2 ml-6">
              <textarea
                value={data.healthConditionsDescription ?? ''}
                onChange={(e) =>
                  update('healthConditionsDescription', e.target.value)
                }
                maxLength={300}
                rows={3}
                placeholder="Please describe..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 text-right">
                {(data.healthConditionsDescription ?? '').length}/300
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (feet)
          </label>
          <select
            value={data.heightFeet}
            onChange={(e) => update('heightFeet', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Feet</option>
            {feetOptions().map((f) => (
              <option key={f} value={f}>
                {f}&apos;
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height (inches)
          </label>
          <select
            value={data.heightInches}
            onChange={(e) => update('heightInches', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Inches</option>
            {inchesOptions().map((i) => (
              <option key={i} value={i}>
                {i}&quot;
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight (lbs)
          </label>
          <input
            type="number"
            value={data.weight}
            onChange={(e) => update('weight', e.target.value)}
            placeholder="150"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beneficiary Name
          </label>
          <input
            type="text"
            value={data.beneficiaryName}
            onChange={(e) => update('beneficiaryName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beneficiary Relationship
          </label>
          <select
            value={data.beneficiaryRelationship}
            onChange={(e) =>
              update('beneficiaryRelationship', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            {BENEFICIARY_RELATIONSHIPS.map((br) => (
              <option key={br.value} value={br.value}>
                {br.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
