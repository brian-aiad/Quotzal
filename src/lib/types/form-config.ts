// ============================================================
// Extended Form Config Types — Per-Insurance-Type Field Toggles
// ============================================================

import type { InsuranceType } from './intake-form';

// --- Base field config ---

export interface FieldToggle {
  show: boolean;
  required: boolean;
}

// --- Insurance step identifiers ---

export type InsuranceStep =
  | 'personal_info'
  | 'drivers'
  | 'vehicles'
  | 'property'
  | 'coverage'
  | 'current_insurance'
  | 'review';

// --- Custom field definition ---

export type CustomFieldType = 'text' | 'number' | 'select' | 'checkbox' | 'textarea';

export interface CustomField {
  id: string;
  label: string;
  type: CustomFieldType;
  options?: string[];
  required: boolean;
  step: InsuranceStep;
  insuranceType: InsuranceType | 'all';
}

// --- Per-insurance-type configs ---

export interface AutoPersonalConfig {
  // Personal Info step
  dateOfBirth: FieldToggle;
  phone: FieldToggle;
  occupation: FieldToggle;
  homeowner: FieldToggle;
  yearsLicensed: FieldToggle;
  // Drivers step
  licenseNumber: FieldToggle;
  licenseState: FieldToggle;
  maritalStatus: FieldToggle;
  sr22: FieldToggle;
  violations: FieldToggle;
  yearsWithLicense: FieldToggle;
  goodStudent: FieldToggle;
  // Vehicles step
  vin: FieldToggle;
  coverageType: FieldToggle;
  annualMileage: FieldToggle;
  primaryUse: FieldToggle;
  ownership: FieldToggle;
  antiTheft: FieldToggle;
  garagingAddress: FieldToggle;
  // Current Insurance step
  currentCarrier: FieldToggle;
  policyNumber: FieldToggle;
  policyExpiry: FieldToggle;
  currentLimits: FieldToggle;
  yearsWithCarrier: FieldToggle;
  continuousCoverage: FieldToggle;
}

export interface AutoCommercialConfig {
  // Business Info step (maps to personal_info step)
  businessName: FieldToggle;
  businessType: FieldToggle;
  yearsInBusiness: FieldToggle;
  dotNumber: FieldToggle;
  mcNumber: FieldToggle;
  feinNumber: FieldToggle;
  // Drivers step
  licenseNumber: FieldToggle;
  cdlClass: FieldToggle;
  mvrConsent: FieldToggle;
  sr22: FieldToggle;
  violations: FieldToggle;
  // Vehicles step
  vin: FieldToggle;
  coverageType: FieldToggle;
  vehicleClass: FieldToggle;
  gvwr: FieldToggle;
  cargoType: FieldToggle;
  annualMileage: FieldToggle;
  radiusOfOperation: FieldToggle;
  // Current Insurance step
  currentCarrier: FieldToggle;
  policyNumber: FieldToggle;
  policyExpiry: FieldToggle;
  currentLimits: FieldToggle;
}

export interface HomeRentersConfig {
  // Personal Info step
  dateOfBirth: FieldToggle;
  phone: FieldToggle;
  // Property Info step
  propertyAddress: FieldToggle;
  propertyType: FieldToggle;
  ownerOrRenter: FieldToggle;
  yearBuilt: FieldToggle;
  squareFootage: FieldToggle;
  constructionType: FieldToggle;
  roofType: FieldToggle;
  roofYear: FieldToggle;
  stories: FieldToggle;
  // Coverage step
  dwellingValue: FieldToggle;
  personalPropertyValue: FieldToggle;
  liabilityLimit: FieldToggle;
  deductible: FieldToggle;
  // Mortgage
  mortgageCompany: FieldToggle;
  loanNumber: FieldToggle;
  // Current Insurance step
  currentCarrier: FieldToggle;
  policyNumber: FieldToggle;
  policyExpiry: FieldToggle;
  currentPremium: FieldToggle;
  currentDeductible: FieldToggle;
}

export interface LifeInsuranceConfig {
  // Personal Info step
  dateOfBirth: FieldToggle;
  phone: FieldToggle;
  gender: FieldToggle;
  // Coverage step
  coverageAmountDesired: FieldToggle;
  coverageType: FieldToggle;
  termLength: FieldToggle;
  // Health step
  smoker: FieldToggle;
  majorHealthConditions: FieldToggle;
  heightWeight: FieldToggle;
  // Financial
  employmentStatus: FieldToggle;
  annualIncome: FieldToggle;
  beneficiaryName: FieldToggle;
  beneficiaryRelationship: FieldToggle;
  // Current Insurance step
  existingCoverage: FieldToggle;
  existingCarrier: FieldToggle;
  existingCoverageAmount: FieldToggle;
}

