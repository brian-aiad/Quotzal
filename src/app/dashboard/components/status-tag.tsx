'use client';

import type { SubmissionStatus } from '@/lib/types/dashboard';

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  intake: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  reviewing: 'bg-sky-50 text-sky-700 border border-sky-200',
  quoted: 'bg-amber-50 text-amber-700 border border-amber-200',
  bound: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  declined: 'bg-red-50 text-red-600 border border-red-200',
  archived: 'bg-gray-50 text-gray-400 border border-gray-100',
};

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  intake: 'Intake',
  reviewing: 'Reviewing',
  quoted: 'Quoted',
  bound: 'Bound',
  declined: 'Declined',
  archived: 'Archived',
};

interface StatusTagProps {
  status: SubmissionStatus;
}

export function StatusTag({ status }: StatusTagProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.intake;
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
