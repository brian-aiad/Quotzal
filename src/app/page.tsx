"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { QuotzalLogo } from "@/components/ui/logo";
import {
  Zap,
  Users,
  AlertTriangle,
  Shield,
  LayoutGrid,
  Database,
  Mail,
} from "lucide-react";

/* ─── Main landing page ─── */
export default function MarketingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-gray-950/90 backdrop-blur-sm border-gray-800"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/">
            <QuotzalLogo size="md" dark />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-emerald-600 text-white px-5 h-11 inline-flex items-center rounded-xl hover:bg-emerald-500 transition-colors duration-150"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero-bg relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28 flex items-center">
        {/* Noise overlay */}
        <div className="absolute inset-0 noise-texture opacity-[0.03] mix-blend-overlay pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left column — text content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Stop chasing clients{" "}
              <span className="text-emerald-400">
                for information.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg text-gray-400 max-w-md mt-4 mb-8">
              Send one link. Get a complete, quote-ready intake form back in
              minutes — organized, structured, and ready to quote.
            </p>

            {/* CTA row */}
            <div className="flex flex-row items-center gap-4 flex-wrap justify-center lg:justify-start">
              <Link
                href="/demo"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/25"
              >
                Get your free demo link →
              </Link>
              <a
                href="#pricing"
                className="text-white/60 hover:text-white text-sm font-medium underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-all duration-150"
              >
                See pricing
              </a>
            </div>

            {/* Trust line — avatars */}
            <div className="flex items-center gap-2 flex-wrap mt-6 justify-center lg:justify-start">
              <div className="flex -space-x-1.5">
                {[
                  { initials: "MT", color: "bg-emerald-700" },
                  { initials: "SR", color: "bg-emerald-600" },
                  { initials: "DK", color: "bg-emerald-800" },
                ].map((a) => (
                  <div
                    key={a.initials}
                    className={`w-6 h-6 rounded-full ${a.color} flex items-center justify-center border-2 border-[#080d09]`}
                  >
                    <span className="text-[8px] font-bold text-white">
                      {a.initials}
                    </span>
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                Trusted by 500+ independent brokers
              </span>
            </div>

            {/* Trust checkmarks */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 mt-3 justify-center lg:justify-start">
              <span>✓ No credit card required</span>
              <span>·</span>
              <span>✓ 30-day free trial</span>
              <span>·</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>

          {/* Right column — product mockup */}
          <div className="w-full lg:w-[45%] shrink-0 max-w-sm lg:max-w-none mx-auto lg:mx-0 self-center">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
              {/* Browser header bar */}
              <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 bg-white/5 rounded-md px-3 py-1.5 text-xs text-gray-500 font-mono text-center">
                  quotzal.com/f/jane-insurance
                </div>
              </div>

              {/* Form content inside browser */}
              <div className="bg-white p-5 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">J</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Jane&apos;s Insurance
                    </p>
                    <p className="text-xs text-gray-400">
                      Insurance intake form
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i === 1 ? "bg-emerald-600" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                  What type of insurance do you need?
                </p>
                <p className="text-xs md:text-sm text-gray-400 mb-4">
                  Select one to get started
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { emoji: "🚗", label: "Auto — Personal", active: true },
                    { emoji: "🏠", label: "Home / Renters", active: false },
                    { emoji: "❤️", label: "Life Insurance", active: false },
                    { emoji: "🏍️", label: "Motorcycle", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-xl p-3 text-center border-2 transition-all ${
                        item.active
                          ? "bg-emerald-50 border-emerald-400 shadow-sm"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="text-lg mb-1">{item.emoji}</div>
                      <div className="text-[10px] md:text-xs font-medium text-gray-700 leading-tight">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-emerald-600 rounded-xl py-3 text-center">
                  <span className="text-sm text-white font-semibold">
                    Next →
                  </span>
                </div>
              </div>

            {/* Bottom fade — mobile only */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#080d09] to-transparent pointer-events-none lg:hidden" />

            {/* Ambient glow beneath mockup */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-600/20 blur-3xl pointer-events-none" />
          </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-4 md:gap-0">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 md:pr-8 md:border-r md:border-gray-100">
              Trusted by independent<br className="hidden md:block" />brokers across the US
            </p>
            <div className="flex items-center gap-0 divide-x divide-gray-100 flex-1">
              {[
                { number: "500+", label: "Active brokers" },
                { number: "12,000+", label: "Quotes collected" },
                { number: "4.9★", label: "Average rating" },
              ].map((stat) => (
                <div key={stat.number} className="flex-1 text-center px-6 py-1">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight tabular-nums">
                    {stat.number}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PAIN ("You're losing hours every week.") ── */}
      <section className="py-14 md:py-18 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start mb-10">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-[1.1]">
                You&apos;re losing hours<br />every week.
              </h2>
            </div>
            <div className="flex items-center">
              <p className="text-lg text-gray-500 leading-relaxed">
                The average independent broker spends 3–5 hours per week chasing
                clients for the same information — back-and-forth texts, repeated
                calls, incomplete emails.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 mb-8">
            {[
              {
                avatar: "S",
                name: "Sarah M.",
                role: "Client",
                quote: "\"What's the VIN on that car?\"",
                subtext: "You asked three times. Still waiting.",
              },
              {
                avatar: "D",
                name: "David R.",
                role: "Client",
                quote: "\"Can you resend your license number?\"",
                subtext: "The client sent a photo. You can't read it.",
              },
              {
                avatar: "L",
                name: "Linda K.",
                role: "Client",
                quote: "\"I'll get you the policy expiry date tomorrow\"",
                subtext: "That was last Tuesday. Still no quote.",
              },
            ].map((card) => (
              <div
                key={card.name}
                className="bg-gray-50 rounded-2xl p-5 border border-gray-100 relative"
              >
                <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-amber-400 rounded-full" />
                <div className="flex items-center gap-2 mb-3 pl-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {card.avatar}
                  </div>
                  <span className="text-xs text-gray-500">{card.name} · {card.role}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-snug mb-2 pl-3">
                  {card.quote}
                </p>
                <p className="text-xs text-gray-400 pl-3">{card.subtext}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-100" />
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-full px-5 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700">
                Quotzal collects all of this in under 3 minutes
              </span>
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-14 md:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Three steps. That&apos;s it.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* STEP 1 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-950 p-4 relative overflow-hidden">
                <div className="bg-white rounded-xl p-3 max-w-[220px] mx-auto shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Y</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 leading-none">You → Sarah</p>
                      <p className="text-[10px] text-gray-400">iMessage</p>
                    </div>
                  </div>
                  <div className="bg-emerald-600 rounded-xl rounded-tl-sm px-3 py-2 ml-4">
                    <p className="text-white text-xs leading-snug">
                      Hi Sarah, here&apos;s your quote form:{" "}
                      <span className="underline">quotzal.com/f/jane →</span>
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-300 text-right mt-1">Delivered</p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Step 01</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Send your link</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Text, email, or add it to your website. One link, every client, every insurance type.
                </p>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-100 p-4">
                <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Personal Information</p>
                  <div className="space-y-1.5">
                    {[
                      { label: "FULL NAME", value: "Sarah Johnson" },
                      { label: "DATE OF BIRTH", value: "03/15/1988" },
                      { label: "DRIVER'S LICENSE #", value: "CA D1234567" },
                    ].map((field) => (
                      <div key={field.label}>
                        <p className="text-[9px] text-gray-400 uppercase tracking-wider">{field.label}</p>
                        <p className="text-xs font-semibold text-gray-800">{field.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className={`h-0.5 flex-1 rounded-full ${i <= 2 ? "bg-emerald-500" : "bg-gray-200"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Step 02</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Client fills it out</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Smart questions for auto, home, life, motorcycle, boat, RV. VINs decoded automatically. Takes 3 minutes on a phone.
                </p>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-50 p-4">
                <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Q</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 leading-none">Quotzal</p>
                      <p className="text-[10px] text-gray-400">noreply@quotzal.com</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-900 mb-0.5">New Auto Personal — Sarah Johnson</p>
                  <p className="text-[10px] text-gray-400 mb-2">Just submitted via your Quotzal form</p>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 mb-2">
                    <p className="text-[10px] text-emerald-700 font-medium">2 drivers · 1 vehicle · Full Coverage</p>
                  </div>
                  <div className="bg-emerald-600 rounded-lg px-2.5 py-1.5 text-center">
                    <p className="text-white text-[10px] font-semibold">View Full Details →</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Step 03</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">You get everything</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  A structured email hits your inbox. Open your dashboard and quote immediately. No follow-up needed.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Get your free link
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-xs text-gray-400 mt-2">No credit card required · 30-day free trial</p>
          </div>
        </div>
      </section>

      {/* ── EMAIL MOCKUP — DARK SECTION ── */}
      <section className="bg-gray-950 py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-400 mb-3">
              What lands in your inbox
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
              Every detail. Every time.
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Here&apos;s exactly what you receive after a client fills out an auto quote.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-gray-400">noreply@quotzal.com</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">Q</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Quotzal</p>
                    <p className="text-xs text-gray-400">noreply@quotzal.com</p>
                  </div>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-0.5">New Auto Personal — Sarah Johnson</h3>
                <p className="text-xs text-gray-400 mb-3">Just submitted via your Quotzal form</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4">
                  <p className="text-sm text-emerald-700 font-medium">2 drivers · 1 vehicle — 2024 Toyota Camry · Full Coverage</p>
                </div>
                {[
                  {
                    section: "CUSTOMER INFO",
                    rows: [
                      ["Name", "Sarah Johnson"],
                      ["Phone", "(555) 234-5678"],
                      ["Email", "sarah@email.com"],
                    ],
                  },
                  {
                    section: "DRIVER 1",
                    rows: [
                      ["License", "CA D1234567"],
                      ["Violations", "None in 5 years"],
                    ],
                  },
                  {
                    section: "VEHICLE",
                    rows: [
                      ["VIN decoded", "2024 Toyota Camry LE"],
                      ["Coverage", "Full Coverage"],
                    ],
                  },
                  {
                    section: "CURRENT INSURANCE",
                    rows: [
                      ["Carrier", "State Farm"],
                      ["Limits", "100/300/100"],
                      ["Expires", "June 15, 2026"],
                    ],
                  },
                ].map((group) => (
                  <div key={group.section} className="mb-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{group.section}</p>
                    <div className="space-y-1">
                      {group.rows.map(([label, value]) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-gray-500">{label}</span>
                          <span className="text-gray-900 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="w-full mt-3 bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl text-center cursor-default select-none">
                  View Full Details in Dashboard
                </div>
              </div>
            </div>

            <div className="space-y-0">
              <h3 className="text-2xl font-bold text-white mb-6 leading-snug">
                You&apos;ll never have to<br />ask again.
              </h3>
              {[
                {
                  icon: Zap,
                  title: "VIN decoded automatically",
                  desc: "Year, Make, Model, and Trim filled in before you open the email.",
                },
                {
                  icon: Users,
                  title: "Every driver captured",
                  desc: "Names, license numbers, states, relationships, and SR-22 flags.",
                },
                {
                  icon: AlertTriangle,
                  title: "Violations logged precisely",
                  desc: "Type, exact date, and description — not just 'had a ticket once.'",
                },
                {
                  icon: Shield,
                  title: "Current insurance documented",
                  desc: "Carrier, limits, and exact policy expiry date — ready to compare.",
                },
                {
                  icon: LayoutGrid,
                  title: "All 8 insurance types",
                  desc: "Auto, home, life, motorcycle, boat, RV — one tool for everything.",
                },
                {
                  icon: Database,
                  title: "Searchable dashboard",
                  desc: "Every submission stored, searchable, filterable, and exportable as CSV.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 py-4 border-b border-gray-800 last:border-0"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-900/60 border border-emerald-800/50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">{item.title}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-14 md:py-18 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 mb-2">
              What brokers say after their first week
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-3 bg-gray-950 rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <div className="flex gap-0.5 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-lg text-white font-medium leading-relaxed mb-6">
                  &ldquo;I sent my first Quotzal link on a Monday. By Friday I had three
                  complete auto quotes ready — no follow-up calls, no chasing.
                  That&apos;s never happened before.&rdquo;
                </blockquote>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MT</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Marcus T.</p>
                  <p className="text-emerald-400 text-xs">Independent Auto Broker, Texas</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col gap-4">
              {[
                {
                  initials: "SR",
                  name: "Sandra R.",
                  role: "P&C Broker, Florida",
                  quote: "The VIN decode alone saves me 10 minutes per quote. My clients fill out the form in 3 minutes and I get everything I need.",
                },
                {
                  initials: "DK",
                  name: "David K.",
                  role: "Life & Auto Broker, California",
                  quote: "I was skeptical it would capture everything. Then I got my first submission with drivers, violations, and current policy details all organized. Sold.",
                },
              ].map((t) => (
                <div key={t.name} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex-1">
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">{t.initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-14 md:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-2">
              Simple, transparent pricing.
            </h2>
            <p className="text-gray-500 text-lg">Start free for 30 days. No credit card required.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Starter</h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-bold text-gray-900">$19</span>
                <span className="text-gray-400 text-sm">/mo</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {[
                  "1 intake form link",
                  "All 8 insurance types",
                  "Dashboard & email notifications",
                  "CSV export",
                  "12-month data retention",
                  "Powered by Quotzal branding",
                  "30-day free trial",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=starter"
                className="block w-full text-center border-2 border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 shadow-sm relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Most popular
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Pro</h3>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-bold text-gray-900">$39</span>
                <span className="text-gray-400 text-sm">/mo</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {[
                  "Everything in Starter",
                  "Unlimited link aliases",
                  "White label (your logo & colors)",
                  "Renewal reminders",
                  "PDF export",
                  "24-month data retention",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=pro"
                className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Cancel anytime · No setup fees · Instant access
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            <div className="md:sticky md:top-8 md:self-start">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                Common questions.
              </h2>
              <p className="text-gray-500 mt-3 text-base leading-relaxed">
                Everything you need to know before you sign up.
              </p>
              <a href="mailto:hello@quotzal.com" className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                <Mail className="w-4 h-4" />
                Still have questions? Email us →
              </a>
            </div>

            <div className="divide-y divide-gray-100">
              <FaqItem
                question="What info does the form collect?"
                answer="Quotzal supports 8 insurance types: personal auto, commercial auto, home, life, motorcycle, boat, RV, and a general 'other' category. Each type has tailored questions — from VINs and driver details to property specs and beneficiary info."
              />
              <FaqItem
                question="Is it secure?"
                answer="Yes. All data is transmitted over HTTPS and stored securely with Supabase (built on Postgres with row-level security). Your clients' information is protected at every step."
              />
              <FaqItem
                question="Can I use my own branding?"
                answer="Pro plan users can upload their logo and set a custom brand color. Your clients will see your branding on the form — not ours."
              />
              <FaqItem
                question="What happens after a client submits?"
                answer="You get an instant email with a clean summary plus all the details. The submission also appears in your dashboard where you can review, add notes, and export data."
              />
              <FaqItem
                question="Can I cancel anytime?"
                answer="Absolutely. No contracts, no cancellation fees. Cancel from your dashboard and your link simply deactivates at the end of your billing period."
              />
              <FaqItem
                question="Does it work on mobile?"
                answer="Yes. The intake form and your dashboard are fully responsive. Clients can fill out forms on any device, and you can review submissions from your phone."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BAND ── */}
      <section className="bg-emerald-600">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                Ready to stop chasing clients?
              </p>
              <p className="text-emerald-200 text-sm mt-0.5">
                Start your 30-day free trial. No credit card required.
              </p>
            </div>
            <Link
              href="/signup"
              className="bg-white text-emerald-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors flex-shrink-0 whitespace-nowrap"
            >
              Get started free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-slate-400 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <QuotzalLogo size="sm" dark />
              <p className="text-sm mt-1">Insurance intake, simplified.</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link
                href="/demo"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Demo
              </Link>
              <Link
                href="/login"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/terms"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-8 border-t border-white/5 text-xs text-gray-600">
            <span>🔒 SSL secured</span>
            <span>🏦 Stripe payments</span>
            <span>📧 Email via Resend</span>
            <span>🗄️ Hosted on Vercel</span>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>
              &copy; {new Date().getFullYear()} Quotzal. All rights reserved.
            </span>
            <a
              href="mailto:hello@quotzal.com"
              className="text-slate-400 hover:text-white transition-colors"
            >
              hello@quotzal.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Helper components ─── */

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-semibold text-gray-900 hover:text-emerald-600 transition-colors">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 shrink-0 ml-4 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-500 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}