export interface MotorcycleConfig {
  // Personal Info step
  dateOfBirth: FieldToggle;
  phone: FieldToggle;
  licenseNumber: FieldToggle;
  licenseState: FieldToggle;
  sr22: FieldToggle;
  violations: FieldToggle;
  yearsRiding: FieldToggle;
  ridingCourse: FieldToggle;
  // Vehicle step
  vin: FieldToggle;
  coverageType: FieldToggle;
  annualMileage: FieldToggle;
  primaryUse: FieldToggle;
  storageLocation: FieldToggle;
  ridingSeason: FieldToggle;
  antiTheft: FieldToggle;
  // Current Insurance
  currentCarrier: FieldToggle;
  policyNumber: FieldToggle;
  policyExpiry: FieldToggle;
  currentLimits: FieldToggle;
}

export interface BoatConfig {
  // Personal Info step
  dateOfBirth: FieldToggle;
  phone: FieldToggle;
  boatingLicense: FieldToggle;
  boatingSafetyCourse: FieldToggle;
  // Vessel step
  hullId: FieldToggle;
  vesselLength: FieldToggle;
  hullMaterial: FieldToggle;
  engineType: FieldToggle;
  horsePower: FieldToggle;
  vesselValue: FieldToggle;
  storageLocation: FieldToggle;
  navigationArea: FieldToggle;
  coverageType: FieldToggle;
  // Current Insurance
  currentCarrier: FieldToggle;
  policyNumber: FieldToggle;
  policyExpiry: FieldToggle;
  currentLimits: FieldToggle;
}

export interface RVConfig {
  // Personal Info step
  dateOfBirth: FieldToggle;
  phone: FieldToggle;
  licenseNumber: FieldToggle;
  licenseState: FieldToggle;
  violations: FieldToggle;
  // Vehicle step
  vin: FieldToggle;
  rvClass: FieldToggle;
  fullTimer: FieldToggle;
  coverageType: FieldToggle;
  annualMileage: FieldToggle;
  storageLocation: FieldToggle;
  slideOuts: FieldToggle;
  // Current Insurance
  currentCarrier: FieldToggle;
  policyNumber: FieldToggle;
  policyExpiry: FieldToggle;
  currentLimits: FieldToggle;
}

export type InsuranceTypeConfig =
  | AutoPersonalConfig
  | AutoCommercialConfig
  | HomeRentersConfig
  | LifeInsuranceConfig
  | MotorcycleConfig
  | BoatConfig
  | RVConfig;

// --- Full FormConfig shape stored in brokers.form_config JSONB ---

export interface ExtendedFormConfig {
  enabledTypes: InsuranceType[];
  autoPersonal: AutoPersonalConfig;
  autoCommercial: AutoCommercialConfig;
  homeRenters: HomeRentersConfig;
  life: LifeInsuranceConfig;
  motorcycle: MotorcycleConfig;
  boat: BoatConfig;
  rv: RVConfig;
  customFields: CustomField[];
}

// --- Helper: on/off field toggle shorthand ---

const ON: FieldToggle = { show: true, required: false };
const OFF: FieldToggle = { show: false, required: false };

// --- Default configs per insurance type ---

export const DEFAULT_AUTO_PERSONAL: AutoPersonalConfig = {
  dateOfBirth: ON,
  phone: ON,
  occupation: OFF,
  homeowner: OFF,
  yearsLicensed: OFF,
  licenseNumber: ON,
  licenseState: ON,
  maritalStatus: ON,
  sr22: ON,
  violations: ON,
  yearsWithLicense: OFF,
  goodStudent: OFF,
  vin: ON,
  coverageType: ON,
  annualMileage: OFF,
  primaryUse: OFF,
  ownership: OFF,
  antiTheft: OFF,
  garagingAddress: OFF,
  currentCarrier: ON,
  policyNumber: OFF,
  policyExpiry: ON,
  currentLimits: ON,
  yearsWithCarrier: OFF,
  continuousCoverage: OFF,
};

export const DEFAULT_AUTO_COMMERCIAL: AutoCommercialConfig = {
  businessName: ON,
  businessType: ON,
  yearsInBusiness: ON,
  dotNumber: OFF,
  mcNumber: OFF,
  feinNumber: OFF,
  licenseNumber: ON,
  cdlClass: OFF,
  mvrConsent: OFF,
  sr22: ON,
  violations: ON,
  vin: ON,
  coverageType: ON,
  vehicleClass: OFF,
  gvwr: OFF,
  cargoType: OFF,
  annualMileage: OFF,
  radiusOfOperation: OFF,
  currentCarrier: ON,
  policyNumber: OFF,
  policyExpiry: ON,
  currentLimits: ON,
};

export const DEFAULT_HOME_RENTERS: HomeRentersConfig = {
  dateOfBirth: ON,
  phone: ON,
  propertyAddress: ON,
  propertyType: ON,
  ownerOrRenter: ON,
  yearBuilt: OFF,
  squareFootage: OFF,
  constructionType: OFF,
  roofType: OFF,
  roofYear: OFF,
  stories: OFF,
  dwellingValue: OFF,
  personalPropertyValue: OFF,
  liabilityLimit: OFF,
  deductible: OFF,
  mortgageCompany: OFF,
  loanNumber: OFF,
  currentCarrier: ON,
  policyNumber: OFF,
  policyExpiry: ON,
  currentPremium: OFF,
  currentDeductible: OFF,
};

