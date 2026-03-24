'use client';

import { useState } from 'react';
import type { SubmissionRow, SubmissionStatus } from '@/lib/types/dashboard';
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

  async function handleStatusChange(newStatus: SubmissionStatus) {
    setStatus(newStatus);
    await fetch(`/api/dashboard/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    onUpdate();
  }

  async function handleNotesSave() {
    if (notes === (submission.broker_notes ?? '')) return;
    setSaving(true);
    await fetch(`/api/dashboard/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ broker_notes: notes }),
    });
    setSaving(false);
    setNotesSaved(new Date().toLocaleTimeString());
    onUpdate();
  }

  async function handleDelete() {
    await fetch(`/api/dashboard/submissions/${submission.id}`, {
      method: 'DELETE',
    });
    setShowDelete(false);
    onClose();
    onUpdate();
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

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-xl overflow-y-auto">
        <div className="p-5 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {submission.first_name} {submission.last_name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <InsuranceTypePill type={submission.insurance_type} />
                <span className="text-xs text-slate-500">{formatDate(submission.submitted_at)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="text-slate-500 hover:text-slate-700 text-xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as SubmissionStatus)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-1 text-sm">
                  <p className="font-medium text-slate-900">{d.fullName as string || `Driver ${i + 1}`}</p>
                  <Field label="DOB" value={d.dateOfBirth as string} />
                  <Field label="License" value={`${d.licenseState as string || ''} ${d.licenseNumber as string || ''}`} />
                  {Boolean(d.noUsLicense) && <Field label="License Type" value={d.licenseType as string} />}
                  <Field label="Relationship" value={d.relationship as string} />
                  <Field label="Marital Status" value={d.maritalStatus as string} />
                  {Boolean(d.sr22Required) && <Field label="SR-22" value={`Yes — ${d.sr22State as string || 'state not specified'}`} />}
                  {Array.isArray(d.violations) && d.violations.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-500 mb-1">Violations ({(d.violations as unknown[]).length})</p>
                      {(d.violations as Array<Record<string, unknown>>).map((v, vi) => (
                        <p key={vi} className="text-xs text-slate-600">
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
                <div key={i} className="bg-slate-50 rounded-lg p-3 space-y-1 text-sm">
                  <p className="font-medium text-slate-900">
                    {v.year as string} {v.make as string} {v.model as string}
                  </p>
                  <Field label="VIN" value={v.vin as string} />
                  {typeof v.trim === 'string' && v.trim && <Field label="Trim" value={v.trim} />}
                  <Field label="Coverage" value={v.coverageType as string} />
                </div>
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
              </>
            )}
          </Section>

          {/* Broker Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Private notes (not shown to client)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesSave}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
              placeholder="Add notes about this submission..."
            />
            <div className="text-xs text-slate-500 mt-0.5">
              {saving ? 'Saving...' : notesSaved ? `Saved ${notesSaved}` : ''}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
            {status !== 'reviewed' && (
              <button
                type="button"
                onClick={() => handleStatusChange('reviewed')}
                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Mark Reviewed
              </button>
            )}
            {status !== 'archived' && (
              <button
                type="button"
                onClick={() => handleStatusChange('archived')}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Archive
              </button>
            )}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50"
            >
              {resendDone ? 'Sent!' : resending ? 'Sending...' : 'Resend Form Link'}
            </button>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
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
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined | boolean }) {
  if (value === null || value === undefined || value === '') return null;
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-500 min-w-[80px]">{label}:</span>
      <span className="text-slate-900">{display}</span>
    </div>
  );
}
