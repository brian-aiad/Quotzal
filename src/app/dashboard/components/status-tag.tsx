'use client';

import type { SubmissionStatus } from '@/lib/types/dashboard';

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  new: 'bg-emerald-100 text-emerald-700',
  reviewed: 'bg-slate-100 text-slate-600',
  archived: 'bg-slate-50 text-slate-400',
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
