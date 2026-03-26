'use client';

import type { SubmissionStatus } from '@/lib/types/dashboard';

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  new: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  reviewed: 'bg-gray-100 text-gray-600 border border-gray-200',
  archived: 'bg-gray-50 text-gray-400 border border-gray-100',
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  archived: 'Archived',
};

interface StatusTagProps {
  status: SubmissionStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.new;
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
