'use client';

import type { IntakeFormData, InsuranceType, CustomField } from '@/lib/types/intake-form';
import { getInsuranceTypeLabel } from '@/lib/constants/insurance-types';

interface StepReviewProps {
  data: IntakeFormData;
  onEdit: (step: number) => void;
  brandColor?: string | null;
  skipCurrentInsurance?: boolean;
  customFieldValues?: Record<string, string>;
  customFields?: CustomField[];
  extraFields?: Record<string, string>;
}

interface SectionProps {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}

function Section({ title, step, onEdit, children }: SectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="text-sm text-gray-700 space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[140px]">
        {label}
      </span>
      <span className="text-sm text-gray-900 font-medium">{value}</span>
    </div>
  );
}

function renderTypeSpecificSummary(
  type: InsuranceType,
  data: Record<string, unknown>
): React.ReactNode {
  const entries = Object.entries(data);
  const items: React.ReactNode[] = [];

  for (const [key, value] of entries) {
    if (value === null || value === undefined || value === '') continue;
    // Skip custom_fields — rendered separately
    if (key === 'custom_fields') continue;

    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      if (key === 'drivers') {
        items.push(
          <div key={key} className="pt-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Drivers ({value.length})
            </span>
            {(value as Array<Record<string, unknown>>).map((d, i) => (
              <div key={i} className="ml-4 mt-1 text-xs bg-gray-50 rounded-lg p-2.5 text-gray-900 font-medium">
                {d.fullName as string}
                {d.dateOfBirth ? ` | DOB: ${d.dateOfBirth as string}` : ''}
                {d.licenseState ? ` | License: ${d.licenseState as string}` : ''}
              </div>
            ))}
          </div>
        );
      } else if (key === 'vehicles') {
        items.push(
          <div key={key} className="pt-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Vehicles ({value.length})
            </span>
            {(value as Array<Record<string, unknown>>).map((v, i) => {
              const ymm = [v.year, v.make, v.model].filter(Boolean).join(' ');
              const display = ymm || 'Vehicle details pending';
              return (
                <div key={i} className="ml-4 mt-1 text-xs bg-gray-50 rounded-lg p-2.5 text-gray-900 font-medium">
                  {display}
                  {v.vin ? ` | VIN: ${v.vin as string}` : ''}
                </div>
              );
            })}
          </div>
        );
      } else if (key === 'violations') {
        items.push(
          <div key={key} className="pt-2">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Violations ({value.length})
            </span>
            {(value as Array<Record<string, unknown>>).map((v, i) => (
              <div key={i} className="ml-4 mt-1 text-xs bg-gray-50 rounded-lg p-2.5 text-gray-900 font-medium">
                {v.type as string}
                {v.month && v.year ? ` | ${v.month as string}/${v.year as string}` : ''}
              </div>
            ))}
          </div>
        );
      }
    } else if (typeof value === 'boolean') {
      items.push(<Field key={key} label={label} value={value ? 'Yes' : 'No'} />);
    } else {
      items.push(<Field key={key} label={label} value={String(value)} />);
    }
  }

  if (items.length === 0) {
    return <p className="text-gray-500 italic">No details provided</p>;
  }

  return <>{items}</>;
}

export function StepReview({
  data,
  onEdit,
  brandColor,
  skipCurrentInsurance = false,
  customFieldValues = {},
  customFields = [],
  extraFields = {},
}: StepReviewProps) {
  void brandColor;

  const hasCustomFieldData = customFields.length > 0 &&
    customFields.some((cf) => customFieldValues[cf.id]?.trim());

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
        Review Your Information
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Please review everything before submitting.
      </p>

      <div className="space-y-4">
        {/* Insurance Type */}
        <Section title="Insurance Type" step={0} onEdit={onEdit}>
          <p className="font-medium">
            {data.insuranceType
              ? getInsuranceTypeLabel(data.insuranceType as InsuranceType)
              : '—'}
          </p>
        </Section>

        {/* Personal Info */}
        <Section title="Personal Information" step={1} onEdit={onEdit}>
          <Field
            label="Name"
            value={`${data.personalInfo.firstName} ${data.personalInfo.lastName}`}
          />
          <Field label="Date of Birth" value={data.personalInfo.dateOfBirth} />
          <Field label="Phone" value={data.personalInfo.phone} />
          <Field label="Email" value={data.personalInfo.email} />
          {/* Custom field values */}
          {hasCustomFieldData && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              {customFields.map((cf) => {
                const val = customFieldValues[cf.id];
                if (!val?.trim()) return null;
                return <Field key={cf.id} label={cf.label} value={val} />;
              })}
            </div>
          )}
          {/* Extended field values */}
          {Object.keys(extraFields).length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              {Object.entries(extraFields).map(([key, val]) => {
                if (!val?.trim() || val === 'no') return null;
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (s) => s.toUpperCase())
                  .trim();
                return <Field key={key} label={label} value={val === 'yes' ? 'Yes' : val} />;
              })}
            </div>
          )}
        </Section>

        {/* Type-Specific Details */}
        <Section title="Insurance Details" step={2} onEdit={onEdit}>
          {data.typeSpecificData
            ? renderTypeSpecificSummary(
                data.insuranceType as InsuranceType,
                data.typeSpecificData as unknown as Record<string, unknown>
              )
            : <p className="text-gray-500 italic">No details provided</p>}
        </Section>

        {/* Current Insurance — only show if not skipped */}
        {!skipCurrentInsurance && (
          <Section title="Current Insurance" step={4} onEdit={onEdit}>
            <Field
              label="Currently Insured"
              value={
                data.currentInsurance.hasCurrentInsurance ? 'Yes' : 'No'
              }
            />
            {data.currentInsurance.hasCurrentInsurance && (
              <>
                <Field label="Carrier" value={data.currentInsurance.currentCarrier} />
                <Field label="Coverage Limits" value={data.currentInsurance.currentCoverageLimits} />
                <Field label="Policy Expires" value={data.currentInsurance.policyExpiryDate} />
                <Field label="Policy Number" value={extraFields.policyNumber} />
                <Field label="Years with Carrier" value={extraFields.yearsWithCarrier} />
                {extraFields.continuousCoverage === 'yes' && (
                  <Field label="Continuous Coverage" value="Yes" />
                )}
              </>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}
