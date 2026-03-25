import type { Metadata } from "next";
import Link from "next/link";
import { QuotzalLogo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Log in or create your Quotzal account",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/30 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link href="/"><QuotzalLogo size="lg" /></Link>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
