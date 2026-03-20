'use client';

interface ThankYouProps {
  brokerageName: string;
  brandColor?: string | null;
}

export function ThankYou({ brokerageName, brandColor }: ThankYouProps) {
  const accentColor = brandColor ?? '#2563eb';

  return (
    <div className="text-center py-12">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <svg
          className="w-10 h-10"
          fill="none"
          stroke={accentColor}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Thank You!
      </h1>
      <p className="text-gray-600 mb-2 max-w-md mx-auto">
        Your quote request has been submitted successfully.{' '}
        <span className="font-medium text-gray-800">{brokerageName}</span> will
        review your information and get back to you shortly.
      </p>
      <p className="text-sm text-gray-500">
        A confirmation email has been sent to your inbox.
      </p>
    </div>
  );
}
