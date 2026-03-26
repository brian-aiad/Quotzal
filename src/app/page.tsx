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
    <div className="min-h-screen">
      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#080d09]/90 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
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
              className="text-sm font-semibold bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-500 transition-colors duration-150"
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

      {/* ── STATS (transition section dark→white) ── */}
      <section className="py-8 md:py-10 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-8">
            Trusted by independent brokers across the US
          </p>
          <div className="flex flex-row items-center justify-center gap-8 md:gap-0 flex-wrap md:divide-x md:divide-emerald-100">
            {[
              { number: "500+", label: "ACTIVE BROKERS" },
              { number: "12,000+", label: "QUOTES COLLECTED" },
              { number: "4.9★", label: "AVERAGE RATING" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center md:px-12">
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-none mb-2">
                  {stat.number}
                </div>
                <div className="text-xs uppercase tracking-widest text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN ("You're losing hours every week.") ── */}
      <section className="bg-white py-14 md:py-18">
        <div className="max-w-5xl mx-auto px-6">
          {/* Heading — left aligned, max-w-lg */}
          <div className="max-w-lg mb-6">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              You&apos;re losing hours every week.
            </h2>
            <p className="text-gray-500 text-lg mt-4 leading-relaxed">
              The average independent broker spends 3–5 hours per week chasing
              clients for the same information — back-and-forth texts, repeated
              calls, incomplete emails.
            </p>
          </div>

          {/* 3 cards — full width grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {[
              {
                pain: "\"What's the VIN on that car?\"",
                desc: "You asked three times. Still waiting.",
                initial: "S",
                sender: "Sarah M. · Client",
                color: "bg-emerald-700",
              },
              {
                pain: "\"Can you resend your license number?\"",
                desc: "The client sent a photo. You can't read it.",
                initial: "D",
                sender: "David R. · Client",
                color: "bg-emerald-600",
              },
              {
                pain: "\"I'll get you the policy expiry date tomorrow\"",
                desc: "That was last Tuesday. Still no quote.",
                initial: "L",
                sender: "Linda K. · Client",
                color: "bg-amber-500",
              },
            ].map((item) => (
              <div
                key={item.pain}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm border-l-[3px] border-l-amber-400 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-6 h-6 rounded-full ${item.color} flex items-center justify-center`}>
                    <span className="text-xs font-bold text-white">{item.initial}</span>
                  </div>
                  <span className="text-xs text-gray-400">{item.sender}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-2 italic">
                  {item.pain}
                </p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Banner — left aligned */}
          <div className="inline-flex items-center gap-2.5 bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
            Quotzal collects all of this in under 3 minutes
            <span>&rarr;</span>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (alternating rows) ── */}
      <section className="bg-gray-50 py-16 md:py-20 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Three steps. That&apos;s it.
            </h2>
          </div>

          <div className="space-y-0">
            {/* Step 1 — left text, right visual */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-6 md:py-8">
              <div className="flex flex-col justify-center">
                <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">
                  Step 01
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-2">
                  Send your link
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Text, email, or add it to your website. One link, every
                  client, every insurance type.
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center lg:justify-end">
                {/* Mini mockup: phone with text message */}
                <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-xl shadow-gray-200/80 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-xs text-white font-bold">You</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        You → Sarah
                      </p>
                      <p className="text-[10px] text-gray-400">iMessage</p>
                    </div>
                  </div>
                  <div className="bg-emerald-600 rounded-2xl rounded-br-sm px-4 py-3 text-white text-sm leading-relaxed">
                    Hi Sarah, here&apos;s your quote form:
                    <span className="block mt-1 underline text-emerald-200">
                      quotzal.com/f/jane →
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 text-right mt-1">
                    Delivered
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 — right text, left visual */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-6 md:py-8">
              <div className="flex items-center justify-center lg:justify-start order-2 lg:order-1">
                {/* Mini mockup: partial form */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/80 p-6 max-w-sm w-full overflow-hidden">
                  <p className="text-xs font-bold text-gray-900 mb-4">
                    Personal Information
                  </p>
                  <div className="space-y-0">
                    {[
                      { label: "Full Name", value: "Sarah Johnson" },
                      { label: "Date of Birth", value: "03/15/1988" },
                      { label: "Driver\u2019s License #", value: "CA D1234567" },
                    ].map((field) => (
                      <div key={field.label} className="py-2.5 border-b border-gray-100 last:border-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                          {field.label}
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 mt-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i <= 2 ? "bg-emerald-600" : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center order-1 lg:order-2">
                <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">
                  Step 02
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-2">
                  Client fills it out
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Smart questions for auto, home, life, motorcycle, boat, RV.
                  VINs decoded automatically. Takes 3 minutes on a phone.
                </p>
              </div>
            </div>

            {/* Step 3 — left text, right visual */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-6 md:py-8">
              <div className="flex flex-col justify-center">
                <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest">
                  Step 03
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 mt-2">
                  You get everything
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  A structured email hits your inbox. Open your dashboard and
                  quote immediately. No follow-up needed.
                </p>
              </div>
              <div className="flex-1 flex items-center justify-center lg:justify-end">
                {/* Mini mockup: email notification */}
                <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-xl shadow-gray-200/80 overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">Q</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">
                        Quotzal
                      </p>
                      <p className="text-[10px] text-gray-400">
                        noreply@quotzal.com
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    New Auto Personal — Sarah Johnson
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Just submitted via your Quotzal form
                  </p>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs font-semibold text-emerald-800">
                      2 drivers · 1 vehicle · Full Coverage
                    </p>
                  </div>
                  <div className="bg-emerald-600 rounded-lg py-2 text-center">
                    <span className="text-xs text-white font-semibold">
                      View Full Details →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EMAIL MOCKUP — DARK SECTION ── */}
      <section className="bg-gray-950 py-16 md:py-20 -mt-px">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-400 mb-3">
              What lands in your inbox
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Every detail. Every time.
            </h2>
            <p className="text-lg text-gray-400 mt-4 max-w-xl mx-auto">
              Here&apos;s exactly what you receive after a client fills out an
              auto quote.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Email preview card */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 font-mono text-center">
                    noreply@quotzal.com
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-5">
                    <QuotzalLogo size="xs" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    New Auto Personal — Sarah Johnson
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Just submitted via your Quotzal form
                  </p>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5">
                    <p className="text-sm font-semibold text-emerald-800">
                      2 drivers · 1 vehicle — 2024 Toyota Camry · Full Coverage
                    </p>
                  </div>
                  {[
                    {
                      label: "CUSTOMER INFO",
                      rows: [
                        ["Name", "Sarah Johnson"],
                        ["Phone", "(555) 234-5678"],
                        ["Email", "sarah@email.com"],
                      ],
                    },
                    {
                      label: "DRIVER 1",
                      rows: [
                        ["License", "CA D1234567"],
                        ["Violations", "None in 5 years"],
                      ],
                    },
                    {
                      label: "VEHICLE",
                      rows: [
                        ["VIN decoded", "2024 Toyota Camry LE"],
                        ["Coverage", "Full Coverage"],
                      ],
                    },
                    {
                      label: "CURRENT INSURANCE",
                      rows: [
                        ["Carrier", "State Farm"],
                        ["Limits", "100/300/100"],
                        ["Expires", "June 15, 2026"],
                      ],
                    },
                  ].map((section) => (
                    <div key={section.label} className="mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        {section.label}
                      </p>
                      {section.rows.map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between py-1 border-b border-gray-50 last:border-0"
                        >
                          <span className="text-xs text-gray-400">{k}</span>
                          <span className="text-xs font-medium text-gray-900">
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="mt-5 bg-emerald-600 rounded-xl py-3 text-center">
                    <span className="text-sm text-white font-semibold">
                      View Full Details in Dashboard
                    </span>
                  </div>
                </div>
              </div>
              {/* Ambient glow behind email */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-emerald-600/15 blur-3xl pointer-events-none" />
            </div>

            {/* Benefits list */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 tracking-tight">
                You&apos;ll never have to
                <br />
                ask again.
              </h3>
              <div className="space-y-3">
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
                  <div key={item.title} className="flex gap-4">
                    <div className="w-9 h-9 rounded-full bg-emerald-900 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (asymmetric) ── */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 mb-10">
            What brokers say after their first week
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Featured testimonial — dark card */}
            <div className="lg:col-span-2 bg-emerald-950 rounded-2xl p-7 relative overflow-hidden">
              {/* Decorative quote mark */}
              <span
                className="absolute top-4 left-6 text-[8rem] leading-none font-serif text-emerald-800/30 select-none pointer-events-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <div className="relative z-10">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-amber-400 text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-lg md:text-xl text-white leading-relaxed mb-8">
                  &ldquo;I sent my first Quotzal link on a Monday. By Friday I
                  had three complete auto quotes ready — no follow-up calls, no
                  chasing. That&apos;s never happened before.&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">MT</span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">
                      Marcus T.
                    </p>
                    <p className="text-sm text-emerald-300/70">
                      Independent Auto Broker, Texas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Two smaller cards stacked */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {[
                {
                  quote:
                    "The VIN decode alone saves me 10 minutes per quote. My clients fill out the form on their phone in 3 minutes and I get everything I need.",
                  name: "Sandra R.",
                  role: "P&C Broker, Florida",
                  initials: "SR",
                  color: "bg-emerald-600",
                },
                {
                  quote:
                    "I was skeptical it would capture everything I needed. Then I got my first submission with drivers, violations, and current policy details all organized. Sold.",
                  name: "David K.",
                  role: "Life & Auto Broker, California",
                  initials: "DK",
                  color: "bg-emerald-800",
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm flex-1 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className="text-amber-400 text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-xs font-bold text-white">
                        {t.initials}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {t.name}
                      </p>
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
      <section id="pricing" className="py-16 md:py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-emerald-600 mb-3">
              Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Start free for 30 days. No credit card required.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
            {/* Starter */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$19</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="space-y-2 mb-8 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check /> 1 intake form link
                </li>
                <li className="flex items-start gap-2">
                  <Check /> All 8 insurance types
                </li>
                <li className="flex items-start gap-2">
                  <Check /> Dashboard &amp; email notifications
                </li>
                <li className="flex items-start gap-2">
                  <Check /> CSV export
                </li>
                <li className="flex items-start gap-2">
                  <Check /> 12-month data retention
                </li>
                <li className="flex items-start gap-2">
                  <Check /> Powered by Quotzal branding
                </li>
                <li className="flex items-start gap-2">
                  <Check /> 30-day free trial
                </li>
              </ul>
              <Link
                href="/signup?plan=starter"
                className="block w-full text-center py-3.5 bg-white border-2 border-gray-900 text-gray-900 font-semibold rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-200"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-emerald-50/30 border-2 border-emerald-600 rounded-2xl p-8 relative shadow-sm">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$39</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="space-y-2 mb-8 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check /> Everything in Starter
                </li>
                <li className="flex items-start gap-2">
                  <Check /> Unlimited link aliases
                </li>
                <li className="flex items-start gap-2">
                  <Check /> White label (your logo &amp; colors)
                </li>
                <li className="flex items-start gap-2">
                  <Check /> Renewal reminders
                </li>
                <li className="flex items-start gap-2">
                  <Check /> PDF export
                </li>
                <li className="flex items-start gap-2">
                  <Check /> 24-month data retention
                </li>
              </ul>
              <Link
                href="/signup?plan=pro"
                className="block w-full text-center py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-all duration-200"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Questions? Email us at{" "}
            <a
              href="mailto:hello@quotzal.com"
              className="text-emerald-600 hover:text-emerald-700"
            >
              hello@quotzal.com
            </a>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            {[
              { icon: "🔒", text: "SSL encrypted" },
              { icon: "💳", text: "Powered by Stripe" },
              { icon: "🚫", text: "Cancel anytime" },
            ].map((b) => (
              <div
                key={b.text}
                className="flex items-center gap-2 text-sm text-gray-400"
              >
                <span>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ (split-column) ── */}
      <section className="bg-white py-14 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left column — heading block */}
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Questions?
              </h2>
              <p className="text-lg text-gray-600 mb-6 max-w-xs">
                Everything you need to know before you sign up.
              </p>
              <a
                href="mailto:hello@quotzal.com"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                <Mail className="w-4 h-4" />
                Still have questions?
              </a>
            </div>

            {/* Right column — accordion */}
            <div className="lg:col-span-3">
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

      {/* ── FINAL CTA ── */}
      <section className="bg-emerald-600">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-lg md:text-xl font-bold text-white text-center md:text-left">
            Ready to stop chasing clients? Start your free trial today.
          </h2>
          <Link
            href="/signup"
            className="shrink-0 bg-white text-emerald-700 font-semibold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors duration-200 text-sm"
          >
            Start free trial →
          </Link>
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

function Check() {
  return (
    <svg
      className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-base font-medium text-gray-900">{question}</span>
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
        <div className="pb-4 text-sm text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}
