import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm mx-auto pt-32 pb-20 px-6 text-center">
        <p className="text-8xl font-black text-gray-100">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-0">
          Page not found
        </h1>
        <p className="text-sm text-gray-500 mt-3 mb-8 max-w-xs mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="w-full inline-flex items-center justify-center h-11 px-6 bg-emerald-600 text-white font-semibold text-sm rounded-xl hover:bg-emerald-700 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20"
        >
          &larr; Back to home
        </Link>
        <Link
          href="mailto:support@quotzal.com"
          className="text-sm text-emerald-600 hover:text-emerald-700 mt-4 inline-block transition-colors"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}