export const DEFAULT_LIFE: LifeInsuranceConfig = {
  dateOfBirth: ON,
  phone: ON,
  gender: OFF,
  coverageAmountDesired: OFF,
  coverageType: ON,
  termLength: OFF,
  smoker: OFF,
  majorHealthConditions: OFF,
  heightWeight: OFF,
  employmentStatus: OFF,
  annualIncome: OFF,
  beneficiaryName: OFF,
  beneficiaryRelationship: OFF,
  existingCoverage: ON,
  existingCarrier: ON,
  existingCoverageAmount: OFF,
};

export const DEFAULT_MOTORCYCLE: MotorcycleConfig = {
  dateOfBirth: ON,
  phone: ON,
  licenseNumber: ON,
  licenseState: ON,
  sr22: ON,
  violations: ON,
  yearsRiding: OFF,
  ridingCourse: OFF,
  vin: ON,
  coverageType: ON,
  annualMileage: OFF,
  primaryUse: OFF,
  storageLocation: OFF,
  ridingSeason: OFF,
  antiTheft: OFF,
  currentCarrier: ON,
  policyNumber: OFF,
  policyExpiry: ON,
  currentLimits: ON,
};

export const DEFAULT_BOAT: BoatConfig = {
  dateOfBirth: ON,
  phone: ON,
  boatingLicense: OFF,
  boatingSafetyCourse: OFF,
  hullId: ON,
  vesselLength: OFF,
  hullMaterial: OFF,
  engineType: OFF,
  horsePower: OFF,
  vesselValue: OFF,
  storageLocation: OFF,
  navigationArea: OFF,
  coverageType: ON,
  currentCarrier: ON,
  policyNumber: OFF,
  policyExpiry: ON,
  currentLimits: ON,
};

export const DEFAULT_RV: RVConfig = {
  dateOfBirth: ON,
  phone: ON,
  licenseNumber: ON,
  licenseState: ON,
  violations: ON,
  vin: ON,
  rvClass: OFF,
  fullTimer: OFF,
  coverageType: ON,
  annualMileage: OFF,
  storageLocation: OFF,
  slideOuts: OFF,
  currentCarrier: ON,
  policyNumber: OFF,
  policyExpiry: ON,
  currentLimits: ON,
};

export const DEFAULT_EXTENDED_FORM_CONFIG: ExtendedFormConfig = {
  enabledTypes: ['auto_personal'],
  autoPersonal: DEFAULT_AUTO_PERSONAL,
  autoCommercial: DEFAULT_AUTO_COMMERCIAL,
  homeRenters: DEFAULT_HOME_RENTERS,
  life: DEFAULT_LIFE,
  motorcycle: DEFAULT_MOTORCYCLE,
  boat: DEFAULT_BOAT,
  rv: DEFAULT_RV,
  customFields: [],
};

// --- Map insurance type to config key ---

const TYPE_TO_CONFIG_KEY: Record<InsuranceType, keyof Omit<ExtendedFormConfig, 'enabledTypes' | 'customFields'> | null> = {
  auto_personal: 'autoPersonal',
  auto_commercial: 'autoCommercial',
  home: 'homeRenters',
  life: 'life',
  motorcycle: 'motorcycle',
  boat: 'boat',
  rv: 'rv',
  other: null,
};

export function getTypeConfigKey(type: InsuranceType): keyof Omit<ExtendedFormConfig, 'enabledTypes' | 'customFields'> | null {
  return TYPE_TO_CONFIG_KEY[type];
}

export function getTypeConfig(config: ExtendedFormConfig, type: InsuranceType): InsuranceTypeConfig | null {
  const key = TYPE_TO_CONFIG_KEY[type];
  if (!key) return null;
  return config[key];
}

// --- Deep merge with defaults ---

function mergeFieldToggles(
  raw: Record<string, Partial<FieldToggle>> | undefined,
  defaults: Record<string, FieldToggle>
): Record<string, FieldToggle> {
  if (!raw) return { ...defaults };
  const result: Record<string, FieldToggle> = {};
  for (const key of Object.keys(defaults)) {
    if (raw[key]) {
      result[key] = {
        show: raw[key].show ?? defaults[key].show,
        required: raw[key].required ?? defaults[key].required,
      };
    } else {
      result[key] = { ...defaults[key] };
    }
  }
  return result;
}

