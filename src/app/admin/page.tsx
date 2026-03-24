"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface BrokerRow {
  id: string;
  email: string;
  brokerage_name: string;
  plan: string;
  status: string;
  created_at: string;
  submission_count: number;
}

interface AdminStats {
  totalBrokers: number;
  active: number;
  trialing: number;
  pastDue: number;
  cancelledSuspended: number;
  totalSubmissions: number;
  mrr: number;
}

export default function AdminOverviewPage() {
  const [brokers, setBrokers] = useState<BrokerRow[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (planFilter !== "all") params.set("plan", planFilter);

    const res = await fetch(`/api/admin/overview?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setBrokers(data.brokers);
      setStats(data.stats);
    }
    setLoading(false);
  }, [search, statusFilter, planFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Admin Overview</h1>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-8">
          <StatCard label="Total Brokers" value={stats.totalBrokers} />
          <StatCard label="Active" value={stats.active} color="text-green-400" />
          <StatCard label="Trialing" value={stats.trialing} color="text-blue-400" />
          <StatCard label="Past Due" value={stats.pastDue} color="text-yellow-400" />
          <StatCard label="Cancelled" value={stats.cancelledSuspended} color="text-red-400" />
          <StatCard label="Submissions" value={stats.totalSubmissions} />
          <StatCard label="MRR" value={`$${(stats.mrr / 100).toFixed(0)}`} color="text-green-400" />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="trialing">Trialing</option>
          <option value="active">Active</option>
          <option value="past_due">Past Due</option>
          <option value="cancelled">Cancelled</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Plans</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
        </select>
      </div>

      {/* Brokers table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Brokerage</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Plan</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Submissions</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : brokers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No brokers found.
                  </td>
                </tr>
              ) : (
                brokers.map((broker) => (
                  <tr key={broker.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/brokers/${broker.id}`}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                      >
                        {broker.brokerage_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{broker.email}</td>
                    <td className="px-4 py-3">
                      <PlanPill plan={broker.plan} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={broker.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-300">{broker.submission_count}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(broker.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function PlanPill({ plan }: { plan: string }) {
  const styles =
    plan === "pro"
      ? "bg-purple-400/10 text-purple-400"
      : "bg-blue-400/10 text-blue-400";
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles}`}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-green-400/10 text-green-400",
    trialing: "bg-blue-400/10 text-blue-400",
    past_due: "bg-yellow-400/10 text-yellow-400",
    cancelled: "bg-red-400/10 text-red-400",
    suspended: "bg-red-400/10 text-red-400",
  };
  const styles = colorMap[status] || "bg-gray-400/10 text-gray-400";
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles}`}>
      {label}
    </span>
  );
}
