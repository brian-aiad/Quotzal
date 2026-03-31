'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryState, parseAsInteger, parseAsString, parseAsArrayOf } from 'nuqs';
import type { SubmissionRow, SubmissionStatus } from '@/lib/types/dashboard';
import { InsuranceTypePill } from './insurance-type-pill';
import { StatusTag } from './status-tag';
import { SubmissionDetailPanel } from './submission-detail-panel';
import { INSURANCE_TYPE_OPTIONS } from '@/lib/constants/insurance-types';
import { SUBMISSIONS_PER_PAGE } from '@/lib/constants';
import type { TagColor } from '@/lib/constants';
import { toast } from 'sonner';

const TAG_COLOR_CLASSES: Record<TagColor, { bg: string; text: string }> = {
  gray: { bg: 'bg-gray-100', text: 'text-gray-700' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  blue: { bg: 'bg-sky-100', text: 'text-sky-700' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
};

function TagPills({ tags }: { tags: Array<{ text: string; color: string }> | null }) {
  if (!tags || tags.length === 0) return null;
  const visible = tags.slice(0, 2);
  const overflow = tags.length - 2;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((tag, i) => {
        const colors = TAG_COLOR_CLASSES[tag.color as TagColor] ?? TAG_COLOR_CLASSES.gray;
        return (
          <span
            key={`${tag.text}-${i}`}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            {tag.text}
          </span>
        );
      })}
      {overflow > 0 && (
        <span className="text-xs text-gray-400 font-medium">+{overflow} more</span>
      )}
    </div>
  );
}

interface SubmissionsTableProps {
  initialSubmissions: SubmissionRow[];
  initialTotal: number;
  brokerageName: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Run an array of async tasks with a max concurrency cap */
async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((fn) => fn()));
    results.push(...batchResults);
  }
  return results;
}