/** Merge a raw DB extended form_config with defaults. Safe for null/partial input. */
export function mergeExtendedFormConfig(
  raw: Partial<ExtendedFormConfig> | null | undefined
): ExtendedFormConfig {
  if (!raw) return { ...DEFAULT_EXTENDED_FORM_CONFIG, customFields: [] };

  return {
    enabledTypes: raw.enabledTypes ?? DEFAULT_EXTENDED_FORM_CONFIG.enabledTypes,
    autoPersonal: mergeFieldToggles(
      raw.autoPersonal as Record<string, Partial<FieldToggle>> | undefined,
      DEFAULT_AUTO_PERSONAL as unknown as Record<string, FieldToggle>
    ) as unknown as AutoPersonalConfig,
    autoCommercial: mergeFieldToggles(
      raw.autoCommercial as Record<string, Partial<FieldToggle>> | undefined,
      DEFAULT_AUTO_COMMERCIAL as unknown as Record<string, FieldToggle>
    ) as unknown as AutoCommercialConfig,
    homeRenters: mergeFieldToggles(
      raw.homeRenters as Record<string, Partial<FieldToggle>> | undefined,
      DEFAULT_HOME_RENTERS as unknown as Record<string, FieldToggle>
    ) as unknown as HomeRentersConfig,
    life: mergeFieldToggles(
      raw.life as Record<string, Partial<FieldToggle>> | undefined,
      DEFAULT_LIFE as unknown as Record<string, FieldToggle>
    ) as unknown as LifeInsuranceConfig,
    motorcycle: mergeFieldToggles(
      raw.motorcycle as Record<string, Partial<FieldToggle>> | undefined,
      DEFAULT_MOTORCYCLE as unknown as Record<string, FieldToggle>
    ) as unknown as MotorcycleConfig,
    boat: mergeFieldToggles(
      raw.boat as Record<string, Partial<FieldToggle>> | undefined,
      DEFAULT_BOAT as unknown as Record<string, FieldToggle>
    ) as unknown as BoatConfig,
    rv: mergeFieldToggles(
      raw.rv as Record<string, Partial<FieldToggle>> | undefined,
      DEFAULT_RV as unknown as Record<string, FieldToggle>
    ) as unknown as RVConfig,
    customFields: raw.customFields ?? [],
  };
}

// --- Bridge: convert ExtendedFormConfig to legacy FormConfig ---
// This lets existing customer form code work unchanged during migration.

import type { FormConfig } from './intake-form';

export function extendedToLegacyConfig(
  ext: ExtendedFormConfig,
  type: InsuranceType
): FormConfig {
  const tc = getTypeConfig(ext, type);

  // Helper to check if a field exists on the type config
  const fieldEnabled = (key: string): boolean => {
    if (!tc) return true;
    const val = (tc as unknown as Record<string, FieldToggle>)[key];
    return val ? val.show : true;
  };
  const fieldRequired = (key: string): boolean => {
    if (!tc) return false;
    const val = (tc as unknown as Record<string, FieldToggle>)[key];
    return val ? val.required : false;
  };

  return {
    fields: {
      date_of_birth: { enabled: fieldEnabled('dateOfBirth'), required: fieldRequired('dateOfBirth') },
      phone: { enabled: fieldEnabled('phone'), required: fieldRequired('phone') },
      current_insurance: { enabled: fieldEnabled('currentCarrier'), required: false },
      vin: { enabled: fieldEnabled('vin'), required: fieldRequired('vin') },
      driver_license_number: { enabled: fieldEnabled('licenseNumber'), required: fieldRequired('licenseNumber') },
      marital_status: { enabled: fieldEnabled('maritalStatus'), required: fieldRequired('maritalStatus') },
      sr22: { enabled: fieldEnabled('sr22'), required: fieldRequired('sr22') },
      violations: { enabled: fieldEnabled('violations'), required: fieldRequired('violations') },
      trim_package: { enabled: false, required: false },
      coverage_type: { enabled: fieldEnabled('coverageType'), required: fieldRequired('coverageType') },
      coverage_limits: { enabled: fieldEnabled('currentLimits'), required: fieldRequired('currentLimits') },
      policy_expiry: { enabled: fieldEnabled('policyExpiry'), required: fieldRequired('policyExpiry') },
    },
    custom_fields: ext.customFields
      .filter(cf => cf.insuranceType === 'all' || cf.insuranceType === type)
      .map(cf => ({
        id: cf.id,
        label: cf.label,
        type: cf.type === 'number' ? 'text' as const : cf.type === 'checkbox' ? 'yes_no' as const : cf.type as 'text' | 'textarea' | 'select',
        options: cf.options ?? [],
        required: cf.required,
        applies_to: cf.insuranceType === 'all' ? 'all' as const : [type],
      })),
  };
}

// --- Tab definitions per insurance type ---

export interface ConfigTab {
  id: InsuranceStep;
  label: string;
}

