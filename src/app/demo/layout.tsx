import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try Quotzal — Free Demo",
  description: "Get a free demo link to see how Quotzal helps insurance brokers collect client info.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
