'use client';

import dynamic from 'next/dynamic';
import type { ChartData } from '@/lib/types/dashboard';

interface ChartsProps {
  data: ChartData;
}

const PIE_COLORS = [
  '#059669', '#34d399', '#a7f3d0', '#d1d5db',
  '#e5e7eb', '#6ee7b7', '#047857', '#9ca3af',
];

const ChartsInner = dynamic(() => import('./charts-inner'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm min-h-[240px] animate-pulse" />
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm min-h-[240px] animate-pulse" />
    </div>
  ),
});

export function Charts({ data }: ChartsProps) {
  return <ChartsInner data={data} pieColors={PIE_COLORS} />;
}
