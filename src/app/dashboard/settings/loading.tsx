export default function SettingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-36" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 h-40" />
      ))}
    </div>
  );
}
