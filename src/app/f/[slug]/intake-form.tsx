'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import type {
  BrokerData,
  InsuranceType,
  IntakeFormData,
  PersonalInfo,
  CurrentInsurance,
  TypeSpecificData,
  OtherData,
  AutoPersonalData,
  AutoCommercialData,
  Driver,
  FormConfig,
  CustomField,
  CustomFieldType,
} from '@/lib/types/intake-form';
import { QuotzalLogo } from '@/components/ui/logo';
import { ProgressBar } from './components/progress-bar';
import { StepInsuranceType } from './components/step-insurance-type';
import { StepPersonalInfo } from './components/step-personal-info';
import {
  StepTypeFields,
  getDefaultTypeData,
  hasVehicleStep,
} from './components/step-type-fields';
import { StepCurrentInsurance } from './components/step-current-insurance';
import { StepReview } from './components/step-review';
import { ThankYou } from './components/thank-you';

interface IntakeFormProps {
  broker: BrokerData;
  preview?: boolean;
}

const TOTAL_STEPS = 6;

const INITIAL_PERSONAL_INFO: PersonalInfo = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
};

const INITIAL_CURRENT_INSURANCE: CurrentInsurance = {
  hasCurrentInsurance: false,
};

function validateDob(dob: string): string | null {
  if (!dob) return 'Date of birth is required';
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return 'Invalid date';
  const today = new Date();
  if (birthDate > today) return 'Date of birth cannot be in the future';
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  if (age < 14) return 'Must be at least 14 years old';
  if (age > 100) return 'Please verify date of birth';
  return null;
}

function validatePersonalInfo(data: PersonalInfo, fc: FormConfig): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.firstName.trim()) errors.firstName = 'First name is required';
  if (!data.lastName.trim()) errors.lastName = 'Last name is required';

  if (fc.fields.date_of_birth.enabled) {
    if (fc.fields.date_of_birth.required || data.dateOfBirth) {
      const dobError = validateDob(data.dateOfBirth);
      if (dobError && fc.fields.date_of_birth.required) errors.dateOfBirth = dobError;
    }
  }

  if (fc.fields.phone.enabled) {
    if (fc.fields.phone.required && (!data.phone || data.phone.replace(/\D/g, '').length < 10)) {
      errors.phone = 'Valid phone number is required';
    }
  }

  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'Valid email is required';
  return errors;
}

function validateDrivers(drivers: Driver[]): string | null {
  for (const driver of drivers) {
    if (!driver.noUsLicense && !driver.licenseNumber.trim()) {
      return 'All drivers must have a license number (or check "No US driver\'s license")';
    }
    if (driver.dateOfBirth) {
      const dobErr = validateDob(driver.dateOfBirth);
      if (dobErr) return `Driver "${driver.fullName || 'Unnamed'}": ${dobErr}`;
    }
  }
  return null;
}

function validateVehicles(vehicles: { vin: string }[]): string | null {
  for (const vehicle of vehicles) {
    if (!vehicle.vin.trim()) return 'All vehicles must have a VIN';
  }
  return null;
}

function validateTypeSpecificDrivers(
  type: InsuranceType,
  data: TypeSpecificData | null
): string | null {
  if (!data) return 'Please fill in the required details';

  if (type === 'auto_personal') {
    return validateDrivers((data as AutoPersonalData).drivers);
  }
  if (type === 'auto_commercial') {
    return validateDrivers((data as AutoCommercialData).drivers);
  }
  if (type === 'other') {
    if (!(data as OtherData).description.trim()) return 'Description is required';
  }
  return null;
}

function validateTypeSpecificVehicles(
  type: InsuranceType,
  data: TypeSpecificData | null
): string | null {
  if (!data) return 'Please fill in the required details';

  if (type === 'auto_personal') {
    return validateVehicles((data as AutoPersonalData).vehicles);
  }
  if (type === 'auto_commercial') {
    return validateVehicles((data as AutoCommercialData).vehicles);
  }
  return null;
}