export const TABS_BY_TYPE: Record<InsuranceType, ConfigTab[]> = {
  auto_personal: [
    { id: 'personal_info', label: 'Personal Info' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'current_insurance', label: 'Current Insurance' },
  ],
  auto_commercial: [
    { id: 'personal_info', label: 'Business Info' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'current_insurance', label: 'Current Insurance' },
  ],
  home: [
    { id: 'personal_info', label: 'Personal Info' },
    { id: 'property', label: 'Property Details' },
    { id: 'coverage', label: 'Coverage' },
    { id: 'current_insurance', label: 'Current Insurance' },
  ],
  life: [
    { id: 'personal_info', label: 'Personal Info' },
    { id: 'coverage', label: 'Coverage' },
    { id: 'current_insurance', label: 'Current Insurance' },
  ],
  motorcycle: [
    { id: 'personal_info', label: 'Personal Info' },
    { id: 'vehicles', label: 'Vehicle' },
    { id: 'current_insurance', label: 'Current Insurance' },
  ],
  boat: [
    { id: 'personal_info', label: 'Personal Info' },
    { id: 'vehicles', label: 'Vessel' },
    { id: 'current_insurance', label: 'Current Insurance' },
  ],
  rv: [
    { id: 'personal_info', label: 'Personal Info' },
    { id: 'vehicles', label: 'Vehicle' },
    { id: 'current_insurance', label: 'Current Insurance' },
  ],
  other: [
    { id: 'personal_info', label: 'Personal Info' },
    { id: 'current_insurance', label: 'Current Insurance' },
  ],
};

// --- Field metadata for the config panel UI ---

export interface FieldMeta {
  key: string;
  label: string;
  description: string;
  step: InsuranceStep;
  isNew?: boolean;
}

export const AUTO_PERSONAL_FIELDS: FieldMeta[] = [
  // Personal Info
  { key: 'dateOfBirth', label: 'Date of Birth', description: 'Used to calculate age-based rates', step: 'personal_info' },
  { key: 'phone', label: 'Phone Number', description: 'For broker follow-up only', step: 'personal_info' },
  { key: 'occupation', label: 'Occupation', description: 'Some carriers use occupation to rate', step: 'personal_info', isNew: true },
  { key: 'homeowner', label: 'Do you own your home?', description: 'Homeowner discount eligibility', step: 'personal_info', isNew: true },
  { key: 'yearsLicensed', label: 'Years Licensed', description: 'How long client has held a license', step: 'personal_info', isNew: true },
  // Drivers
  { key: 'licenseNumber', label: 'License Number', description: 'Driver license identification', step: 'drivers' },
  { key: 'licenseState', label: 'License State', description: 'State of license issuance', step: 'drivers' },
  { key: 'maritalStatus', label: 'Marital Status', description: 'Married drivers often get lower rates', step: 'drivers' },
  { key: 'sr22', label: 'SR-22 Requirement', description: 'High-risk driver filing status', step: 'drivers' },
  { key: 'violations', label: 'Violations / Incidents', description: 'Traffic violations and accident history', step: 'drivers' },
  { key: 'yearsWithLicense', label: 'Years with License', description: 'Duration of licensed driving', step: 'drivers', isNew: true },
  { key: 'goodStudent', label: 'Good Student Discount', description: 'GPA 3.0+ for drivers under 25', step: 'drivers', isNew: true },
  // Vehicles
  { key: 'vin', label: 'VIN', description: 'Vehicle Identification Number', step: 'vehicles' },
  { key: 'coverageType', label: 'Coverage Type', description: 'Full coverage or liability only', step: 'vehicles' },
  { key: 'annualMileage', label: 'Annual Mileage', description: 'Lower mileage can reduce premiums', step: 'vehicles', isNew: true },
  { key: 'primaryUse', label: 'Primary Use', description: 'Pleasure, commute, or business', step: 'vehicles', isNew: true },
  { key: 'ownership', label: 'Ownership Status', description: 'Owned, leased, or financed', step: 'vehicles', isNew: true },
  { key: 'antiTheft', label: 'Anti-Theft Device', description: 'May qualify for discount', step: 'vehicles', isNew: true },
  { key: 'garagingAddress', label: 'Garaging Address', description: 'Location where vehicle is parked', step: 'vehicles', isNew: true },
  // Current Insurance
  { key: 'currentCarrier', label: 'Current Carrier', description: 'Who insures them now', step: 'current_insurance' },
  { key: 'policyNumber', label: 'Policy Number', description: 'Current policy identification', step: 'current_insurance', isNew: true },
  { key: 'policyExpiry', label: 'Policy Expiry Date', description: 'When current policy ends', step: 'current_insurance' },
  { key: 'currentLimits', label: 'Current Coverage Limits', description: 'Current BI/PD limits', step: 'current_insurance' },
  { key: 'yearsWithCarrier', label: 'Years with Carrier', description: 'Loyalty tenure with current insurer', step: 'current_insurance', isNew: true },
  { key: 'continuousCoverage', label: 'Continuous Coverage', description: 'No lapses in coverage history', step: 'current_insurance', isNew: true },
];

