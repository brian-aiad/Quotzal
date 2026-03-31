"use client";

interface DashboardErrorProps {
  error: Error;
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
        <svg
          className="w-14 h-14 text-gray-200 mx-auto"
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
        <p className="text-sm text-gray-500 mt-2 mb-6">
          {error.message || "An unexpected error occurred in the dashboard."}
        </p>
        <button
          onClick={reset}
          className="w-full inline-flex items-center justify-center h-10 px-5 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20"
        >
          Reload dashboard
        </button>
      </div>
    </div>
  );
}
