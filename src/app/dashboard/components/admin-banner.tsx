"use client";

import { useRouter } from "next/navigation";

interface AdminBannerProps {
  brokerName: string;
}

export function AdminBanner({ brokerName }: AdminBannerProps) {
  const router = useRouter();

  async function handleExit() {
    await fetch("/api/admin/impersonate", { method: "DELETE" });
    router.push("/admin");
  }

  return (
    <div className="bg-red-600 text-white px-4 py-2 text-sm font-medium flex items-center justify-center gap-3">
      <span>⚠ ADMIN VIEW — Impersonating {brokerName}</span>
      <button
        onClick={handleExit}
        className="px-3 py-1 bg-white text-red-600 rounded text-xs font-bold hover:bg-red-50 transition-colors"
      >
        Exit
      </button>
    </div>
  );
}
