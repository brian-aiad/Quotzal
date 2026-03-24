"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QuotzalLogo } from "@/components/ui/logo";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: ChartIcon },
  { href: "/admin/submissions", label: "All Submissions", icon: ListIcon },
  { href: "/admin/broadcast", label: "Broadcast", icon: MegaphoneIcon },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-60 lg:w-64 flex-col bg-slate-900 border-r border-slate-800 min-h-screen">
        <div className="flex flex-col h-full">
          <div className="px-5 py-5 border-b border-slate-800 flex items-center gap-2">
            <QuotzalLogo size="sm" dark />
            <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
              ADMIN
            </span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {ADMIN_NAV.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-600/10 text-white border-l-2 border-emerald-500 -ml-px"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  <item.icon active={isActive} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 truncate">
              {process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin"}
            </p>
            <Link
              href="/dashboard"
              className="mt-2 block text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3">
        <QuotzalLogo size="xs" dark />
        <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
          ADMIN
        </span>
        <div className="ml-auto flex gap-2">
          {ADMIN_NAV.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-1 text-xs rounded ${
                  isActive ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main id="main-content" className="flex-1 mt-14 md:mt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? "text-emerald-400" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? "text-emerald-400" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function MegaphoneIcon({ active }: { active: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? "text-emerald-400" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}
