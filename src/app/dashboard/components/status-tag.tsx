'use client';

import type { SubmissionStatus } from '@/lib/types/dashboard';

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
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
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
