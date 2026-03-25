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
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              value={data.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className={`w-full h-11 px-4 text-sm border rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 ${
                errors.firstName ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              value={data.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className={`w-full h-11 px-4 text-sm border rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 ${
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
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-slate-700 mb-1">
              Date of Birth
              {formConfig?.fields.date_of_birth.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id="dateOfBirth"
              type="date"
              autoComplete="bday"
              value={data.dateOfBirth}
              onChange={(e) => update('dateOfBirth', e.target.value)}
              className={`w-full h-11 px-4 text-sm border rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 ${
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
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            className={`w-full h-11 px-4 text-sm border rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 ${
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
