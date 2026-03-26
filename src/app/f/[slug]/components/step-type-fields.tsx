'use client';

import type {
  InsuranceType,
  PersonalInfo,
  AutoPersonalData,
  AutoCommercialData,
  HomeData,
  LifeData,
  MotorcycleData,
  BoatData,
  RvData,
  OtherData,
  TypeSpecificData,
  FormConfig,
} from '@/lib/types/intake-form';
import { AutoPersonalDrivers } from './fields/auto-personal-drivers';
import { AutoPersonalVehicles } from './fields/auto-personal-vehicles';
import { AutoCommercialDrivers } from './fields/auto-commercial-drivers';
import { AutoCommercialVehicles } from './fields/auto-commercial-vehicles';
import { HomeFields } from './fields/home-fields';
import { LifeFields } from './fields/life-fields';
import { MotorcycleFields } from './fields/motorcycle-fields';
import { BoatFields } from './fields/boat-fields';
import { RvFields } from './fields/rv-fields';
import { OtherFields } from './fields/other-fields';

interface DriverErrors {
  [driverIndex: number]: Record<string, string>;
}

interface StepTypeFieldsProps {
  insuranceType: InsuranceType;
  personalInfo: PersonalInfo;
  data: TypeSpecificData | null;
  onChange: (data: TypeSpecificData) => void;
  section: 'drivers' | 'vehicles' | 'all';
  formConfig?: FormConfig;
  driverErrors?: DriverErrors;
}

export function getDefaultTypeData(type: InsuranceType): TypeSpecificData {
  switch (type) {
    case 'auto_personal':
      return { drivers: [], vehicles: [{ vin: '', year: '', make: '', model: '', trim: '', primaryDriverIndex: 0, coverageType: 'full' }] } as AutoPersonalData;
    case 'auto_commercial':
      return {
        businessName: '',
        businessType: '',
        numberOfVehicles: '',
        driversAreEmployees: false,
        drivers: [],
        vehicles: [{ vin: '', year: '', make: '', model: '', trim: '', primaryDriverIndex: 0, coverageType: 'full' }],
      } as AutoCommercialData;
    case 'home':
      return {
        propertyAddress: '',
        propertyType: 'owned',
        yearBuilt: '',
        squareFootage: '',
        stories: '',
        roofAge: '',
        roofMaterial: '',
        hasPool: false,
        hasTrampoline: false,
        hasDogs: false,
        hasLienholder: false,
        floodZone: 'no',
        hasPriorClaims: false,
      } as HomeData;
    case 'life':
      return {
        coverageAmount: '',
        policyType: '',
        isSmoker: false,
        hasHealthConditions: false,
        heightFeet: '',
        heightInches: '',
        weight: '',
        beneficiaryName: '',
        beneficiaryRelationship: '',
      } as LifeData;
    case 'motorcycle':
      return {
        vin: '',
        year: '',
        make: '',
        model: '',
        ownership: 'owned',
        storedLocation: '',
        coverageType: 'full',
        hasViolations: false,
        violations: [],
      } as MotorcycleData;
    case 'boat':
      return {
        hin: '',
        year: '',
        make: '',
        model: '',
        boatLength: '',
        hullType: '',
        storedLocation: '',
        isFinanced: false,
        coverageType: 'full',
      } as BoatData;
    case 'rv':
      return {
        vin: '',
        year: '',
        make: '',
        model: '',
        rvClass: '',
        ownership: 'owned',
        storedLocation: '',
        isFullTimeResidence: false,
        coverageType: 'full',
        hasViolations: false,
        violations: [],
      } as RvData;
    case 'other':
      return { description: '', estimatedValue: '' } as OtherData;
  }
}

export function hasVehicleStep(type: InsuranceType): boolean {
  return type === 'auto_personal' || type === 'auto_commercial';
}

export function StepTypeFields({
  insuranceType,
  personalInfo,
  data,
  onChange,
  section,
  formConfig,
  driverErrors,
}: StepTypeFieldsProps) {
  const typeData = data ?? getDefaultTypeData(insuranceType);

  // Auto types: split into drivers/vehicles sections
  if (insuranceType === 'auto_personal') {
    if (section === 'drivers') {
      return (
        <AutoPersonalDrivers
          data={typeData as AutoPersonalData}
          personalInfo={personalInfo}
          onChange={onChange}
          formConfig={formConfig}
          driverErrors={driverErrors}
        />
      );
    }
    if (section === 'vehicles') {
      return (
        <AutoPersonalVehicles
          data={typeData as AutoPersonalData}
          onChange={onChange}
          formConfig={formConfig}
        />
      );
    }
  }

  if (insuranceType === 'auto_commercial') {
    if (section === 'drivers') {
      return (
        <AutoCommercialDrivers
          data={typeData as AutoCommercialData}
          personalInfo={personalInfo}
          onChange={onChange}
          formConfig={formConfig}
          driverErrors={driverErrors}
        />
      );
    }
    if (section === 'vehicles') {
      return (
        <AutoCommercialVehicles
          data={typeData as AutoCommercialData}
          onChange={onChange}
          formConfig={formConfig}
        />
      );
    }
  }

  // Non-auto types: render on the drivers step (section==='drivers' or 'all')
  if (section === 'vehicles') return null;

  switch (insuranceType) {
    case 'home':
      return <HomeFields data={typeData as HomeData} onChange={onChange} />;
    case 'life':
      return <LifeFields data={typeData as LifeData} onChange={onChange} />;
    case 'motorcycle':
      return <MotorcycleFields data={typeData as MotorcycleData} onChange={onChange} />;
    case 'boat':
      return <BoatFields data={typeData as BoatData} onChange={onChange} />;
    case 'rv':
      return <RvFields data={typeData as RvData} onChange={onChange} />;
    case 'other':
      return <OtherFields data={typeData as OtherData} onChange={onChange} />;
    default:
      return null;
  }
}
