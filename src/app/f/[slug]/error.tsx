"use client";

interface FormErrorProps {
  error: Error;
  reset: () => void;
}

export default function FormError({ error: _error, reset }: FormErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <svg
          className="w-16 h-16 text-gray-200 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h2 className="text-xl font-bold text-gray-900 mt-4">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-500 mt-3 mb-8 max-w-xs mx-auto">
          Something went wrong with this form. Please try again or contact the
          broker directly.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-11 px-8 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 transition-all duration-150"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
