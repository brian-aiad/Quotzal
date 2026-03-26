"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QuotzalLogo } from "@/components/ui/logo";

interface AuthShellProps {
  children: React.ReactNode;
  leftContent?: React.ReactNode;
}

/* Default left panel content — testimonial + stats */
function DefaultLeftContent() {
  return (
    <>
      {/* Testimonial */}
      <div className="max-w-md">
        <div className="text-8xl text-emerald-600/20 font-serif leading-none mb-2 -ml-2 select-none">&ldquo;</div>
        <p className="text-2xl text-white font-medium leading-snug mb-8">
          I used to spend 45 minutes per quote chasing info. Now I send one link and I&apos;m quoting in 10 minutes.
        </p>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white">JR</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Jane R.</p>
            <p className="text-xs text-gray-400">Independent Auto Broker &middot; Texas</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center mt-12 pt-8 border-t border-white/10">
        {[
          { n: "500+", l: "BROKERS" },
          { n: "12k+", l: "QUOTES" },
          { n: "4.9\u2605", l: "RATING" },
        ].map((s, i) => (
          <div
            key={s.n}
            className={`flex-1 ${i > 0 ? "border-l border-white/10 pl-6" : ""}`}
          >
            <div className="text-2xl font-bold text-white">{s.n}</div>
            <div className="text-[10px] font-medium tracking-widest text-gray-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function AuthShell({ children, leftContent }: AuthShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark brand */}
      <div className="hidden lg:flex lg:w-[45%] auth-dark-bg flex-col relative overflow-hidden">
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.04] auth-dot-grid" />

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px] animate-glow-pulse pointer-events-none" />

        {/* TOP: Logo */}
        <div className="relative z-10 p-10 pb-0">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <QuotzalLogo size="md" dark />
          </Link>
        </div>

        {/* MIDDLE: Content */}
        <div className="relative z-10 flex-1 flex items-center px-10">
          <div className="w-full">
            {leftContent ?? <DefaultLeftContent />}
          </div>
        </div>

        {/* BOTTOM: Copyright */}
        <div className="relative z-10 px-10 pb-8">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Quotzal. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 min-h-screen bg-white relative flex flex-col">
        {/* Top accent line */}
        <div className="h-0.5 bg-emerald-500 shrink-0" />

        {/* Mobile header */}
        <div className="lg:hidden px-6 pt-8 shrink-0">
          <Link href="/">
            <QuotzalLogo size="md" />
          </Link>
          <p className="text-xs text-gray-400 mt-1">Insurance intake, simplified.</p>
        </div>

        {/* Centered form container */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-12 overflow-y-auto">
          <div
            className={`w-full transition-all duration-[400ms] ease-out ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
