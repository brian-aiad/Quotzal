export default function RenewalsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-slate-200 rounded-lg w-72" />
        <div className="h-6 bg-slate-200 rounded-full w-20" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 bg-slate-200 rounded-lg w-28" />
        <div className="h-10 bg-slate-200 rounded-lg w-28" />
        <div className="h-10 bg-slate-200 rounded-lg w-28" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-slate-100 flex gap-4">
            <div className="h-4 bg-slate-200 rounded w-36" />
            <div className="h-4 bg-slate-200 rounded w-28" />
            <div className="h-4 bg-slate-200 rounded w-24" />
            <div className="h-4 bg-slate-200 rounded w-20" />
            <div className="h-4 bg-slate-200 rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
