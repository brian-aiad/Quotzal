'use client';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  brandColor?: string | null;
  insuranceType?: string;
  /** The raw step index (0-5) before effective step mapping */
  rawStep?: number;
}

const STEP_2_LABELS: Record<string, string> = {
  auto_personal: 'Drivers',
  auto_commercial: 'Business & Drivers',
  home: 'Property Details',
  life: 'Coverage Details',
  motorcycle: 'Motorcycle Details',
  boat: 'Vessel Details',
  rv: 'RV Details',
  other: 'Details',
};

function getStepLabels(insuranceType?: string): string[] {
  const detailLabel = (insuranceType && STEP_2_LABELS[insuranceType]) || 'Details';
  return [
    'Insurance Type',
    'Personal Info',
    detailLabel,
    'Vehicles',
    'Current Insurance',
    'Review',
  ];
}

export function ProgressBar({
  currentStep,
  totalSteps,
  brandColor,
  insuranceType,
  rawStep,
}: ProgressBarProps) {
  const percentage = ((currentStep + 1) / totalSteps) * 100;
  const accentColor = brandColor ?? '#059669';
  const stepLabels = getStepLabels(insuranceType);
  // Use rawStep for label lookup (maps to actual form step), currentStep for progress display
  const labelIndex = rawStep ?? currentStep;
  const stepLabel = stepLabels[labelIndex] ?? '';

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
          Step {currentStep + 1} of {totalSteps} — {stepLabel}
        </span>
        <span className="text-[11px] text-gray-400">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
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
