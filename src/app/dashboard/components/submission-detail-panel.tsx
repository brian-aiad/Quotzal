'use client';

import { useState, useRef, useEffect } from 'react';
import type { SubmissionRow, SubmissionStatus } from '@/lib/types/dashboard';
import { toast } from 'sonner';
import { InsuranceTypePill } from './insurance-type-pill';
import { getInsuranceTypeLabel } from '@/lib/constants/insurance-types';
import type { InsuranceType } from '@/lib/types/intake-form';
import { DeleteModal } from './delete-modal';
import { TAG_COLORS, PRESET_TAGS } from '@/lib/constants';
import type { TagColor } from '@/lib/constants';

const TAG_COLOR_CLASSES: Record<TagColor, { bg: string; text: string; dot: string }> = {
  gray: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  red: { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
  blue: { bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
};

interface SubmissionDetailPanelProps {
  submission: SubmissionRow;
  brokerageName: string;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  intake: 'Intake',
  reviewing: 'Reviewing',
  quoted: 'Quoted',
  bound: 'Bound',
  declined: 'Declined',
  archived: 'Archived',
};

const PIPELINE_STEPS: Array<{ statuses: SubmissionStatus[]; label: string }> = [
  { statuses: ['intake'], label: 'Intake' },
  { statuses: ['reviewing'], label: 'Reviewing' },
  { statuses: ['quoted'], label: 'Quoted' },
  { statuses: ['bound', 'declined'], label: 'Outcome' },
  { statuses: ['archived'], label: 'Archived' },
];

function getStepIndex(status: SubmissionStatus): number {
  return PIPELINE_STEPS.findIndex((step) => step.statuses.includes(status));
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
  brokerageName,
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
  const [tags, setTags] = useState<Array<{ text: string; color: string }>>(submission.tags ?? []);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpBody, setFollowUpBody] = useState('');
  const [showTagPopover, setShowTagPopover] = useState(false);
  const [newTagText, setNewTagText] = useState('');
  const [newTagColor, setNewTagColor] = useState<TagColor>('emerald');
  const tagPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tagPopoverRef.current && !tagPopoverRef.current.contains(e.target as Node)) {
        setShowTagPopover(false);
      }
    }
    if (showTagPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTagPopover]);

  async function saveTags(updated: Array<{ text: string; color: string }>) {
    setTags(updated);
    const res = await fetch(`/api/dashboard/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: updated }),
    });
    if (res.ok) {
      toast.success('Tags updated.');
    } else {
      toast.error('Failed to update tags.');
    }
    onUpdate();
  }

  function handleRemoveTag(index: number) {
    const updated = tags.filter((_, i) => i !== index);
    saveTags(updated);
  }

  function handleAddTag() {
    const text = newTagText.trim();
    if (!text || text.length > 50) return;
    const updated = [...tags, { text, color: newTagColor }];
    saveTags(updated);
    setNewTagText('');
    setShowTagPopover(false);
  }

  function handlePresetTag(preset: string) {
    const updated = [...tags, { text: preset, color: 'emerald' }];
    saveTags(updated);
    setShowTagPopover(false);
  }

  async function handleStatusChange(newStatus: SubmissionStatus) {
    setStatus(newStatus);
    const res = await fetch(`/api/dashboard/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`Submission marked as ${STATUS_LABELS[newStatus] || newStatus}.`);
    } else {
      toast.error('Failed to update status.');
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
      toast.error('Failed to save notes.');
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
      toast.success('Submission deleted.');
    } else {
      toast.error('Failed to delete submission.');
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

  function handleOpenFollowUp() {
    const typeLabel = getInsuranceTypeLabel(submission.insurance_type as InsuranceType);
    const template = `Hi ${submission.first_name},\n\nI've received your intake form and I'm working on quotes for your ${typeLabel} coverage. I'll have options for you within a few days.\n\nFeel free to reply with any questions.\n\n\u2014 ${brokerageName}`;
    setFollowUpBody(template);
    setShowFollowUp(true);
  }

  function handleOpenEmailClient() {
    const typeLabel = getInsuranceTypeLabel(submission.insurance_type as InsuranceType);
    const subject = `Your ${typeLabel} quote update`;
    const mailto = `mailto:${encodeURIComponent(submission.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(followUpBody)}`;
    window.open(mailto, '_blank');
  }

  const fd = submission.form_data;
  const drivers = fd.drivers as Array<Record<string, unknown>> | undefined;
  const vehicles = fd.vehicles as Array<Record<string, unknown>> | undefined;
  const extFields = (fd.extended_fields ?? {}) as Record<string, string>;
  const customFieldValues = (fd.custom_fields ?? {}) as Record<string, string>;

  const activeStepIndex = getStepIndex(status);

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

          {/* Status — Desktop Pipeline */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>

            {/* Desktop: horizontal pill pipeline */}
            <div className="hidden md:flex items-center gap-1">
              {PIPELINE_STEPS.map((step, i) => {
                const isActive = i === activeStepIndex;
                const isCompleted = i < activeStepIndex;

                // For the outcome step, show bound/declined as sibling buttons
                if (step.statuses.length > 1) {
                  return (
                    <div key={step.label} className="flex items-center gap-1">
                      {i > 0 && (
                        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                      {step.statuses.map((s) => {
                        const isCurrent = s === status;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleStatusChange(s)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              isCurrent
                                ? s === 'bound'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-red-500 text-white'
                                : isCompleted
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {isCurrent && (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                            {STATUS_LABELS[s]}
                          </button>
                        );
                      })}
                    </div>
                  );
                }

                const singleStatus = step.statuses[0];
                return (
                  <div key={step.label} className="flex items-center gap-1">
                    {i > 0 && (
                      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStatusChange(singleStatus)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {isCompleted && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {step.label}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Mobile: simple dropdown */}
            <div className="md:hidden">
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as SubmissionStatus)}
                className="h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="intake">Intake</option>
                <option value="reviewing">Reviewing</option>
                <option value="quoted">Quoted</option>
                <option value="bound">Bound</option>
                <option value="declined">Declined</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Tags</label>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag, i) => {
                const colors = TAG_COLOR_CLASSES[tag.color as TagColor] ?? TAG_COLOR_CLASSES.gray;
                return (
                  <span
                    key={`${tag.text}-${i}`}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                  >
                    {tag.text}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(i)}
                      className="hover:opacity-70 transition-opacity"
                      aria-label={`Remove tag ${tag.text}`}
                    >
                      &times;
                    </button>
                  </span>
                );
              })}

              {/* Add tag button + popover */}
              <div className="relative" ref={tagPopoverRef}>
                <button
                  type="button"
                  onClick={() => setShowTagPopover((v) => !v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  + Tag
                </button>
                {showTagPopover && (
                  <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-30 p-3 space-y-3">
                    {/* Color picker */}
                    <div className="flex items-center gap-2">
                      {TAG_COLORS.map((c) => {
                        const dotClass = TAG_COLOR_CLASSES[c].dot;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewTagColor(c)}
                            className={`w-6 h-6 rounded-full ${dotClass} transition-all ${
                              newTagColor === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : 'hover:scale-110'
                            }`}
                            aria-label={`Select ${c} color`}
                          />
                        );
                      })}
                    </div>

                    {/* Text input + Add button */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTagText}
                        onChange={(e) => setNewTagText(e.target.value.slice(0, 50))}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                        placeholder="Tag name..."
                        maxLength={50}
                        className="flex-1 h-9 border border-gray-200 rounded-lg px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        disabled={!newTagText.trim()}
                        className="h-9 px-3 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-lg active:scale-[0.98] transition-all"
                      >
                        Add
                      </button>
                    </div>

                    {/* Preset quick-add */}
                    <div className="border-t border-gray-100 pt-2">
                      <p className="text-xs text-gray-400 mb-1.5">Quick add</p>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_TAGS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handlePresetTag(preset)}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
            {status === 'intake' && (
              <button
                type="button"
                onClick={() => handleStatusChange('reviewing')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 px-5 active:scale-[0.98] transition-all text-sm"
              >
                Start Review
              </button>
            )}
            {status === 'reviewing' && (
              <button
                type="button"
                onClick={() => handleStatusChange('quoted')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl h-11 px-5 active:scale-[0.98] transition-all text-sm"
              >
                Mark Quoted
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
              onClick={handleOpenFollowUp}
              className="h-11 px-4 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all"
            >
              Send Follow-Up
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

      {showFollowUp && (
        <>
          {/* Follow-Up Modal Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/40"
            onClick={() => setShowFollowUp(false)}
          />
          {/* Follow-Up Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900">Send Follow-Up</h3>
              <p className="text-sm text-gray-500">
                Edit the message below, then open your email client to send it to{' '}
                <span className="font-medium text-gray-700">{submission.email}</span>.
              </p>
              <textarea
                value={followUpBody}
                onChange={(e) => setFollowUpBody(e.target.value)}
                rows={8}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white resize-none transition-all"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFollowUp(false)}
                  className="h-11 px-5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleOpenEmailClient}
                  className="h-11 px-5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl active:scale-[0.98] transition-all"
                >
                  Open in Email Client
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined | boolean }) {
  const [copied, setCopied] = useState(false);

  if (value === null || value === undefined || value === '') return null;
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

  function handleCopy() {
    navigator.clipboard.writeText(String(display)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="group flex gap-2 text-sm items-start">
      <span className="text-gray-500 min-w-[80px]">{label}:</span>
      <span className="text-gray-900 flex items-center gap-1">
        {display}
        <button
          type="button"
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-200"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <span className="text-xs text-emerald-600 font-medium">Copied</span>
          ) : (
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </span>
    </div>
  );
}
