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
import { StepHelpPanel } from './components/step-help-panel';
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

interface DriverErrors {
  [driverIndex: number]: Record<string, string>;
}

function validateDrivers(drivers: Driver[], fc: FormConfig): { message: string | null; driverErrors: DriverErrors } {
  const driverErrors: DriverErrors = {};
  const licenseRequired = fc.fields.driver_license_number.enabled && fc.fields.driver_license_number.required;

  for (let i = 0; i < drivers.length; i++) {
    const driver = drivers[i];
    const errors: Record<string, string> = {};

    if (!driver.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (driver.dateOfBirth) {
      const dobErr = validateDob(driver.dateOfBirth);
      if (dobErr) errors.dateOfBirth = dobErr;
    }

    if (licenseRequired && !driver.noUsLicense) {
      if (!driver.licenseNumber.trim()) {
        errors.licenseNumber = 'License number is required';
      }
      if (!driver.licenseState || driver.licenseState.trim() === '') {
        errors.licenseState = 'License state is required';
      }
    }

    if (Object.keys(errors).length > 0) {
      driverErrors[i] = errors;
    }
  }

  const hasErrors = Object.keys(driverErrors).length > 0;
  const message = hasErrors ? 'Please fix the highlighted errors below' : null;
  return { message, driverErrors };
}

function validateVehicles(vehicles: { vin: string }[], fc: FormConfig): string | null {
  const vinRequired = fc.fields.vin.enabled && fc.fields.vin.required;
  if (vinRequired) {
    for (const vehicle of vehicles) {
      if (!vehicle.vin.trim()) return 'All vehicles must have a VIN';
    }
  }
  return null;
}

function validateTypeSpecificDrivers(
  type: InsuranceType,
  data: TypeSpecificData | null,
  fc: FormConfig
): { message: string | null; driverErrors: DriverErrors } {
  if (!data) return { message: 'Please fill in the required details', driverErrors: {} };

  if (type === 'auto_personal') {
    return validateDrivers((data as AutoPersonalData).drivers, fc);
  }
  if (type === 'auto_commercial') {
    return validateDrivers((data as AutoCommercialData).drivers, fc);
  }
  if (type === 'other') {
    if (!(data as OtherData).description.trim()) return { message: 'Description is required', driverErrors: {} };
  }
  return { message: null, driverErrors: {} };
}

function validateTypeSpecificVehicles(
  type: InsuranceType,
  data: TypeSpecificData | null,
  fc: FormConfig
): string | null {
  if (!data) return 'Please fill in the required details';

  if (type === 'auto_personal') {
    return validateVehicles((data as AutoPersonalData).vehicles, fc);
  }
  if (type === 'auto_commercial') {
    return validateVehicles((data as AutoCommercialData).vehicles, fc);
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
  const [driverErrors, setDriverErrors] = useState<DriverErrors>({});
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});

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
      setDriverErrors({});
      const { message, driverErrors: errs } = validateTypeSpecificDrivers(insType, formData.typeSpecificData, fc);
      if (message) {
        setTypeSpecificError(message);
        setDriverErrors(errs);
        return;
      }
    }

    // Step 3: Vehicles (auto types) — skip for non-auto
    if (currentStep === 3 && isAutoType) {
      setTypeSpecificError('');
      const err = validateTypeSpecificVehicles(insType, formData.typeSpecificData, fc);
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
    // Clear all error state when navigating back
    setPersonalInfoErrors({});
    setTypeSpecificError('');
    setDriverErrors({});

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

  function handleExtraFieldChange(key: string, value: string) {
    setExtraFields((prev) => ({ ...prev, [key]: value }));
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
            extended_fields: Object.keys(extraFields).length > 0 ? extraFields : undefined,
          },
          currentInsurance: skipCurrentInsurance
            ? { hasCurrentInsurance: false }
            : formData.currentInsurance,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          setRateLimited(true);
          setSubmitError('Too many submissions. Please try again later.');
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
        <style>{`
          @keyframes checkmark-scale {
            0% { transform: scale(0.5); opacity: 0; }
            60% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes checkmark-draw {
            0% { stroke-dashoffset: 24; }
            100% { stroke-dashoffset: 0; }
          }
        `}</style>
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-lg">
            {/* Animated checkmark */}
            <div className="flex justify-center mb-6">
              <div
                className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center"
                style={{ animation: 'checkmark-scale 0.5s ease-out forwards' }}
              >
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                    style={{ strokeDasharray: 24, animation: 'checkmark-draw 0.4s ease-out 0.3s forwards', strokeDashoffset: 24 }}
                  />
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
              <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                {broker.phone && (
                  <a href={`tel:${broker.phone}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-emerald-700 transition-colors">
                    <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    <span>Call us: {broker.phone}</span>
                  </a>
                )}
                {broker.email && (
                  <a href={`mailto:${broker.email}`} className="flex items-center gap-3 text-sm text-gray-700 hover:text-emerald-700 transition-colors">
                    <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <span>Email us: {broker.email}</span>
                  </a>
                )}
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">What happens next?</h3>
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
                    <span className="text-sm text-gray-600">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-6">
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
        <div className="max-w-2xl lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left column — form */}
        <div className="flex-1 flex flex-col px-4 py-6 md:py-10 lg:py-12">
          <div className="flex-1 max-w-2xl lg:max-w-xl w-full mx-auto lg:mx-0 lg:ml-auto lg:mr-0 lg:pl-8 xl:pl-12">
            {/* Mobile progress bar */}
            <div className="lg:hidden">
              <ProgressBar
                currentStep={progressStep}
                totalSteps={effectiveTotalSteps}
                brandColor={brandColor}
                insuranceType={insType}
                rawStep={currentStep}
              />
            </div>

            {/* Desktop progress bar */}
            <div className="hidden lg:block mb-8">
              <ProgressBar
                currentStep={progressStep}
                totalSteps={effectiveTotalSteps}
                brandColor={brandColor}
                insuranceType={insType}
                rawStep={currentStep}
              />
            </div>

            {/* Mobile help hints */}
            <div className="lg:hidden mb-4">
              {currentStep === 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-emerald-600 text-sm">&#x23F1;</span>
                  <p className="text-xs text-emerald-700 font-medium">Takes about 3 minutes · Your info is encrypted</p>
                </div>
              )}
              {(currentStep === 3) && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-emerald-700 font-medium">&#x1F4A1; Enter your VIN to auto-fill Year, Make &amp; Model</p>
                </div>
              )}
            </div>

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
                  extendedConfig={broker.extendedFormConfig}
                  insuranceType={insType || undefined}
                  extraFields={extraFields}
                  onExtraFieldChange={handleExtraFieldChange}
                />
                {/* Custom fields */}
                {visibleCustomFields.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                    <p className="text-sm font-medium text-gray-700">Additional Information</p>
                    {visibleCustomFields.map((cf) => (
                      <div key={cf.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {cf.label}
                          {cf.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {cf.type === 'text' && (
                          <input
                            type="text"
                            value={customFieldValues[cf.id] ?? ''}
                            onChange={(e) => setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })}
                            className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                          />
                        )}
                        {cf.type === 'textarea' && (
                          <textarea
                            value={customFieldValues[cf.id] ?? ''}
                            onChange={(e) => setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 resize-none"
                          />
                        )}
                        {cf.type === 'select' && (
                          <select
                            value={customFieldValues[cf.id] ?? ''}
                            onChange={(e) => setCustomFieldValues({ ...customFieldValues, [cf.id]: e.target.value })}
                            className="w-full h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
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
                                  className="text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                                />
                                <span className="text-sm text-gray-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {personalInfoErrors[`custom_${cf.id}`] && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                            {personalInfoErrors[`custom_${cf.id}`]}
                          </p>
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
                formConfig={fc}
                extendedConfig={broker.extendedFormConfig}
                driverErrors={driverErrors}
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
                formConfig={fc}
                extendedConfig={broker.extendedFormConfig}
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
                formConfig={fc}
                extendedConfig={broker.extendedFormConfig}
                insuranceType={insType || undefined}
                extraFields={extraFields}
                onExtraFieldChange={handleExtraFieldChange}
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
                  extraFields={extraFields}
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

            {/* Mobile bottom padding */}
            <div className="lg:hidden h-32" />
          </div>

          {/* Desktop nav — pinned to bottom of left column */}
          <div className="hidden lg:block max-w-xl w-full mx-auto lg:mx-0 lg:ml-auto lg:mr-0 lg:pl-8 xl:pl-12 pb-8 pt-6">
            <div className="flex items-center gap-4">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-12 px-6 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  ← Back
                </button>
              ) : <div />}

              {currentStep < TOTAL_STEPS - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentStep === 0 && !formData.insuranceType}
                  className="flex-1 h-12 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: accentColor }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 h-12 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-sm disabled:opacity-60"
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

            {/* Desktop security note */}
            <div className="flex items-center gap-1.5 mt-4">
              <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
              <span className="text-xs text-gray-300">Your information is encrypted and secure</span>
            </div>
          </div>
        </div>

        {/* Right column — help panel */}
        <div className="hidden lg:flex lg:w-80 xl:w-96 shrink-0 flex-col gap-4 bg-gray-50/80 border-l border-gray-100 px-8 py-12 items-start">
          <StepHelpPanel currentStep={currentStep} insuranceType={formData.insuranceType} />
        </div>
      </main>

      {/* MOBILE ONLY — Sticky bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <div className="px-4 py-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="h-12 px-5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shrink-0"
              >
                ← Back
              </button>
            ) : <div />}

            {currentStep < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 0 && !formData.insuranceType}
                className="flex-1 h-12 text-base font-semibold text-white rounded-xl transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: accentColor }}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-12 text-base font-semibold text-white rounded-xl transition-all duration-200 shadow-sm disabled:opacity-60"
                style={{ backgroundColor: accentColor }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit →'
                )}
              </button>
            )}
          </div>

          {submitError && (
            <p className="mt-2 text-xs text-red-500 text-center">{submitError}</p>
          )}

          <p className="text-center text-[11px] text-gray-300 mt-2">🔒 Encrypted and secure</p>
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
