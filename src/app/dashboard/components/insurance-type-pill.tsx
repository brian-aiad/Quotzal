'use client';

import { getInsuranceTypeLabel } from '@/lib/constants/insurance-types';
import type { InsuranceType } from '@/lib/types/intake-form';

const TYPE_COLORS: Record<string, string> = {
  auto_personal: 'bg-blue-100 text-blue-700',
  auto_commercial: 'bg-indigo-100 text-indigo-700',
  home: 'bg-emerald-100 text-emerald-700',
  life: 'bg-rose-100 text-rose-700',
  motorcycle: 'bg-orange-100 text-orange-700',
  boat: 'bg-cyan-100 text-cyan-700',
  rv: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
};

interface InsuranceTypePillProps {
  type: string;
}

export function InsuranceTypePill({ type }: InsuranceTypePillProps) {
  const colors = TYPE_COLORS[type] ?? TYPE_COLORS.other;
  const label = getInsuranceTypeLabel(type as InsuranceType);

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${colors}`}>
      {label}
    </span>
  );
}
