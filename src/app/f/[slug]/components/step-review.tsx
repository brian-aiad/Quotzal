'use client';

import type { IntakeFormData, InsuranceType } from '@/lib/types/intake-form';
import { getInsuranceTypeLabel } from '@/lib/constants/insurance-types';

interface StepReviewProps {
  data: IntakeFormData;
  onEdit: (step: number) => void;
  brandColor?: string | null;
}

interface SectionProps {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}

function Section({ title, step, onEdit, children }: SectionProps) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Edit
        </button>
      </div>
      <div className="text-sm text-slate-700 space-y-1">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <span className="font-medium text-slate-500 min-w-[140px]">
        {label}:
      </span>
      <span>{value}</span>
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

    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      // Drivers or vehicles array
      if (key === 'drivers') {
        items.push(
          <div key={key} className="pt-2">
            <span className="font-medium text-slate-500">
              Drivers ({value.length}):
            </span>
            {(value as Array<Record<string, unknown>>).map((d, i) => (
              <div key={i} className="ml-4 mt-1 text-xs bg-slate-50 rounded p-2">
                {d.fullName as string}
                {d.dateOfBirth ? ` | DOB: ${d.dateOfBirth as string}` : ''}
                {d.licenseState
                  ? ` | License: ${d.licenseState as string}`
                  : ''}
              </div>
            ))}
          </div>
        );
      } else if (key === 'vehicles') {
        items.push(
          <div key={key} className="pt-2">
            <span className="font-medium text-slate-500">
              Vehicles ({value.length}):
            </span>
            {(value as Array<Record<string, unknown>>).map((v, i) => (
              <div key={i} className="ml-4 mt-1 text-xs bg-slate-50 rounded p-2">
                {v.year as string} {v.make as string} {v.model as string}
                {v.vin ? ` | VIN: ${v.vin as string}` : ''}
              </div>
            ))}
          </div>
        );
      } else if (key === 'violations') {
        items.push(
          <div key={key} className="pt-2">
            <span className="font-medium text-slate-500">
              Violations ({value.length}):
            </span>
            {(value as Array<Record<string, unknown>>).map((v, i) => (
              <div key={i} className="ml-4 mt-1 text-xs bg-slate-50 rounded p-2">
                {v.type as string}
                {v.month && v.year
                  ? ` | ${v.month as string}/${v.year as string}`
                  : ''}
              </div>
            ))}
          </div>
        );
      }
    } else if (typeof value === 'boolean') {
      items.push(
        <Field key={key} label={label} value={value ? 'Yes' : 'No'} />
      );
    } else {
      items.push(
        <Field key={key} label={label} value={String(value)} />
      );
    }
  }

  if (items.length === 0) {
    return <p className="text-slate-400 italic">No details provided</p>;
  }

  return <>{items}</>;
}

export function StepReview({ data, onEdit, brandColor }: StepReviewProps) {
  const accentColor = brandColor ?? '#059669';
  void accentColor;

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Review Your Information
      </h2>
      <p className="text-sm text-slate-500 mb-6">
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
        </Section>

        {/* Type-Specific Details */}
        <Section title="Insurance Details" step={2} onEdit={onEdit}>
          {data.typeSpecificData
            ? renderTypeSpecificSummary(
                data.insuranceType as InsuranceType,
                data.typeSpecificData as unknown as Record<string, unknown>
              )
            : <p className="text-slate-400 italic">No details provided</p>}
        </Section>

        {/* Current Insurance */}
        <Section title="Current Insurance" step={4} onEdit={onEdit}>
          <Field
            label="Currently Insured"
            value={
              data.currentInsurance.hasCurrentInsurance ? 'Yes' : 'No'
            }
          />
          {data.currentInsurance.hasCurrentInsurance && (
            <>
              <Field
                label="Carrier"
                value={data.currentInsurance.currentCarrier}
              />
              <Field
                label="Coverage Limits"
                value={data.currentInsurance.currentCoverageLimits}
              />
              <Field
                label="Policy Expires"
                value={data.currentInsurance.policyExpiryDate}
              />
            </>
          )}
        </Section>
      </div>
    </div>
  );
}