export const AUTO_COMMERCIAL_FIELDS: FieldMeta[] = [
  // Business Info
  { key: 'businessName', label: 'Business Name', description: 'Legal business name', step: 'personal_info' },
  { key: 'businessType', label: 'Business Type', description: 'LLC, Corp, Sole Prop, etc.', step: 'personal_info' },
  { key: 'yearsInBusiness', label: 'Years in Business', description: 'Business operating history', step: 'personal_info' },
  { key: 'dotNumber', label: 'DOT Number', description: 'FMCSA registration number', step: 'personal_info', isNew: true },
  { key: 'mcNumber', label: 'MC Number', description: 'Motor Carrier authority number', step: 'personal_info', isNew: true },
  { key: 'feinNumber', label: 'Federal EIN (FEIN)', description: 'Employer Identification Number', step: 'personal_info', isNew: true },
  // Drivers
  { key: 'licenseNumber', label: 'License Number', description: 'Driver license identification', step: 'drivers' },
  { key: 'cdlClass', label: 'CDL Class', description: 'Commercial Driver License class', step: 'drivers', isNew: true },
  { key: 'mvrConsent', label: 'MVR Consent', description: 'Motor Vehicle Record authorization', step: 'drivers', isNew: true },
  { key: 'sr22', label: 'SR-22 Requirement', description: 'High-risk driver filing status', step: 'drivers' },
  { key: 'violations', label: 'Violations / Incidents', description: 'Traffic violations and accident history', step: 'drivers' },
  // Vehicles
  { key: 'vin', label: 'VIN', description: 'Vehicle Identification Number', step: 'vehicles' },
  { key: 'coverageType', label: 'Coverage Type', description: 'Full coverage or liability only', step: 'vehicles' },
  { key: 'vehicleClass', label: 'Vehicle Class', description: 'Light, Medium, or Heavy duty', step: 'vehicles', isNew: true },
  { key: 'gvwr', label: 'GVWR', description: 'Gross Vehicle Weight Rating', step: 'vehicles', isNew: true },
  { key: 'cargoType', label: 'Cargo Type', description: 'Type of goods transported', step: 'vehicles', isNew: true },
  { key: 'annualMileage', label: 'Annual Mileage', description: 'Estimated annual mileage', step: 'vehicles', isNew: true },
  { key: 'radiusOfOperation', label: 'Radius of Operation', description: 'Local, regional, or national', step: 'vehicles', isNew: true },
  // Current Insurance
  { key: 'currentCarrier', label: 'Current Carrier', description: 'Current insurance provider', step: 'current_insurance' },
  { key: 'policyNumber', label: 'Policy Number', description: 'Current policy identification', step: 'current_insurance' },
  { key: 'policyExpiry', label: 'Policy Expiry Date', description: 'When current policy ends', step: 'current_insurance' },
  { key: 'currentLimits', label: 'Current Coverage Limits', description: 'Current liability limits', step: 'current_insurance' },
];

export const HOME_RENTERS_FIELDS: FieldMeta[] = [
  // Personal Info
  { key: 'dateOfBirth', label: 'Date of Birth', description: 'Policyholder age', step: 'personal_info' },
  { key: 'phone', label: 'Phone Number', description: 'For broker follow-up', step: 'personal_info' },
  // Property
  { key: 'propertyAddress', label: 'Property Address', description: 'Location of the property', step: 'property' },
  { key: 'propertyType', label: 'Property Type', description: 'House, condo, townhouse, etc.', step: 'property' },
  { key: 'ownerOrRenter', label: 'Owner or Renter', description: 'Ownership status of property', step: 'property' },
  { key: 'yearBuilt', label: 'Year Built', description: 'Year the home was constructed', step: 'property', isNew: true },
  { key: 'squareFootage', label: 'Square Footage', description: 'Total living area', step: 'property', isNew: true },
  { key: 'constructionType', label: 'Construction Type', description: 'Wood frame, masonry, mixed', step: 'property', isNew: true },
  { key: 'roofType', label: 'Roof Type', description: 'Roofing material', step: 'property', isNew: true },
  { key: 'roofYear', label: 'Roof Year', description: 'Year roof was last replaced', step: 'property', isNew: true },
  { key: 'stories', label: 'Stories', description: 'Number of floors', step: 'property', isNew: true },
  // Coverage
  { key: 'dwellingValue', label: 'Dwelling Replacement Cost', description: 'Estimated rebuild cost', step: 'coverage', isNew: true },
  { key: 'personalPropertyValue', label: 'Personal Property Value', description: 'Contents coverage amount', step: 'coverage', isNew: true },
  { key: 'liabilityLimit', label: 'Liability Limit', description: 'Personal liability coverage', step: 'coverage', isNew: true },
  { key: 'deductible', label: 'Deductible', description: 'Preferred deductible amount', step: 'coverage', isNew: true },
  { key: 'mortgageCompany', label: 'Mortgage Company', description: 'Lender name for mortgagee clause', step: 'coverage', isNew: true },
  { key: 'loanNumber', label: 'Loan Number', description: 'Mortgage loan reference', step: 'coverage', isNew: true },
  // Current Insurance
  { key: 'currentCarrier', label: 'Current Carrier', description: 'Current insurance provider', step: 'current_insurance' },
  { key: 'policyNumber', label: 'Policy Number', description: 'Current policy identification', step: 'current_insurance', isNew: true },
  { key: 'policyExpiry', label: 'Policy Expiry Date', description: 'When current policy ends', step: 'current_insurance' },
  { key: 'currentPremium', label: 'Current Premium', description: 'Current annual premium amount', step: 'current_insurance', isNew: true },
  { key: 'currentDeductible', label: 'Current Deductible', description: 'Current policy deductible', step: 'current_insurance', isNew: true },
];

