'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { HomeData, RoofMaterial } from '@/lib/types/intake-form';

interface HomeFieldsProps {
  data: HomeData;
  onChange: (data: HomeData) => void;
}

const ROOF_MATERIALS: { value: RoofMaterial; label: string }[] = [
  { value: 'asphalt_shingle', label: 'Asphalt Shingle' },
  { value: 'metal', label: 'Metal' },
  { value: 'tile', label: 'Tile' },
  { value: 'wood', label: 'Wood' },
  { value: 'flat', label: 'Flat' },
  { value: 'other', label: 'Other' },
];

export function HomeFields({ data, onChange }: HomeFieldsProps) {
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  function update(field: keyof HomeData, value: unknown) {
    onChange({ ...data, [field]: value });
  }

  const handlePlaceSelect = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.formatted_address) {
      onChange({ ...data, propertyAddress: place.formatted_address });
    }
  }, [data, onChange]);

  useEffect(() => {
    if (!addressInputRef.current) return;
    if (typeof google === 'undefined' || !google.maps?.places) return;
    if (autocompleteRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(
      addressInputRef.current,
      { types: ['address'], componentRestrictions: { country: 'us' } }
    );
    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
  }, [handlePlaceSelect]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">
        Property Details
      </h3>

      {/* Address with Google Places */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Property Address
        </label>
        <input
          ref={addressInputRef}
          type="text"
          value={data.propertyAddress}
          onChange={(e) => update('propertyAddress', e.target.value)}
          placeholder="Start typing your address..."
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Property Type
          </label>
          <select
            value={data.propertyType}
            onChange={(e) => update('propertyType', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Select</option>
            <option value="owned">Owned</option>
            <option value="rented">Rented</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Year Built
          </label>
          <input
            type="number"
            value={data.yearBuilt}
            onChange={(e) => update('yearBuilt', e.target.value)}
            placeholder="1990"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Square Footage
          </label>
          <input
            type="number"
            value={data.squareFootage}
            onChange={(e) => update('squareFootage', e.target.value)}
            placeholder="2000"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Stories
          </label>
          <select
            value={data.stories}
            onChange={(e) => update('stories', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Select</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3+">3+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Roof Age (years)
          </label>
          <input
            type="number"
            value={data.roofAge}
            onChange={(e) => update('roofAge', e.target.value)}
            placeholder="5"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Roof Material
          </label>
          <select
            value={data.roofMaterial}
            onChange={(e) => update('roofMaterial', e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="">Select</option>
            {ROOF_MATERIALS.map((rm) => (
              <option key={rm.value} value={rm.value}>
                {rm.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Yes/No toggles */}
      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={data.hasPool}
            onChange={(e) => update('hasPool', e.target.checked)}
            className="rounded border-slate-300"
          />
          Pool?
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={data.hasTrampoline}
            onChange={(e) => update('hasTrampoline', e.target.checked)}
            className="rounded border-slate-300"
          />
          Trampoline?
        </label>

        <div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={data.hasDogs}
              onChange={(e) => update('hasDogs', e.target.checked)}
              className="rounded border-slate-300"
            />
            Dogs?
          </label>
          {data.hasDogs && (
            <div className="mt-2 ml-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Breed
                </label>
                <input
                  type="text"
                  value={data.dogBreed ?? ''}
                  onChange={(e) => update('dogBreed', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Number of Dogs
                </label>
                <input
                  type="number"
                  min={1}
                  value={data.numberOfDogs ?? ''}
                  onChange={(e) => update('numberOfDogs', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={data.hasLienholder}
              onChange={(e) => update('hasLienholder', e.target.checked)}
              className="rounded border-slate-300"
            />
            Lienholder / Mortgage?
          </label>
          {data.hasLienholder && (
            <div className="mt-2 ml-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lender Name
              </label>
              <input
                type="text"
                value={data.lenderName ?? ''}
                onChange={(e) => update('lenderName', e.target.value)}
                className="w-full md:w-1/2 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Flood Zone?
          </label>
          <div className="flex gap-3">
            {(['yes', 'no', 'not_sure'] as const).map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => update('floodZone', val)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  data.floodZone === val
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {val === 'not_sure' ? 'Not Sure' : val === 'yes' ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={data.hasPriorClaims}
              onChange={(e) => update('hasPriorClaims', e.target.checked)}
              className="rounded border-slate-300"
            />
            Prior claims in last 5 years?
          </label>
          {data.hasPriorClaims && (
            <div className="mt-2 ml-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Number of Claims
                </label>
                <input
                  type="number"
                  min={1}
                  value={data.numberOfClaims ?? ''}
                  onChange={(e) => update('numberOfClaims', e.target.value)}
                  className="w-full md:w-1/3 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={data.claimsDescription ?? ''}
                  onChange={(e) => update('claimsDescription', e.target.value)}
                  maxLength={300}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
                />
                <p className="text-xs text-slate-400 text-right">
                  {(data.claimsDescription ?? '').length}/300
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
