export default function SubmissionsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-slate-200 rounded-lg w-48" />
        <div className="h-10 bg-slate-200 rounded-lg w-32" />
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 h-14" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-100 flex gap-4">
            <div className="h-4 bg-slate-200 rounded w-32" />
            <div className="h-4 bg-slate-200 rounded w-48" />
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-4 bg-slate-200 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
