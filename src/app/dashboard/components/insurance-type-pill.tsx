'use client';

import { getInsuranceTypeLabel } from '@/lib/constants/insurance-types';
import type { InsuranceType } from '@/lib/types/intake-form';

const TYPE_COLORS: Record<string, string> = {
  auto_personal: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  auto_commercial: 'bg-teal-50 text-teal-700 border border-teal-100',
  home: 'bg-orange-50 text-orange-700 border border-orange-100',
  life: 'bg-pink-50 text-pink-700 border border-pink-100',
  motorcycle: 'bg-red-50 text-red-700 border border-red-100',
  boat: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
  rv: 'bg-amber-50 text-amber-700 border border-amber-100',
  other: 'bg-gray-100 text-gray-600 border border-gray-200',
};

interface InsuranceTypePillProps {
  type: string;
}

export function InsuranceTypePill({ type }: InsuranceTypePillProps) {
  const colors = TYPE_COLORS[type] ?? TYPE_COLORS.other;
  const label = getInsuranceTypeLabel(type as InsuranceType);

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colors}`}>
      {label}
    </span>
  );
}
