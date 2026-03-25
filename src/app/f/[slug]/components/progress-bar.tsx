'use client';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  brandColor?: string | null;
}

const STEP_LABELS = [
  'Insurance Type',
  'Personal Info',
  'Drivers',
  'Vehicles',
  'Current Insurance',
  'Review',
];

export function ProgressBar({
  currentStep,
  totalSteps,
  brandColor,
}: ProgressBarProps) {
  const percentage = ((currentStep + 1) / totalSteps) * 100;
  const accentColor = brandColor ?? '#059669';
  const stepLabel = STEP_LABELS[currentStep] ?? '';

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: accentColor }}>
          Step {currentStep + 1} of {totalSteps} — {stepLabel}
        </span>
        <span className="text-[11px] text-gray-400">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>
    </div>
  );
}
