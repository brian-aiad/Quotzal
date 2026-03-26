"use client";

import Link from "next/link";

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto pt-32 pb-20 px-6 text-center">
        {/* Large decorative warning icon */}
        <svg
          className="w-20 h-20 text-gray-200 mx-auto"
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
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-500 mt-3 mb-8 max-w-xs mx-auto">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="w-full inline-flex items-center justify-center h-11 px-6 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm text-emerald-600 hover:text-emerald-700 mt-4 inline-block transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