export function SubmissionsTable({ initialSubmissions, initialTotal, brokerageName }: SubmissionsTableProps) {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>(initialSubmissions);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [selectedTypes, setSelectedTypes] = useQueryState('type', parseAsArrayOf(parseAsString, ',').withDefault([]));
  const [statusFilter, setStatusFilter] = useQueryState('status', parseAsString.withDefault(''));
  const [sortBy, setSortBy] = useQueryState('sort', parseAsString.withDefault('submitted_at'));
  const [sortDir, setSortDir] = useQueryState('order', parseAsString.withDefault('desc'));
  const [selected, setSelected] = useState<SubmissionRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [pendingArchive, setPendingArchive] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const archiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shortcutsRef = useRef<HTMLDivElement>(null);

  const perPage = SUBMISSIONS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (search) params.set('search', search);
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    if (statusFilter) params.set('status', statusFilter);
    params.set('sortBy', sortBy);
    params.set('sortDir', sortDir);

    const res = await fetch(`/api/dashboard/submissions?${params}`);
    const data = (await res.json()) as { submissions: SubmissionRow[]; total: number };
    setSubmissions(data.submissions);
    setTotal(data.total);
    setLoading(false);
  }, [page, search, selectedTypes, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    // Skip the initial render — we already have initialSubmissions
    const isInitial =
      page === 1 && !search && selectedTypes.length === 0 && !statusFilter &&
      sortBy === 'submitted_at' && sortDir === 'desc';
    if (!isInitial || submissions !== initialSubmissions) {
      fetchSubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, selectedTypes, statusFilter, sortBy, sortDir]);

  // Reset focusedIndex and clear selection when filters/page change
  useEffect(() => {
    setFocusedIndex(-1);
    setSelectedIds(new Set());
  }, [search, selectedTypes, statusFilter, page, sortBy, sortDir]);

  // Close shortcuts popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (shortcutsRef.current && !shortcutsRef.current.contains(e.target as Node)) {
        setShowShortcuts(false);
      }
    }
    if (showShortcuts) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShortcuts]);

  // Keyboard shortcuts
  useEffect(() => {
    function isTyping(): boolean {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || (el as HTMLElement).isContentEditable;
    }

    async function patchStatus(submissionId: string, status: SubmissionStatus) {
      const res = await fetch(`/api/dashboard/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        toast.error('Failed to update status');
        return false;
      }
      return true;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (isTyping()) return;

      switch (e.key) {
        case 'j': {
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, submissions.length - 1));
          break;
        }
        case 'k': {
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        }
        case 'Enter': {
          e.preventDefault();
          setFocusedIndex((current) => {
            if (current >= 0 && current < submissions.length) {
              setSelected(submissions[current]);
            }
            return current;
          });
          break;
        }
        case 'e': {
          e.preventDefault();
          setFocusedIndex((current) => {
            if (current >= 0 && current < submissions.length) {
              const sub = submissions[current];
              patchStatus(sub.id, 'reviewing').then((ok) => {
                if (ok) {
                  toast.success(`Marked "${sub.first_name} ${sub.last_name}" as reviewing`);
                  fetchSubmissions();
                }
              });
            }
            return current;
          });
          break;
        }
        case 'a': {
          e.preventDefault();
          setFocusedIndex((current) => {
            if (current >= 0 && current < submissions.length) {
              const sub = submissions[current];
              setPendingArchive((wasPending) => {
                if (wasPending) {
                  if (archiveTimerRef.current) {
                    clearTimeout(archiveTimerRef.current);
                    archiveTimerRef.current = null;
                  }
                  patchStatus(sub.id, 'archived').then((ok) => {
                    if (ok) {
                      toast.success(`Archived "${sub.first_name} ${sub.last_name}"`);
                      fetchSubmissions();
                    }
                  });
                  return false;
                } else {
                  toast('Press "a" again to confirm archive', { duration: 2000 });
                  archiveTimerRef.current = setTimeout(() => {
                    setPendingArchive(false);
                    archiveTimerRef.current = null;
                  }, 2000);
                  return true;
                }
              });
            }
            return current;
          });
          break;
        }
        case 'Escape': {
          e.preventDefault();
          if (selected) {
            setSelected(null);
          } else {
            setFocusedIndex(-1);
          }
          break;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [submissions, selected, fetchSubmissions]);

  // Cleanup archive timer on unmount
  useEffect(() => {
    return () => {
      if (archiveTimerRef.current) clearTimeout(archiveTimerRef.current);
    };
  }, []);

  function handleSort(col: string) {
    if (sortBy === col) {
      void setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      void setSortBy(col);
      void setSortDir('asc');
    }
    void setPage(1);
  }

  function toggleType(type: string) {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    void setSelectedTypes(next);
    void setPage(1);
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    if (statusFilter) params.set('status', statusFilter);
    window.open(`/api/dashboard/submissions/export?${params}`, '_blank');
  }

  function handleSearchChange(value: string) {
    void setSearch(value);
    void setPage(1);
  }

  const sortArrow = (col: string) => {
    if (sortBy !== col) return '';
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  };

  // --- Bulk selection helpers ---

  const selectionCount = selectedIds.size;

  function toggleSelectAll() {
    if (selectionCount === submissions.length && submissions.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(submissions.map((s) => s.id)));
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // --- Bulk action handlers ---

  async function bulkStatusChange(status: SubmissionStatus) {
    const ids = Array.from(selectedIds);
    setBulkLoading(true);
    const tasks = ids.map((id) => () =>
      fetch(`/api/dashboard/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    );
    const results = await runWithConcurrency(tasks, 10);
    const failed = results.filter((r) => !r.ok).length;
    setBulkLoading(false);
    setSelectedIds(new Set());
    await fetchSubmissions();
    if (failed > 0) {
      toast.error(`${failed} of ${ids.length} updates failed`);
    } else {
      toast.success(`Updated ${ids.length} submission${ids.length === 1 ? '' : 's'} to ${status}`);
    }
  }

  function bulkExport() {
    const params = new URLSearchParams();
    const ids = Array.from(selectedIds);
    ids.forEach((id) => params.append('ids', id));
    window.open(`/api/dashboard/submissions/export?${params}`, '_blank');
  }

  async function bulkDelete() {
    const ids = Array.from(selectedIds);
    setBulkLoading(true);
    const tasks = ids.map((id) => () =>
      fetch(`/api/dashboard/submissions/${id}`, {
        method: 'DELETE',
      })
    );
    const results = await runWithConcurrency(tasks, 10);
    const failed = results.filter((r) => !r.ok).length;
    setBulkLoading(false);
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
    await fetchSubmissions();
    if (failed > 0) {
      toast.error(`${failed} of ${ids.length} deletions failed`);
    } else {
      toast.success(`Deleted ${ids.length} submission${ids.length === 1 ? '' : 's'}`);
    }
  }

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 h-11 border border-gray-200 rounded-xl px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white transition-all duration-150"
          />
          <div className="flex gap-2 flex-wrap">
            {/* Type filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTypeFilter(!showTypeFilter)}
                className="h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-gray-700 transition-all"
              >
                Type {selectedTypes.length > 0 && `(${selectedTypes.length})`}
              </button>
              {showTypeFilter && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 min-w-[200px]">
                  {INSURANCE_TYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(opt.value)}
                        onChange={() => toggleType(opt.value)}
                        className="rounded border-gray-300"
                      />
                      {opt.label}
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => { void setSelectedTypes([]); void setPage(1); }}
                    className="w-full mt-1 text-xs text-emerald-600 hover:text-emerald-700 py-1"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => { void setStatusFilter(e.target.value); void setPage(1); }}
              className="h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-150"
            >
              <option value="">All statuses</option>
              <option value="intake">Intake</option>
              <option value="reviewing">Reviewing</option>
              <option value="quoted">Quoted</option>
              <option value="bound">Bound</option>
              <option value="declined">Declined</option>
              <option value="archived">Archived</option>
            </select>

            {/* Export */}
            <button
              type="button"
              onClick={handleExport}
              className="h-11 px-4 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-all"
            >
              Export CSV
            </button>

            {/* Keyboard shortcuts help */}
            <div className="relative" ref={shortcutsRef}>
              <button
                type="button"
                onClick={() => setShowShortcuts((v) => !v)}
                className="h-11 w-11 flex items-center justify-center text-sm font-medium text-gray-400 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:text-gray-600 transition-all"
                title="Keyboard shortcuts"
              >
                ?
              </button>
              {showShortcuts && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-3 min-w-[200px]">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Keyboard Shortcuts</p>
                  <div className="space-y-1.5 text-sm text-gray-700">
                    <div className="flex justify-between gap-4">
                      <kbd className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">j/k</kbd>
                      <span className="text-gray-500">Navigate rows</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <kbd className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">Enter</kbd>
                      <span className="text-gray-500">Open details</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <kbd className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">e</kbd>
                      <span className="text-gray-500">Start review</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <kbd className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">a a</kbd>
                      <span className="text-gray-500">Archive</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <kbd className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">Esc</kbd>
                      <span className="text-gray-500">Close / unfocus</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (desktop only) */}
        {selectionCount > 0 && (
          <div className="hidden md:flex items-center gap-3 px-4 py-3 bg-emerald-50 border-b border-emerald-200">
            <span className="text-sm font-medium text-emerald-800">
              {selectionCount} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => bulkStatusChange('reviewing')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Mark as Reviewing ({selectionCount})
              </button>
              <button
                type="button"
                disabled={bulkLoading}
                onClick={() => bulkStatusChange('archived')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Archive ({selectionCount})
              </button>
              <button
                type="button"
                disabled={bulkLoading}
                onClick={bulkExport}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Export Selected
              </button>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder='Type "delete" to confirm'
                    className="h-8 px-3 text-xs border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-44"
                  />
                  <button
                    type="button"
                    disabled={deleteConfirmText !== 'delete' || bulkLoading}
                    onClick={bulkDelete}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                    className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-gray-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all"
                >
                  Delete
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={submissions.length > 0 && selectionCount === submissions.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('first_name')}
                >
                  Customer{sortArrow('first_name')}
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('insurance_type')}
                >
                  Type{sortArrow('insurance_type')}
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('submitted_at')}
                >
                  Submitted{sortArrow('submitted_at')}
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort('status')}
                >
                  Status{sortArrow('status')}
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tags
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-4" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-32" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-12" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                    </tr>
                  ))}
                </>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    {search || selectedTypes.length > 0 || statusFilter ? (
                      <>
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 24h28M10 16h28M10 32h28M38 8l4 4-4 4M6 32l-4 4 4 4" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">No submissions match those filters.</p>
                        <button
                          type="button"
                          onClick={() => { void setSearch(''); void setSelectedTypes([]); void setStatusFilter(''); void setPage(1); }}
                          className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          Clear filters
                        </button>
                      </>
                    ) : (
                      <>
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M40 26V12a4 4 0 00-4-4H12a4 4 0 00-4 4v14m32 0v10a4 4 0 01-4 4H12a4 4 0 01-4-4V26m32 0h-5.172a2 2 0 00-1.414.586l-4.828 4.828a2 2 0 01-1.414.586h-6.344a2 2 0 01-1.414-.586l-4.828-4.828A2 2 0 0013.172 26H8" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">Your first submission will appear here.</p>
                        <p className="text-sm text-gray-400 mt-1">Share your link to get started.</p>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                submissions.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelected(sub)}
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-100 ${focusedIndex === idx ? 'bg-emerald-50/50 border-l-2 border-l-emerald-500' : ''} ${selectedIds.has(sub.id) ? 'bg-emerald-50/30' : ''}`}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(sub.id)}
                        onChange={() => toggleSelectOne(sub.id)}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {sub.first_name} {sub.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{sub.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <InsuranceTypePill type={sub.insurance_type} />
                    </td>
                    <td className="px-4 py-3">
                      <span title={new Date(sub.submitted_at).toLocaleString()}>
                        {timeAgo(sub.submitted_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusTag status={sub.status} />
                    </td>
                    <td className="px-4 py-3">
                      <TagPills tags={sub.tags} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="px-4 py-16 text-center">
              {search || selectedTypes.length > 0 || statusFilter ? (
                <>
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 24h28M10 16h28M10 32h28M38 8l4 4-4 4M6 32l-4 4 4 4" />
                  </svg>
                  <p className="text-sm font-medium text-gray-500">No submissions match those filters.</p>
                  <button
                    type="button"
                    onClick={() => { void setSearch(''); void setSelectedTypes([]); void setStatusFilter(''); void setPage(1); }}
                    className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M40 26V12a4 4 0 00-4-4H12a4 4 0 00-4 4v14m32 0v10a4 4 0 01-4 4H12a4 4 0 01-4-4V26m32 0h-5.172a2 2 0 00-1.414.586l-4.828 4.828a2 2 0 01-1.414.586h-6.344a2 2 0 01-1.414-.586l-4.828-4.828A2 2 0 0013.172 26H8" />
                  </svg>
                  <p className="text-sm font-medium text-gray-500">Your first submission will appear here.</p>
                  <p className="text-sm text-gray-400 mt-1">Share your link to get started.</p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {submissions.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelected(sub)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {sub.first_name} {sub.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{sub.email}</p>
                    </div>
                    <StatusTag status={sub.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <InsuranceTypePill type={sub.insurance_type} />
                    <span className="text-xs text-gray-400">{timeAgo(sub.submitted_at)}</span>
                  </div>
                  {sub.tags && sub.tags.length > 0 && (
                    <div className="mt-1.5">
                      <TagPills tags={sub.tags} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * perPage + 1}&ndash;{Math.min(page * perPage, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 min-h-[44px] text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 min-h-[44px] text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {selected && (
        <SubmissionDetailPanel
          submission={selected}
          brokerageName={brokerageName}
          onClose={() => setSelected(null)}
          onUpdate={() => {
            fetchSubmissions();
            setSelected(null);
          }}
        />
      )}
    </>
  );
}
