// ============================================================
// Intake Form Types
// ============================================================

export type InsuranceType =
  | 'auto_personal'
  | 'auto_commercial'
  | 'home'
  | 'life'
  | 'motorcycle'
  | 'boat'
  | 'rv'
  | 'other';

export interface InsuranceTypeOption {
  value: InsuranceType;
  label: string;
  icon: string;
}

// --- Personal Info (Step 2) ---

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
}

// --- Violation / Incident ---

export type ViolationType =
  | 'speeding'
  | 'dui'
  | 'at_fault_accident'
  | 'not_at_fault_accident'
  | 'reckless_driving'
  | 'other';

export interface Violation {
  type: ViolationType;
  month: string;
  year: string;
  notes: string;
}

// --- Driver ---

export type DriverRelationship =
  | 'self'
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'other';

export type DriverRole = 'owner' | 'employee' | 'contractor';

export interface Driver {
  fullName: string;
  dateOfBirth: string;
  licenseNumber: string;
  licenseState: string;
  relationship?: DriverRelationship;
  role?: DriverRole;
  sr22Required: boolean;
  sr22State?: string;
  hasViolations: boolean;
  violations: Violation[];
}

// --- Vehicle ---

export type OwnershipType = 'owned' | 'financed' | 'leased';
export type CoverageType = 'full' | 'liability_only';

export type AnnualMileage =
  | 'under_5000'
  | '5000_10000'
  | '10000_15000'
  | '15000_20000'
  | '20000_plus';

export interface Vehicle {
  vin: string;
  year: string;
  make: string;
  model: string;
  ownership: OwnershipType;
  lienholderName?: string;
  primaryDriverIndex: number;
  annualMileage: AnnualMileage;
  coverageType: CoverageType;
}

// --- Type-Specific Form Data ---

export interface AutoPersonalData {
  drivers: Driver[];
  vehicles: Vehicle[];
}

export interface AutoCommercialData {
  businessName: string;
  businessType: string;
  numberOfVehicles: string;
  driversAreEmployees: boolean;
  drivers: Driver[];
  vehicles: Vehicle[];
}

export type PropertyType = 'owned' | 'rented';
export type RoofMaterial =
  | 'asphalt_shingle'
  | 'metal'
  | 'tile'
  | 'wood'
  | 'flat'
  | 'other';

export interface HomeData {
  propertyAddress: string;
  propertyType: PropertyType;
  yearBuilt: string;
  squareFootage: string;
  stories: string;
  roofAge: string;
  roofMaterial: RoofMaterial | '';
  hasPool: boolean;
  hasTrampoline: boolean;
  hasDogs: boolean;
  dogBreed?: string;
  numberOfDogs?: string;
  hasLienholder: boolean;
  lenderName?: string;
  floodZone: 'yes' | 'no' | 'not_sure';
  hasPriorClaims: boolean;
  numberOfClaims?: string;
  claimsDescription?: string;
}

export type CoverageAmount =
  | 'under_100k'
  | '100k_250k'
  | '250k_500k'
  | '500k_1m'
  | 'over_1m';

export type PolicyLifeType = 'term' | 'whole' | 'not_sure';
export type TermLength = '10' | '15' | '20' | '25' | '30';
export type BeneficiaryRelationship =
  | 'spouse'
  | 'child'
  | 'parent'
  | 'sibling'
  | 'other';

export interface LifeData {
  coverageAmount: CoverageAmount | '';
  policyType: PolicyLifeType | '';
  termLength?: TermLength;
  isSmoker: boolean;
  hasHealthConditions: boolean;
  healthConditionsDescription?: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
  beneficiaryName: string;
  beneficiaryRelationship: BeneficiaryRelationship | '';
}

export type StoredLocation =
  | 'home_garage'
  | 'storage_unit'
  | 'outdoor'
  | 'marina'
  | 'storage_facility'
  | 'home'
  | 'on_trailer'
  | 'rv_park'
  | 'other';

export interface MotorcycleData {
  vin: string;
  year: string;
  make: string;
  model: string;
  ownership: OwnershipType;
  lienholderName?: string;
  storedLocation: string;
  coverageType: CoverageType;
  hasViolations: boolean;
  violations: Violation[];
}

export type HullType =
  | 'fiberglass'
  | 'aluminum'
  | 'wood'
  | 'inflatable'
  | 'other';

export interface BoatData {
  hin: string;
  year: string;
  make: string;
  model: string;
  boatLength: string;
  hullType: HullType | '';
  storedLocation: string;
  isFinanced: boolean;
  lienholderName?: string;
  coverageType: CoverageType;
}

export type RvClass =
  | 'class_a'
  | 'class_b'
  | 'class_c'
  | 'travel_trailer'
  | '5th_wheel'
  | 'other';

export interface RvData {
  vin: string;
  year: string;
  make: string;
  model: string;
  rvClass: RvClass | '';
  ownership: OwnershipType;
  lienholderName?: string;
  storedLocation: string;
  isFullTimeResidence: boolean;
  coverageType: CoverageType;
  hasViolations: boolean;
  violations: Violation[];
}

export interface OtherData {
  description: string;
  estimatedValue: string;
}

export type TypeSpecificData =
  | AutoPersonalData
  | AutoCommercialData
  | HomeData
  | LifeData
  | MotorcycleData
  | BoatData
  | RvData
  | OtherData;

// --- Current Insurance (Step 4) ---

export interface CurrentInsurance {
  hasCurrentInsurance: boolean;
  currentCarrier?: string;
  currentCoverageLimits?: string;
  policyExpiryDate?: string;
}

// --- Full Form State ---

export interface IntakeFormData {
  insuranceType: InsuranceType | '';
  personalInfo: PersonalInfo;
  typeSpecificData: TypeSpecificData | null;
  currentInsurance: CurrentInsurance;
}

// --- Broker Data from Server ---

export interface BrokerData {
  id: string;
  brokerageName: string;
  slug: string;
  logoUrl: string | null;
  brandColor: string | null;
  plan: 'starter' | 'pro';
  status: string;
  insuranceTypesEnabled: InsuranceType[];
  linkId: string;
}
