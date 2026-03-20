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
} from '@/lib/types/intake-form';
import { AutoPersonalFields } from './fields/auto-personal-fields';
import { AutoCommercialFields } from './fields/auto-commercial-fields';
import { HomeFields } from './fields/home-fields';
import { LifeFields } from './fields/life-fields';
import { MotorcycleFields } from './fields/motorcycle-fields';
import { BoatFields } from './fields/boat-fields';
import { RvFields } from './fields/rv-fields';
import { OtherFields } from './fields/other-fields';

interface StepTypeFieldsProps {
  insuranceType: InsuranceType;
  personalInfo: PersonalInfo;
  data: TypeSpecificData | null;
  onChange: (data: TypeSpecificData) => void;
}

export function getDefaultTypeData(type: InsuranceType): TypeSpecificData {
  switch (type) {
    case 'auto_personal':
      return { drivers: [], vehicles: [] } as AutoPersonalData;
    case 'auto_commercial':
      return {
        businessName: '',
        businessType: '',
        numberOfVehicles: '',
        driversAreEmployees: false,
        drivers: [],
        vehicles: [],
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

export function StepTypeFields({
  insuranceType,
  personalInfo,
  data,
  onChange,
}: StepTypeFieldsProps) {
  const typeData = data ?? getDefaultTypeData(insuranceType);

  switch (insuranceType) {
    case 'auto_personal':
      return (
        <AutoPersonalFields
          data={typeData as AutoPersonalData}
          personalInfo={personalInfo}
          onChange={onChange}
        />
      );
    case 'auto_commercial':
      return (
        <AutoCommercialFields
          data={typeData as AutoCommercialData}
          personalInfo={personalInfo}
          onChange={onChange}
        />
      );
    case 'home':
      return (
        <HomeFields data={typeData as HomeData} onChange={onChange} />
      );
    case 'life':
      return (
        <LifeFields data={typeData as LifeData} onChange={onChange} />
      );
    case 'motorcycle':
      return (
        <MotorcycleFields
          data={typeData as MotorcycleData}
          onChange={onChange}
        />
      );
    case 'boat':
      return (
        <BoatFields data={typeData as BoatData} onChange={onChange} />
      );
    case 'rv':
      return <RvFields data={typeData as RvData} onChange={onChange} />;
    case 'other':
      return (
        <OtherFields data={typeData as OtherData} onChange={onChange} />
      );
  }
}
