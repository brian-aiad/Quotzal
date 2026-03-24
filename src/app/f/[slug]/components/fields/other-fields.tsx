'use client';

import type { OtherData } from '@/lib/types/intake-form';

interface OtherFieldsProps {
  data: OtherData;
  onChange: (data: OtherData) => void;
}

export function OtherFields({ data, onChange }: OtherFieldsProps) {
  function update(field: keyof OtherData, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Other Insurance</h3>
      <p className="text-sm text-slate-500">
        Please describe the type of insurance you need.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => update('description', e.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Describe the insurance coverage you are looking for..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
        <p className="text-xs text-slate-400 text-right">
          {data.description.length}/500
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Estimated Value (optional)
        </label>
        <input
          type="text"
          value={data.estimatedValue}
          onChange={(e) => update('estimatedValue', e.target.value)}
          placeholder="e.g., $50,000"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
      </div>
    </div>
  );
}
