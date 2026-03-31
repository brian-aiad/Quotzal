"use client";

import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </NuqsAdapter>
  );
}
