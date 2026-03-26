'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SubmissionRow, SubmissionStatus } from '@/lib/types/dashboard';
import { InsuranceTypePill } from './insurance-type-pill';
import { StatusTag } from './status-tag';
import { SubmissionDetailPanel } from './submission-detail-panel';
import { INSURANCE_TYPE_OPTIONS } from '@/lib/constants/insurance-types';

interface SubmissionsTableProps {
  initialSubmissions: SubmissionRow[];
  initialTotal: number;
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

export function SubmissionsTable({ initialSubmissions, initialTotal }: SubmissionsTableProps) {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>(initialSubmissions);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('submitted_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<SubmissionRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const perPage = 25;
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

  function handleSort(col: string) {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
    setPage(1);
  }

  function toggleType(type: string) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setPage(1);
  }

  function handleExport() {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','));
    if (statusFilter) params.set('status', statusFilter);
    window.open(`/api/dashboard/submissions/export?${params}`, '_blank');
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  const sortArrow = (col: string) => {
    if (sortBy !== col) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

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
                    onClick={() => { setSelectedTypes([]); setPage(1); }}
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
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-11 px-4 text-sm border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-150"
            >
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
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
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-32" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                      <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-12" /></td>
                    </tr>
                  ))}
                </>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm font-medium text-gray-500">No submissions yet</p>
                    <p className="text-sm text-gray-400 mt-1">Share your form link to start collecting quote requests.</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelected(sub)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
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
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-sm font-medium text-gray-500">No submissions yet</p>
              <p className="text-sm text-gray-400 mt-1">Share your form link to start collecting quote requests.</p>
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
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
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
