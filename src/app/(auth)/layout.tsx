import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Log in or create your Quotzal account",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
