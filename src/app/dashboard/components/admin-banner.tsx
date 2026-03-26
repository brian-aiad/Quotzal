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
    <div className="bg-red-600 text-white px-4 min-h-[44px] text-sm font-medium flex items-center justify-center gap-3 flex-wrap">
      <span>ADMIN VIEW — Impersonating {brokerName}</span>
      <button
        onClick={handleExit}
        className="h-8 px-3 bg-white text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
      >
        Exit
      </button>
    </div>
  );
}