export const LIFE_FIELDS: FieldMeta[] = [
  // Personal Info
  { key: 'dateOfBirth', label: 'Date of Birth', description: 'Primary rating factor', step: 'personal_info' },
  { key: 'phone', label: 'Phone Number', description: 'For broker follow-up', step: 'personal_info' },
  { key: 'gender', label: 'Gender', description: 'Affects life insurance mortality tables', step: 'personal_info', isNew: true },
  // Coverage
  { key: 'coverageAmountDesired', label: 'Coverage Amount', description: 'Desired death benefit', step: 'coverage', isNew: true },
  { key: 'coverageType', label: 'Policy Type', description: 'Term, whole, or universal life', step: 'coverage' },
  { key: 'termLength', label: 'Term Length', description: 'Duration of term coverage', step: 'coverage', isNew: true },
  { key: 'smoker', label: 'Tobacco Use', description: 'Significantly impacts premiums', step: 'coverage', isNew: true },
  { key: 'majorHealthConditions', label: 'Health Conditions', description: 'Major medical history', step: 'coverage', isNew: true },
  { key: 'heightWeight', label: 'Height & Weight', description: 'Used for build assessment', step: 'coverage', isNew: true },
  { key: 'employmentStatus', label: 'Employment Status', description: 'Income verification factor', step: 'coverage', isNew: true },
  { key: 'annualIncome', label: 'Annual Income', description: 'Coverage amount justification', step: 'coverage', isNew: true },
  { key: 'beneficiaryName', label: 'Beneficiary Name', description: 'Primary benefit recipient', step: 'coverage', isNew: true },
  { key: 'beneficiaryRelationship', label: 'Beneficiary Relationship', description: 'Relationship to insured', step: 'coverage', isNew: true },
  // Current Insurance
  { key: 'existingCoverage', label: 'Existing Coverage', description: 'Has existing life insurance', step: 'current_insurance' },
  { key: 'existingCarrier', label: 'Existing Carrier', description: 'Current life insurer', step: 'current_insurance' },
  { key: 'existingCoverageAmount', label: 'Existing Coverage Amount', description: 'Current coverage amount', step: 'current_insurance', isNew: true },
];

export const MOTORCYCLE_FIELDS: FieldMeta[] = [
  { key: 'dateOfBirth', label: 'Date of Birth', description: 'Age-based rating', step: 'personal_info' },
  { key: 'phone', label: 'Phone Number', description: 'For broker follow-up', step: 'personal_info' },
  { key: 'licenseNumber', label: 'License Number', description: 'Motorcycle endorsement', step: 'personal_info' },
  { key: 'licenseState', label: 'License State', description: 'State of license', step: 'personal_info' },
  { key: 'sr22', label: 'SR-22 Requirement', description: 'High-risk filing', step: 'personal_info' },
  { key: 'violations', label: 'Violations', description: 'Traffic history', step: 'personal_info' },
  { key: 'yearsRiding', label: 'Years Riding', description: 'Riding experience level', step: 'personal_info', isNew: true },
  { key: 'ridingCourse', label: 'MSF Course Completed', description: 'May qualify for discount', step: 'personal_info', isNew: true },
  { key: 'vin', label: 'VIN', description: 'Vehicle Identification Number', step: 'vehicles' },
  { key: 'coverageType', label: 'Coverage Type', description: 'Full or liability only', step: 'vehicles' },
  { key: 'annualMileage', label: 'Annual Mileage', description: 'Estimated annual miles', step: 'vehicles', isNew: true },
  { key: 'primaryUse', label: 'Primary Use', description: 'Pleasure or commute', step: 'vehicles', isNew: true },
  { key: 'storageLocation', label: 'Storage Location', description: 'Where bike is stored', step: 'vehicles', isNew: true },
  { key: 'ridingSeason', label: 'Riding Season', description: 'Year-round or seasonal', step: 'vehicles', isNew: true },
  { key: 'antiTheft', label: 'Anti-Theft Device', description: 'May qualify for discount', step: 'vehicles', isNew: true },
  { key: 'currentCarrier', label: 'Current Carrier', description: 'Current insurer', step: 'current_insurance' },
  { key: 'policyNumber', label: 'Policy Number', description: 'Current policy number', step: 'current_insurance', isNew: true },
  { key: 'policyExpiry', label: 'Policy Expiry', description: 'When current policy ends', step: 'current_insurance' },
  { key: 'currentLimits', label: 'Coverage Limits', description: 'Current liability limits', step: 'current_insurance' },
];

