'use client';

import { useState } from 'react';
import type { SubmissionRow, SubmissionStatus } from '@/lib/types/dashboard';
import { useToast } from '@/components/toast';
import { InsuranceTypePill } from './insurance-type-pill';
import { DeleteModal } from './delete-modal';

interface SubmissionDetailPanelProps {
  submission: SubmissionRow;
  onClose: () => void;
  onUpdate: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function SubmissionDetailPanel({
  submission,
  onClose,
  onUpdate,
}: SubmissionDetailPanelProps) {
  const [status, setStatus] = useState<SubmissionStatus>(submission.status);
  const [notes, setNotes] = useState(submission.broker_notes ?? '');
  const [notesSaved, setNotesSaved] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const { showToast } = useToast();

  const STATUS_LABELS: Record<string, string> = {
    new: 'New',
    reviewed: 'Reviewed',
    archived: 'Archived',
  };

  async function handleStatusChange(newStatus: SubmissionStatus) {
    setStatus(newStatus);
    const res = await fetch(`/api/dashboard/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      showToast(`Submission marked as ${STATUS_LABELS[newStatus] || newStatus}.`);
    } else {
      showToast('Failed to update status.', 'error');
    }
    onUpdate();
  }

  async function handleNotesSave() {
    if (notes === (submission.broker_notes ?? '')) return;
    setSaving(true);
    const res = await fetch(`/api/dashboard/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broker_notes: notes }),
    });
    setSaving(false);
    if (res.ok) {
      setNotesSaved(new Date().toLocaleTimeString());
    } else {
      showToast('Failed to save notes.', 'error');
    }
    onUpdate();
  }

  async function handleDelete() {
    const res = await fetch(`/api/dashboard/submissions/${submission.id}`, {
      method: 'DELETE',
    });
    setShowDelete(false);
    onClose();
    onUpdate();
    if (res.ok) {
      showToast('Submission deleted.');
    } else {
      showToast('Failed to delete submission.', 'error');
    }
  }

  async function handleResend() {
    setResending(true);
    await fetch(`/api/dashboard/submissions/${submission.id}/resend`, {
      method: 'POST',
    });
    setResending(false);
    setResendDone(true);
    setTimeout(() => setResendDone(false), 3000);
  }

  const fd = submission.form_data;
  const drivers = fd.drivers as Array<Record<string, unknown>> | undefined;
  const vehicles = fd.vehicles as Array<Record<string, unknown>> | undefined;
  const extFields = (fd.extended_fields ?? {}) as Record<string, string>;
  const customFieldValues = (fd.custom_fields ?? {}) as Record<string, string>;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 z-50 w-full md:max-w-2xl bg-white shadow-2xl overflow-y-auto">
        <div className="p-5 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {submission.first_name} {submission.last_name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <InsuranceTypePill type={submission.insurance_type} />
                <span className="text-xs text-gray-500">{formatDate(submission.submitted_at)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="flex items-center justify-center w-11 h-11 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as SubmissionStatus)}
              className="h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Personal Info */}
          <Section title="Personal Information">
            <Field label="Name" value={`${submission.first_name} ${submission.last_name}`} />
            <Field label="Email" value={submission.email} />
            <Field label="Phone" value={submission.phone} />
            <Field label="Date of Birth" value={submission.date_of_birth} />
          </Section>

          {/* Drivers */}
          {drivers && drivers.length > 0 && (
            <Section title={`Drivers (${drivers.length})`}>
              {drivers.map((d, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <p className="font-medium text-gray-900">{d.fullName as string || `Driver ${i + 1}`}</p>
                  <Field label="DOB" value={d.dateOfBirth as string} />
                  <Field label="License" value={`${d.licenseState as string || ''} ${d.licenseNumber as string || ''}`} />
                  {Boolean(d.noUsLicense) && <Field label="License Type" value={d.licenseType as string} />}
                  <Field label="Relationship" value={d.relationship as string} />
                  <Field label="Marital Status" value={d.maritalStatus as string} />
                  {Boolean(d.sr22Required) && <Field label="SR-22" value={`Yes — ${d.sr22State as string || 'state not specified'}`} />}
                  {Array.isArray(d.violations) && d.violations.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-1">Violations ({(d.violations as unknown[]).length})</p>
                      {(d.violations as Array<Record<string, unknown>>).map((v, vi) => (
                        <p key={vi} className="text-xs text-gray-600">
                          {v.type as string} — {v.month as string}/{v.year as string}
                          {v.notes ? `: ${v.notes as string}` : ''}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Section>
          )}

          {/* Vehicles */}
          {vehicles && vehicles.length > 0 && (
            <Section title={`Vehicles (${vehicles.length})`}>
              {vehicles.map((v, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                  <p className="font-medium text-gray-900">
                    {v.year as string} {v.make as string} {v.model as string}
                  </p>
                  <Field label="VIN" value={v.vin as string} />
                  {typeof v.trim === 'string' && v.trim && <Field label="Trim" value={v.trim} />}
                  <Field label="Coverage" value={v.coverageType as string} />
                </div>
              ))}
            </Section>
          )}

          {/* Extended Personal Info */}
          {Object.keys(extFields).length > 0 && (
            <Section title="Additional Information">
              {Object.entries(extFields)
                .filter(([key, val]) => val && val.trim() && !['policyNumber', 'yearsWithCarrier', 'continuousCoverage'].includes(key))
                .map(([key, val]) => {
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
                  return <Field key={key} label={label} value={val === 'yes' ? 'Yes' : val} />;
                })}
            </Section>
          )}

          {/* Custom Fields */}
          {Object.keys(customFieldValues).length > 0 && (
            <Section title="Custom Fields">
              {Object.entries(customFieldValues)
                .filter(([, val]) => val && val.trim())
                .map(([key, val]) => (
                  <Field key={key} label={key} value={val} />
                ))}
            </Section>
          )}

          {/* Current Insurance */}
          <Section title="Current Insurance">
            <Field label="Currently Insured" value={submission.has_current_insurance ? 'Yes' : 'No'} />
            {submission.has_current_insurance && (
              <>
                <Field label="Carrier" value={submission.current_carrier} />
                <Field label="Limits" value={submission.current_limits} />
                <Field label="Expiry" value={submission.policy_expiry} />
                {extFields.policyNumber && <Field label="Policy Number" value={extFields.policyNumber} />}
                {extFields.yearsWithCarrier && <Field label="Years with Carrier" value={extFields.yearsWithCarrier} />}
                {extFields.continuousCoverage === 'yes' && <Field label="Continuous Coverage" value="Yes" />}
              </>
            )}
          </Section>

          {/* Broker Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Private notes (not shown to client)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesSave}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white resize-none transition-all"
              placeholder="Add notes about this submission..."
            />
            <div className="text-xs mt-0.5 h-4">
              {saving ? (
                <span className="text-gray-500">Saving...</span>
              ) : notesSaved ? (
                <span className="flex items-center gap-1 text-emerald-600 animate-in fade-in">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Saved
                </span>
              ) : null}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            {status !== 'reviewed' && (
              <button
                type="button"
                onClick={() => handleStatusChange('reviewed')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 px-5 active:scale-[0.98] transition-all text-sm"
              >
                Mark Reviewed
              </button>
            )}
            {status !== 'archived' && (
              <button
                type="button"
                onClick={() => handleStatusChange('archived')}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl h-11 px-5 transition-all text-sm"
              >
                Archive
              </button>
            )}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="h-11 px-4 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 disabled:opacity-50 transition-all"
            >
              {resendDone ? 'Sent!' : resending ? 'Sending...' : 'Resend Form Link'}
            </button>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="h-11 px-4 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {showDelete && (
        <DeleteModal
          name={`${submission.first_name} ${submission.last_name}`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined | boolean }) {
  if (value === null || value === undefined || value === '') return null;
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-500 min-w-[80px]">{label}:</span>
      <span className="text-gray-900">{display}</span>
    </div>
  );
}
