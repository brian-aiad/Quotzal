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
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">
        Personal Information
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Tell us about yourself.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              value={data.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className={`w-full h-11 px-4 text-sm border rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.firstName ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200 bg-white focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              value={data.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className={`w-full h-11 px-4 text-sm border rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.lastName ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200 bg-white focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {showDob && (
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
              {formConfig?.fields.date_of_birth.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id="dateOfBirth"
              type="date"
              autoComplete="bday"
              value={data.dateOfBirth}
              onChange={(e) => update('dateOfBirth', e.target.value)}
              className={`w-full h-11 px-4 text-sm border rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.dateOfBirth ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200 bg-white focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                {errors.dateOfBirth}
              </p>
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            className={`w-full h-11 px-4 text-sm border rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.email ? 'border-red-400 bg-red-50 focus:ring-red-500/20 focus:border-red-400' : 'border-gray-200 bg-white focus:ring-emerald-500/20 focus:border-emerald-500'
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
              {errors.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
