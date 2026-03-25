'use client';

import type {
  Driver,
  DriverRelationship,
  DriverRole,
  MaritalStatus,
} from '@/lib/types/intake-form';
import { US_STATES } from '@/lib/constants/states';
import { ViolationEntry, emptyViolation } from './violation-entry';

interface DriverCardProps {
  driver: Driver;
  index: number;
  onChange: (driver: Driver) => void;
  onRemove?: () => void;
  mode: 'personal' | 'commercial';
  isPrimary?: boolean;
  errors?: Record<string, string>;
}

const RELATIONSHIPS: { value: DriverRelationship; label: string }[] = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

const ROLES: { value: DriverRole; label: string }[] = [
  { value: 'owner', label: 'Owner' },
  { value: 'employee', label: 'Employee' },
  { value: 'contractor', label: 'Contractor' },
];

const MARITAL_STATUSES: { value: MaritalStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

const LICENSE_TYPES = [
  'No License',
  'International License',
  'Foreign License',
  'Permit Only',
  'Suspended',
  'Expired',
];

const INPUT_CLASS = 'w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200';
const SELECT_CLASS = 'w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200';
const ERROR_INPUT_CLASS = 'w-full h-11 px-4 text-sm border border-red-300 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all duration-200';

function getAgeFromDob(dob: string): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function validateDob(dob: string): string | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return 'Invalid date';
  const today = new Date();
  if (birthDate > today) return 'Date of birth cannot be in the future';
  const age = getAgeFromDob(dob);
  if (age !== null && age < 14) return 'Driver must be at least 14 years old';
  if (age !== null && age > 100) return 'Please verify date of birth';
  return null;
}

export function DriverCard({
  driver,
  index,
  onChange,
  onRemove,
  mode,
  isPrimary,
  errors,
}: DriverCardProps) {
  function update(field: string, value: unknown) {
    onChange({ ...driver, [field]: value });
  }

  const dobError = errors?.dateOfBirth || validateDob(driver.dateOfBirth);
  const age = getAgeFromDob(driver.dateOfBirth);
  const showGoodStudent =
    mode === 'personal' &&
    driver.relationship === 'child' &&
    age !== null &&
    age < 25;

  const hasNoUsLicense = driver.noUsLicense === true;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 bg-emerald-50 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xs font-bold text-white">{index + 1}</span>
          </div>
          <div>
            <span className="text-sm font-bold text-emerald-900">
              {isPrimary ? 'Primary Driver' : `Driver ${index + 1}`}
            </span>
            {driver.fullName && (
              <span className="text-xs text-emerald-600 ml-2 font-medium">— {driver.fullName}</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={driver.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        {/* 2. Date of Birth with age display */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date of Birth
            {age !== null && !dobError && (
              <span className="ml-2 text-slate-400 font-normal">Age: {age}</span>
            )}
          </label>
          <input
            type="date"
            value={driver.dateOfBirth}
            onChange={(e) => update('dateOfBirth', e.target.value)}
            className={dobError ? ERROR_INPUT_CLASS : INPUT_CLASS}
          />
          {dobError && (
            <p className="text-red-500 text-sm mt-1">{dobError}</p>
          )}
        </div>

        {/* 3. License State — only if has US license */}
        {!hasNoUsLicense && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              License State
            </label>
            <select
              value={driver.licenseState}
              onChange={(e) => update('licenseState', e.target.value)}
              className={SELECT_CLASS}
            >
              <option value=""></option>
              {US_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 4. License Number — only if has US license */}
        {!hasNoUsLicense && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              License Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={driver.licenseNumber}
              onChange={(e) => update('licenseNumber', e.target.value)}
              maxLength={8}
              inputMode="text"
              autoCapitalize="characters"
              className={errors?.licenseNumber ? ERROR_INPUT_CLASS : INPUT_CLASS}
            />
            {errors?.licenseNumber ? (
              <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>
            ) : (
              <p className="text-xs text-slate-400 mt-1">Required for accurate quote — typically 6-8 characters</p>
            )}
          </div>
        )}

        {/* 5. Relationship (personal) or Role (commercial) */}
        {mode === 'personal' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Relationship
            </label>
            <select
              value={driver.relationship ?? ''}
              onChange={(e) => update('relationship', e.target.value)}
              className={SELECT_CLASS}
            >
              {RELATIONSHIPS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === 'commercial' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Role
            </label>
            <select
              value={driver.role ?? ''}
              onChange={(e) => update('role', e.target.value)}
              className={SELECT_CLASS}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 6. Marital Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Marital Status
          </label>
          <select
            value={driver.maritalStatus ?? 'single'}
            onChange={(e) => update('maritalStatus', e.target.value)}
            className={SELECT_CLASS}
          >
            {MARITAL_STATUSES.map((ms) => (
              <option key={ms.value} value={ms.value}>
                {ms.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* No US License checkbox */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={hasNoUsLicense}
            onChange={(e) => {
              const checked = e.target.checked;
              onChange({
                ...driver,
                noUsLicense: checked,
                licenseNumber: checked ? '' : driver.licenseNumber,
                licenseState: checked ? '' : driver.licenseState,
                licenseType: checked ? driver.licenseType : undefined,
              });
            }}
            className="rounded border-slate-300"
          />
          No US driver&apos;s license
        </label>
        {hasNoUsLicense && (
          <div className="ml-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              License Type
            </label>
            <select
              value={driver.licenseType ?? 'No License'}
              onChange={(e) => update('licenseType', e.target.value)}
              className={`w-full md:w-1/2 h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200`}
            >
              {LICENSE_TYPES.map((lt) => (
                <option key={lt} value={lt}>{lt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Good Student Discount — only for child under 25 */}
      {showGoodStudent && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={driver.goodStudentDiscount ?? false}
            onChange={(e) => update('goodStudentDiscount', e.target.checked)}
            className="rounded border-slate-300"
          />
          Good student discount (B average or better)
        </label>
      )}

      {/* 7. SR-22 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={driver.sr22Required}
            onChange={(e) => update('sr22Required', e.target.checked)}
            className="rounded border-slate-300"
          />
          SR-22 Required
        </label>
        {driver.sr22Required && (
          <select
            value={driver.sr22State ?? ''}
            onChange={(e) => update('sr22State', e.target.value)}
            className={`w-full md:w-1/2 h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200`}
          >
            <option value=""></option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 8. Violations — auto-add blank on check, clear on uncheck */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={driver.hasViolations}
            onChange={(e) => {
              const checked = e.target.checked;
              onChange({
                ...driver,
                hasViolations: checked,
                violations: checked ? [emptyViolation()] : [],
              });
            }}
            className="rounded border-slate-300"
          />
          Violations in last 5 years
        </label>
        {driver.hasViolations && (
          <ViolationEntry
            violations={driver.violations}
            onChange={(v) => update('violations', v)}
          />
        )}
      </div>
      </div>
    </div>
  );
}
