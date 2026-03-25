export default function FormLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
      <div className="flex-1 space-y-5">
        <div className="h-8 bg-slate-200 rounded-lg w-36" />
        <div className="bg-white border border-slate-200 rounded-xl p-4 h-20" />
        <div className="bg-white border border-slate-200 rounded-xl p-4 h-40" />
        <div className="bg-white border border-slate-200 rounded-xl p-4 h-60" />
      </div>
      <div className="lg:w-1/2">
        <div className="bg-slate-200 rounded-[2.5rem] h-[640px]" />
      </div>
    </div>
  );
}