export function IntakeForm({ broker, preview = false }: IntakeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [rateLimited, setRateLimited] = useState(false);
  const [personalInfoErrors, setPersonalInfoErrors] = useState<
    Record<string, string>
  >({});
  const [typeSpecificError, setTypeSpecificError] = useState('');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  // Auto-select if only 1 insurance type is enabled
  const singleType = broker.insuranceTypesEnabled.length === 1 ? broker.insuranceTypesEnabled[0] : null;

  const [formData, setFormData] = useState<IntakeFormData>({
    insuranceType: singleType ?? '',
    personalInfo: INITIAL_PERSONAL_INFO,
    typeSpecificData: singleType ? getDefaultTypeData(singleType) : null,
    currentInsurance: INITIAL_CURRENT_INSURANCE,
  });

  // Skip step 0 if only 1 type
  useEffect(() => {
    if (singleType && currentStep === 0) {
      setCurrentStep(1);
    }
  }, [singleType, currentStep]);

  const isPro =
    broker.plan === 'pro' &&
    ['active', 'trialing', 'past_due'].includes(broker.status);
  const brandColor = isPro ? broker.brandColor : null;
  const accentColor = brandColor ?? '#059669';
  const fc = broker.formConfig;

  const insType = formData.insuranceType as InsuranceType;
  const isAutoType = hasVehicleStep(insType);
  const skipCurrentInsurance = !fc.fields.current_insurance.enabled;

  // Build the actual step sequence for progress tracking
  const activeSteps: number[] = [0, 1, 2]; // type, personal, type-details
  if (isAutoType) activeSteps.push(3); // vehicles
  if (!skipCurrentInsurance) activeSteps.push(4); // current insurance
  activeSteps.push(5); // review
  const effectiveTotalSteps = activeSteps.length;
  const effectiveCurrentStep = activeSteps.indexOf(currentStep);
  const progressStep = effectiveCurrentStep >= 0 ? effectiveCurrentStep : 0;

  // Visible custom fields for current insurance type
  const visibleCustomFields = fc.custom_fields.filter((cf) =>
    cf.applies_to === 'all' ||
    (Array.isArray(cf.applies_to) && (insType ? cf.applies_to.includes(insType) : true))
  );

  function handleNext() {
    // Step 0: Insurance Type
    if (currentStep === 0 && !formData.insuranceType) return;

    // Step 1: Personal Info + custom fields
    if (currentStep === 1) {
      const errors = validatePersonalInfo(formData.personalInfo, fc);
      setPersonalInfoErrors(errors);
      // Validate required custom fields
      for (const cf of visibleCustomFields) {
        if (cf.required && !customFieldValues[cf.id]?.trim()) {
          errors[`custom_${cf.id}`] = `${cf.label} is required`;
        }
      }
      if (Object.keys(errors).length > 0) {
        setPersonalInfoErrors(errors);
        return;
      }
    }

    // Step 2: Drivers / type-specific details
    if (currentStep === 2) {
      setTypeSpecificError('');
      const err = validateTypeSpecificDrivers(insType, formData.typeSpecificData);
      if (err) {
        setTypeSpecificError(err);
        return;
      }
    }

    // Step 3: Vehicles (auto types) — skip for non-auto
    if (currentStep === 3 && isAutoType) {
      setTypeSpecificError('');
      const err = validateTypeSpecificVehicles(insType, formData.typeSpecificData);
      if (err) {
        setTypeSpecificError(err);
        return;
      }
    }

    // For non-auto types, skip the vehicles step (step 3)
    if (currentStep === 2 && !isAutoType) {
      setCurrentStep(skipCurrentInsurance ? 5 : 4);
      return;
    }

    // Skip current insurance if disabled
    if (currentStep === 3 && skipCurrentInsurance) {
      setCurrentStep(5); // jump to review
      return;
    }

    const nextStep = currentStep + 1;
    // Also skip current insurance when advancing from step 3 vehicles
    if (nextStep === 4 && skipCurrentInsurance) {
      setCurrentStep(5);
      return;
    }

    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function handleBack() {
    // Skip current insurance going back
    if (currentStep === 5 && skipCurrentInsurance) {
      setCurrentStep(isAutoType ? 3 : 2);
      return;
    }
    // For non-auto types, skip back over vehicles step
    if (currentStep === 4 && !isAutoType) {
      setCurrentStep(2);
      return;
    }
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function handleEditFromReview(step: number) {
    setCurrentStep(step);
  }

  function handleInsuranceTypeSelect(type: InsuranceType) {
    const needsReset = formData.insuranceType !== type;
    if (needsReset) {
      setCustomFieldValues({});
      setTypeSpecificError('');
    }
    setFormData((prev) => ({
      ...prev,
      insuranceType: type,
      typeSpecificData: needsReset ? getDefaultTypeData(type) : prev.typeSpecificData,
    }));
  }

  function handlePersonalInfoChange(data: PersonalInfo) {
    setFormData((prev) => ({ ...prev, personalInfo: data }));
    if (Object.keys(personalInfoErrors).length > 0) {
      setPersonalInfoErrors({});
    }
  }

  function handleTypeSpecificChange(data: TypeSpecificData) {
    setFormData((prev) => ({ ...prev, typeSpecificData: data }));
  }

  function handleCurrentInsuranceChange(data: CurrentInsurance) {
    setFormData((prev) => ({ ...prev, currentInsurance: data }));
  }

  async function handleSubmit() {
    if (preview) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brokerId: broker.id,
          linkId: broker.linkId,
          insuranceType: formData.insuranceType,
          personalInfo: formData.personalInfo,
          typeSpecificData: {
            ...(formData.typeSpecificData as unknown as Record<string, unknown>),
            custom_fields: Object.keys(customFieldValues).length > 0 ? customFieldValues : undefined,
          },
          currentInsurance: skipCurrentInsurance
            ? { hasCurrentInsurance: false }
            : formData.currentInsurance,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          setRateLimited(true);
          return;
        }
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? 'Submission failed');
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    const firstName = formData.personalInfo.firstName;
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-lg">
            {/* Animated checkmark */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-600 animate-[scale-in_0.3s_ease-out]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-2">
              You&apos;re all set{firstName ? `, ${firstName}` : ''}!
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed text-center mb-6">
              {broker.brokerageName} received your information and will be in touch shortly.
            </p>

            {/* Broker contact cards */}
            <div className="space-y-3 mb-6">
              {broker.logoUrl && isPro && (
                <div className="flex justify-center mb-2">
                  <img src={broker.logoUrl} alt={broker.brokerageName} className="h-10 w-auto object-contain" />
                </div>
              )}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                {broker.phone && (
                  <a href={`tel:${broker.phone}`} className="flex items-center gap-3 text-sm text-slate-700 hover:text-emerald-700 transition-colors">
                    <span className="text-lg">📞</span>
                    <span>Call us: {broker.phone}</span>
                  </a>
                )}
                {broker.email && (
                  <a href={`mailto:${broker.email}`} className="flex items-center gap-3 text-sm text-slate-700 hover:text-emerald-700 transition-colors">
                    <span className="text-lg">✉️</span>
                    <span>Email us</span>
                  </a>
                )}
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">What happens next?</h3>
              <div className="space-y-3">
                {[
                  'Your broker receives your complete submission instantly',
                  'They review your information and prepare your quote',
                  'Expect to hear back within 1–2 business days',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-600">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-6">
              <QuotzalLogo size="xs" variant="icon" />
              <span>Powered by Quotzal</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasHomeType = broker.insuranceTypesEnabled.includes('home');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {hasHomeType && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`}
          strategy="lazyOnload"
        />
      )}
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-2.5">
              {isPro && broker.logoUrl ? (
                <img
                  src={broker.logoUrl}
                  alt={broker.brokerageName}
                  className="h-7 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: accentColor }}>
                    <span className="text-[11px] font-bold text-white">{broker.brokerageName[0].toUpperCase()}</span>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{broker.brokerageName}</span>
                </>
              )}
            </div>
            {!isPro && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-gray-400">Powered by</span>
                <QuotzalLogo size="xs" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 md:py-10">
        <div className="max-w-2xl mx-auto min-h-[calc(100vh-160px)]">
          <ProgressBar
            currentStep={progressStep}
            totalSteps={effectiveTotalSteps}
            brandColor={brandColor}
          />

          <div className="space-y-6">
            {/* Step 0: Insurance Type */}
            {currentStep === 0 && (
              <StepInsuranceType
                selected={formData.insuranceType}
                enabledTypes={broker.insuranceTypesEnabled}
                onSelect={handleInsuranceTypeSelect}
                brandColor={brandColor}
              />
            )}

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div>
                <StepPersonalInfo
                  data={formData.personalInfo}
                  onChange={handlePersonalInfoChange}
                  errors={personalInfoErrors}
                  formConfig={fc}
                />
                {/* Custom fields */}
                {visibleCustomFields.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                    <p className="text-sm font-medium text-slate-700">Additional Information</p>
                    {visibleCustomFields.map((cf) => (
                      <div key={cf.id}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {cf.label}
                          {cf.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {cf.type === 'text' && (
                          <input
                            type="text"
                            value={customFieldValues[cf.id] ?? ''}
                            onChange={(e) => setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                          />
                        )}
                        {cf.type === 'textarea' && (
                          <textarea
                            value={customFieldValues[cf.id] ?? ''}
                            onChange={(e) => setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })}
                            rows={3}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
                          />
                        )}
                        {cf.type === 'select' && (
                          <select
                            value={customFieldValues[cf.id] ?? ''}
                            onChange={(e) => setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                          >
                            <option value="">Select...</option>
                            {cf.options.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                        {cf.type === 'yes_no' && (
                          <div className="flex gap-4">
                            {['Yes', 'No'].map((opt) => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`custom_${cf.id}`}
                                  value={opt}
                                  checked={customFieldValues[cf.id] === opt}
                                  onChange={(e) => setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })}
                                  className="text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-slate-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {personalInfoErrors[`custom_${cf.id}`] && (
                          <p className="mt-1 text-xs text-red-600">{personalInfoErrors[`custom_${cf.id}`]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Drivers / type-specific details */}
            {currentStep === 2 && formData.insuranceType && (
              <StepTypeFields
                insuranceType={insType}
                personalInfo={formData.personalInfo}
                data={formData.typeSpecificData}
                onChange={handleTypeSpecificChange}
                section="drivers"
              />
            )}

            {/* Step 3: Vehicles (auto types only) */}
            {currentStep === 3 && formData.insuranceType && (
              <StepTypeFields
                insuranceType={insType}
                personalInfo={formData.personalInfo}
                data={formData.typeSpecificData}
                onChange={handleTypeSpecificChange}
                section="vehicles"
              />
            )}

            {/* Validation error for steps 2 and 3 */}
            {(currentStep === 2 || currentStep === 3) && typeSpecificError && (
              <p className="mt-3 text-sm text-red-600 text-center">
                {typeSpecificError}
              </p>
            )}

            {/* Step 4: Current Insurance */}
            {currentStep === 4 && (
              <StepCurrentInsurance
                data={formData.currentInsurance}
                onChange={handleCurrentInsuranceChange}
              />
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <>
                <StepReview
                  data={formData}
                  onEdit={handleEditFromReview}
                  brandColor={brandColor}
                  skipCurrentInsurance={skipCurrentInsurance}
                  customFieldValues={customFieldValues}
                  customFields={visibleCustomFields}
                />

                {/* Consent + trust badges */}
                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      By submitting, you consent to this information being shared with your insurance broker
                      for quoting purposes. Your data is encrypted and handled securely.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-5 mt-4 pt-4 border-t border-gray-100">
                  {[
                    { icon: '🔒', text: 'SSL encrypted' },
                    { icon: '📧', text: 'Confirmation sent' },
                    { icon: '🚫', text: 'No spam, ever' },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
          <div className="h-32" />
        </div>
      </main>

      {/* Sticky bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="h-11 px-5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shrink-0"
              >
                ← Back
              </button>
            ) : <div />}

            {currentStep < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 0 && !formData.insuranceType}
                className="flex-1 h-11 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: accentColor }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-11 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-sm disabled:opacity-60"
                style={{ backgroundColor: accentColor }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit my information →'
                )}
              </button>
            )}
          </div>

          {submitError && (
            <p className="mt-2 text-xs text-red-500 text-center">{submitError}</p>
          )}

          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            <span className="text-[11px] text-gray-300">Your information is encrypted and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="py-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <QuotzalLogo size="xs" variant="icon" />
        <span>Secured by Quotzal</span>
      </div>
      <p className="text-xs text-slate-500 text-center mt-2">
        Your information is encrypted and only shared with your broker.{' '}
        <a href="/privacy" className="underline hover:text-slate-700">Privacy Policy</a>{' · '}
        <a href="/terms" className="underline hover:text-slate-700">Terms</a>
      </p>
    </footer>
  );
}
