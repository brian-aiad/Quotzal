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

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm text-slate-500">
          {STEP_LABELS[currentStep] ?? ''}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: accentColor,
          }}
        />
      </div>
    </div>
  );
}