export const BOAT_FIELDS: FieldMeta[] = [
  { key: 'dateOfBirth', label: 'Date of Birth', description: 'Operator age', step: 'personal_info' },
  { key: 'phone', label: 'Phone Number', description: 'For broker follow-up', step: 'personal_info' },
  { key: 'boatingLicense', label: 'Boating License', description: 'Valid boating certificate', step: 'personal_info', isNew: true },
  { key: 'boatingSafetyCourse', label: 'Safety Course', description: 'Boating safety completion', step: 'personal_info', isNew: true },
  { key: 'hullId', label: 'Hull ID (HIN)', description: 'Hull Identification Number', step: 'vehicles' },
  { key: 'vesselLength', label: 'Vessel Length', description: 'Length in feet', step: 'vehicles', isNew: true },
  { key: 'hullMaterial', label: 'Hull Material', description: 'Construction material', step: 'vehicles', isNew: true },
  { key: 'engineType', label: 'Engine Type', description: 'Propulsion type', step: 'vehicles', isNew: true },
  { key: 'horsePower', label: 'Horsepower', description: 'Total engine power', step: 'vehicles', isNew: true },
  { key: 'vesselValue', label: 'Vessel Value', description: 'Estimated market value', step: 'vehicles', isNew: true },
  { key: 'storageLocation', label: 'Storage Location', description: 'Where vessel is kept', step: 'vehicles', isNew: true },
  { key: 'navigationArea', label: 'Navigation Area', description: 'Operating waters', step: 'vehicles', isNew: true },
  { key: 'coverageType', label: 'Coverage Type', description: 'Full or liability only', step: 'vehicles' },
  { key: 'currentCarrier', label: 'Current Carrier', description: 'Current insurer', step: 'current_insurance' },
  { key: 'policyNumber', label: 'Policy Number', description: 'Current policy number', step: 'current_insurance', isNew: true },
  { key: 'policyExpiry', label: 'Policy Expiry', description: 'When current policy ends', step: 'current_insurance' },
  { key: 'currentLimits', label: 'Coverage Limits', description: 'Current liability limits', step: 'current_insurance' },
];

export const RV_FIELDS: FieldMeta[] = [
  { key: 'dateOfBirth', label: 'Date of Birth', description: 'Operator age', step: 'personal_info' },
  { key: 'phone', label: 'Phone Number', description: 'For broker follow-up', step: 'personal_info' },
  { key: 'licenseNumber', label: 'License Number', description: 'Driver license', step: 'personal_info' },
  { key: 'licenseState', label: 'License State', description: 'State of license', step: 'personal_info' },
  { key: 'violations', label: 'Violations', description: 'Traffic history', step: 'personal_info' },
  { key: 'vin', label: 'VIN', description: 'Vehicle Identification Number', step: 'vehicles' },
  { key: 'rvClass', label: 'RV Class', description: 'Class A/B/C, trailer type', step: 'vehicles', isNew: true },
  { key: 'fullTimer', label: 'Full-Time Residence', description: 'Living in RV full-time', step: 'vehicles', isNew: true },
  { key: 'coverageType', label: 'Coverage Type', description: 'Full or liability only', step: 'vehicles' },
  { key: 'annualMileage', label: 'Annual Mileage', description: 'Estimated annual miles', step: 'vehicles', isNew: true },
  { key: 'storageLocation', label: 'Storage Location', description: 'Where RV is stored', step: 'vehicles', isNew: true },
  { key: 'slideOuts', label: 'Slide-Outs', description: 'Number of slide-outs', step: 'vehicles', isNew: true },
  { key: 'currentCarrier', label: 'Current Carrier', description: 'Current insurer', step: 'current_insurance' },
  { key: 'policyNumber', label: 'Policy Number', description: 'Current policy number', step: 'current_insurance', isNew: true },
  { key: 'policyExpiry', label: 'Policy Expiry', description: 'When current policy ends', step: 'current_insurance' },
  { key: 'currentLimits', label: 'Coverage Limits', description: 'Current liability limits', step: 'current_insurance' },
];

export const FIELDS_BY_TYPE: Record<InsuranceType, FieldMeta[]> = {
  auto_personal: AUTO_PERSONAL_FIELDS,
  auto_commercial: AUTO_COMMERCIAL_FIELDS,
  home: HOME_RENTERS_FIELDS,
  life: LIFE_FIELDS,
  motorcycle: MOTORCYCLE_FIELDS,
  boat: BOAT_FIELDS,
  rv: RV_FIELDS,
  other: [],
};
