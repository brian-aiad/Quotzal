'use client';

import type { PersonalInfo, FormConfig } from '@/lib/types/intake-form';
import { PhoneInput } from './shared/phone-input';

interface StepPersonalInfoProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
  errors: Record<string, string>;
  formConfig?: FormConfig;
}

export function StepPersonalInfo({
  data,
  onChange,
  errors,
  formConfig,
}: StepPersonalInfoProps) {
  const showDob = formConfig?.fields.date_of_birth.enabled ?? true;
  const showPhone = formConfig?.fields.phone.enabled ?? true;

  function update(field: keyof PersonalInfo, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Personal Information
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Tell us about yourself.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                errors.firstName ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                errors.lastName ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        {showDob && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date of Birth
              {formConfig?.fields.date_of_birth.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={data.dateOfBirth}
              onChange={(e) => update('dateOfBirth', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
                errors.dateOfBirth ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>
            )}
          </div>
        )}

        {showPhone && (
          <PhoneInput
            value={data.phone}
            onChange={(v) => update('phone', v)}
            error={errors.phone}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white ${
              errors.email ? 'border-red-400' : 'border-slate-300'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email}</p>
          )}
        </div>
      </div>
    </div>
  );
}
