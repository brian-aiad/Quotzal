'use client';

interface StepHelpPanelProps {
  currentStep: number;
  insuranceType: string;
}

export function StepHelpPanel({ currentStep }: StepHelpPanelProps) {
  // Step 0 — insurance type selection
  if (currentStep === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-600 text-sm">⏱</span>
            </div>
            <p className="text-sm font-bold text-gray-900">Takes about 3 minutes</p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Answer a few quick questions so your broker can prepare an accurate quote — no phone calls needed.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">What we&apos;ll ask for</p>
          <div className="space-y-2.5">
            {[
              { icon: '👤', text: 'Basic personal info' },
              { icon: '🚗', text: 'Vehicle or property details' },
              { icon: '📋', text: 'Current insurance info' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2.5">
                <span className="text-base">{item.icon}</span>
                <span className="text-xs text-gray-600">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-600 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-200 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            <div>
              <p className="text-sm font-bold text-white">Secure & private</p>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                Your information is encrypted and only shared with your broker for quoting purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 1 — personal info
  if (currentStep === 1) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Why we ask</p>
          <div className="space-y-3">
            {[
              { field: 'Date of birth', reason: 'Used to calculate age-based rates' },
              { field: 'Phone number', reason: 'Only used if your broker needs to reach you' },
              { field: 'Email', reason: "We'll send you a copy of your submission" },
            ].map(item => (
              <div key={item.field} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-semibold text-gray-700">{item.field}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 2 — drivers
  if (currentStep === 2) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Driver tips</p>
          <div className="space-y-3">
            {[
              { icon: '🪪', tip: 'Include anyone who drives the insured vehicle regularly' },
              { icon: '⚠️', tip: 'Violations in the last 5 years affect your rate — be accurate' },
              { icon: '✓', tip: 'License number helps your broker get a faster quote' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-base shrink-0">{item.icon}</span>
                <p className="text-xs text-gray-500 leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-amber-800 mb-1">Violations matter</p>
          <p className="text-xs text-amber-600 leading-relaxed">
            Undisclosed violations can cause issues with coverage later. Your broker needs the full picture.
          </p>
        </div>
      </div>
    );
  }

  // Step 3 — vehicles
  if (currentStep === 3) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🔍</span>
            <p className="text-sm font-bold text-gray-900">VIN auto-fill</p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Enter your 17-character VIN and we&apos;ll automatically fill in Year, Make, and Model.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
          <p className="text-xs font-bold text-emerald-900 mb-3">Where to find your VIN</p>
          <div className="space-y-2">
            {['Dashboard, visible through windshield', 'Driver\'s door jamb sticker', 'Insurance card or registration'].map(loc => (
              <div key={loc} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </div>
                <p className="text-xs text-emerald-800">{loc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 4 — current insurance
  if (currentStep === 4) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Why this matters</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your current coverage helps your broker understand what you have now and find opportunities to save.
          </p>
          <div className="mt-4 space-y-2">
            {[
              'Current carrier helps compare rates',
              'Coverage limits show what protection you have',
              'Expiry date flags when you need coverage by',
            ].map(item => (
              <div key={item} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </div>
                <p className="text-xs text-gray-500">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 5 — review
  if (currentStep === 5) {
    return (
      <div className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <p className="text-sm font-bold text-emerald-900">Almost done!</p>
          </div>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Review your information below and click &ldquo;Submit&rdquo; when you&apos;re ready. You&apos;ll get a confirmation email with a full copy.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">What happens next</p>
          <div className="space-y-3">
            {[
              { n: '1', text: 'Your broker receives your submission instantly' },
              { n: '2', text: 'They review and prepare your quote' },
              { n: '3', text: 'You hear back within 1–2 business days' },
            ].map(item => (
              <div key={item.n} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center shrink-0 text-[10px] font-bold">{item.n}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
