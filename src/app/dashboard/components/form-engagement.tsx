interface FormEngagementProps {
  totalSubmissions: number;
  viewedCount: number;
  reviewRate: number;
}

export function FormEngagement({ totalSubmissions, viewedCount, reviewRate }: FormEngagementProps) {
  if (totalSubmissions === 0) return null;

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-900 mb-3">Form Engagement</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Submissions */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Submissions</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalSubmissions}</p>
          <p className="text-xs text-gray-500 mt-1">Total form submissions received</p>
        </div>

        {/* Viewed by Broker */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Viewed</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{viewedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Submissions you have opened</p>
        </div>

        {/* Review Rate */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Review Rate</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-3xl font-bold text-gray-900">{reviewRate}%</p>
          </div>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(reviewRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Opened / total submissions</p>
        </div>
      </div>
    </div>
  );
}
