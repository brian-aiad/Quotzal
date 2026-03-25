import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Log in or create your Quotzal account",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <>{children}</>;
}
