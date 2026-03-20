import type { InsuranceType, InsuranceTypeOption } from '@/lib/types/intake-form';

export const INSURANCE_TYPE_OPTIONS: InsuranceTypeOption[] = [
  { value: 'auto_personal', label: 'Auto — Personal', icon: '🚗' },
  { value: 'auto_commercial', label: 'Auto — Commercial', icon: '🚛' },
  { value: 'home', label: 'Home / Renters', icon: '🏠' },
  { value: 'life', label: 'Life Insurance', icon: '❤️' },
  { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
  { value: 'boat', label: 'Boat / Watercraft', icon: '⛵' },
  { value: 'rv', label: 'RV / Motorhome', icon: '🚐' },
  { value: 'other', label: 'Other', icon: '📋' },
];

export function getInsuranceTypeLabel(type: InsuranceType): string {
  const option = INSURANCE_TYPE_OPTIONS.find((o) => o.value === type);
  return option?.label ?? type;
}
