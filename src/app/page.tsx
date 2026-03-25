"use client";

import { useState } from "react";
import Link from "next/link";
import { QuotzalLogo } from "@/components/ui/logo";

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link href="/"><QuotzalLogo size="md" dark /></Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors duration-150"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="main-content" className="bg-gray-950 py-20 md:py-28 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left column */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                Built for independent insurance brokers
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              Stop chasing<br className="hidden sm:block" />
              clients for<br className="hidden sm:block" />
              <span className="text-emerald-400">information.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10">
              Send one link. Get a complete, quote-ready intake form back in minutes — organized, structured, and ready to quote.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link
                href="/demo"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all duration-200 text-center shadow-lg shadow-emerald-900/30"
              >
                Get your free demo link →
              </Link>
              <a
                href="#pricing"
                className="bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all duration-200 text-center"
              >
                See pricing
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 justify-center lg:justify-start">
              <span>✓ No credit card required</span>
              <span>✓ 30-day free trial</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>

          {/* Right column — Phone mockup */}
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-110" />
              <div className="relative w-72 bg-gray-800 rounded-[2.5rem] border-4 border-gray-700 shadow-2xl p-2">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] font-medium text-gray-500 font-mono">quotzal.com/f/your-link</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="p-4 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                        <span className="text-[8px] text-white font-bold">J</span>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-900">Jane&apos;s Insurance</span>
                    </div>
                    <div className="flex gap-1 mb-3">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full ${i === 1 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className="text-[11px] font-semibold text-gray-900 mb-0.5">What type of insurance?</p>
                    <p className="text-[9px] text-gray-400 mb-3">Select one to get started</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { emoji: "🚗", label: "Auto — Personal", active: true },
                        { emoji: "🏠", label: "Home / Renters", active: false },
                        { emoji: "❤️", label: "Life Insurance", active: false },
                        { emoji: "🏍️", label: "Motorcycle", active: false },
                      ].map((item) => (
                        <div key={item.label}
                          className={`rounded-lg p-2 text-center border ${
                            item.active ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="text-sm mb-0.5">{item.emoji}</div>
                          <div className="text-[8px] font-medium text-gray-700 leading-tight">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 bg-emerald-600 rounded-lg py-2 text-center">
                      <span className="text-[10px] text-white font-semibold">Next →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof — aspirational placeholders, replace with real numbers before launch */}
      <div className="bg-gray-900 border-y border-white/5 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-600 mb-6">
            Trusted by independent brokers across the US
          </p>
          <div className="flex items-center justify-center gap-12 md:gap-20">
            {[
              { number: "500+", label: "active brokers" },
              { number: "12,000+", label: "quotes collected" },
              { number: "4.9★", label: "average rating" },
            ].map(stat => (
              <div key={stat.number} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white leading-none mb-1">{stat.number}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pain Section */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-4">Sound familiar?</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            You&apos;re losing time<br />every single week.
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-16">
            The average independent broker spends 3–5 hours per week chasing clients for the same information — back-and-forth texts, repeated calls, incomplete emails.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { icon: "📱", pain: "\"What's the VIN on that car?\"", desc: "You asked three times. Still waiting." },
              { icon: "📋", pain: "\"Can you resend your license number?\"", desc: "The client sent a photo. You can't read it." },
              { icon: "⏰", pain: "\"I'll get you the policy expiry date tomorrow\"", desc: "That was last Tuesday. Still no quote." },
            ].map(item => (
              <div key={item.pain} className="bg-red-50 border border-red-100 rounded-2xl p-6">
                <div className="text-2xl mb-3">{item.icon}</div>
                <p className="text-base font-semibold text-gray-900 mb-2 italic">{item.pain}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-12">
            <div className="flex-1 h-px bg-gray-100" />
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700">Quotzal fixes this in 2 minutes</span>
            </div>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4 tracking-tight">
            How Quotzal Works
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-xl mx-auto">
            Three steps. That&apos;s it.
          </p>
          <div className="relative flex flex-col md:flex-row items-start justify-between max-w-3xl mx-auto gap-12 md:gap-0">
            <div className="hidden md:block absolute"
              style={{
                top: '28px',
                left: 'calc(16.67% + 28px)',
                right: 'calc(16.67% + 28px)',
                height: '1px',
                background: 'linear-gradient(90deg, #d1fae5, #6ee7b7, #d1fae5)',
              }}
            />
            {[
              { n: 1, title: "Send your link", desc: "Text, email, or add it to your website. One link, every client, every insurance type." },
              { n: 2, title: "Client fills it out", desc: "Smart questions for auto, home, life, motorcycle, boat, RV. VINs decoded automatically." },
              { n: 3, title: "You get everything", desc: "A structured email hits your inbox. Open your dashboard and quote immediately." },
            ].map(step => (
              <div key={step.n} className="flex flex-col items-center text-center flex-1 px-4 md:px-6 relative z-10">
                <div className="mb-5 relative">
                  <div className="w-14 h-14 rounded-full bg-white absolute inset-0 scale-[1.2]" />
                  <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center relative shadow-lg shadow-emerald-200">
                    <span className="text-xl font-bold text-white">{step.n}</span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="bg-gray-50 py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">What lands in your inbox</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Every detail. Every time.
            </h2>
            <p className="text-lg text-gray-500 mt-4 max-w-xl mx-auto">
              Here&apos;s exactly what you receive after a client fills out an auto quote.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Email preview card */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
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
                <div className="mb-5"><QuotzalLogo size="xs" /></div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">New Auto Personal — Sarah Johnson</h3>
                <p className="text-sm text-gray-400 mb-4">Just submitted via your Quotzal form</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5">
                  <p className="text-sm font-semibold text-emerald-800">2 drivers · 1 vehicle — 2024 Toyota Camry · Full Coverage</p>
                </div>
                {[
                  { label: "CUSTOMER INFO", rows: [["Name", "Sarah Johnson"], ["Phone", "(555) 234-5678"], ["Email", "sarah@email.com"]] },
                  { label: "DRIVER 1", rows: [["License", "CA D1234567"], ["Violations", "None in 5 years"]] },
                  { label: "VEHICLE", rows: [["VIN decoded", "2024 Toyota Camry LE"], ["Coverage", "Full Coverage"]] },
                  { label: "CURRENT INSURANCE", rows: [["Carrier", "State Farm"], ["Limits", "100/300/100"], ["Expires", "June 15, 2026"]] },
                ].map(section => (
                  <div key={section.label} className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{section.label}</p>
                    {section.rows.map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1 border-b border-gray-50 last:border-0">
                        <span className="text-xs text-gray-400">{k}</span>
                        <span className="text-xs font-medium text-gray-900">{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
                <div className="mt-5 bg-emerald-600 rounded-xl py-3 text-center">
                  <span className="text-sm text-white font-semibold">View Full Details in Dashboard</span>
                </div>
              </div>
            </div>
            {/* Benefits */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 tracking-tight">
                You&apos;ll never have to<br />ask again.
              </h3>
              <div className="space-y-5">
                {[
                  { title: "VIN decoded automatically", desc: "Year, Make, Model, and Trim filled in before you open the email." },
                  { title: "Every driver captured", desc: "Names, license numbers, states, relationships, and SR-22 flags." },
                  { title: "Violations logged precisely", desc: "Type, exact date, and description — not just 'had a ticket once.'" },
                  { title: "Current insurance documented", desc: "Carrier, limits, and exact policy expiry date — ready to compare." },
                  { title: "All 8 insurance types", desc: "Auto, home, life, motorcycle, boat, RV — one tool for everything." },
                  { title: "Searchable dashboard", desc: "Every submission stored, searchable, filterable, and exportable as CSV." },
                ].map(item => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-14 md:py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-12">
            What brokers say after their first week
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "I sent my first Quotzal link on a Monday. By Friday I had three complete auto quotes ready — no follow-up calls, no chasing. That's never happened before.",
                name: "Marcus T.",
                role: "Independent Auto Broker, Texas",
                initials: "MT",
                color: "bg-blue-600",
              },
              {
                quote: "The VIN decode alone saves me 10 minutes per quote. My clients fill out the form on their phone in 3 minutes and I get everything I need.",
                name: "Sandra R.",
                role: "P&C Broker, Florida",
                initials: "SR",
                color: "bg-emerald-600",
              },
              {
                quote: "I was skeptical it would capture everything I needed. Then I got my first submission with drivers, violations, and current policy details all organized. Sold.",
                name: "David K.",
                role: "Life & Auto Broker, California",
                initials: "DK",
                color: "bg-purple-600",
              },
            ].map(t => (
              <div key={t.name} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center shrink-0`}>
                    <span className="text-xs font-bold text-white">{t.initials}</span>
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
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            Start free for 30 days. No credit card required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$19</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-slate-600">
                <li className="flex items-start gap-2"><Check /> 1 intake form link</li>
                <li className="flex items-start gap-2"><Check /> All 8 insurance types</li>
                <li className="flex items-start gap-2"><Check /> Dashboard &amp; email notifications</li>
                <li className="flex items-start gap-2"><Check /> CSV export</li>
                <li className="flex items-start gap-2"><Check /> 12-month data retention</li>
                <li className="flex items-start gap-2"><Check /> Powered by Quotzal branding</li>
                <li className="flex items-start gap-2"><Check /> 30-day free trial</li>
              </ul>
              <Link
                href="/signup?plan=starter"
                className="block w-full text-center py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors duration-150"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-emerald-50/30 border-2 border-emerald-600 rounded-2xl p-8 relative shadow-sm">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$39</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-slate-600">
                <li className="flex items-start gap-2"><Check /> Everything in Starter</li>
                <li className="flex items-start gap-2"><Check /> Unlimited link aliases</li>
                <li className="flex items-start gap-2"><Check /> White label (your logo &amp; colors)</li>
                <li className="flex items-start gap-2"><Check /> Renewal reminders</li>
                <li className="flex items-start gap-2"><Check /> PDF export</li>
                <li className="flex items-start gap-2"><Check /> 24-month data retention</li>
              </ul>
              <Link
                href="/signup?plan=pro"
                className="block w-full text-center py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors duration-150"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
          <p className="text-center text-sm text-slate-500 mt-8">
            Questions? Email us at{' '}
            <a href="mailto:hello@quotzal.com" className="text-emerald-600 hover:text-emerald-700">hello@quotzal.com</a>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {[
              { icon: "🔒", text: "SSL encrypted" },
              { icon: "💳", text: "Powered by Stripe" },
              { icon: "🚫", text: "Cancel anytime" },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-2 text-sm text-gray-400">
                <span>{b.icon}</span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
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
      </section>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <QuotzalLogo size="sm" dark />
              <p className="text-sm mt-1">Insurance intake, simplified.</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link href="/demo" className="text-slate-300 hover:text-white transition-colors">Demo</Link>
              <Link href="/login" className="text-slate-300 hover:text-white transition-colors">Log in</Link>
              <Link href="/signup" className="text-slate-300 hover:text-white transition-colors">Sign Up</Link>
              <Link href="/terms" className="text-slate-300 hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-8 border-t border-white/5 text-xs text-gray-600">
            <span>🔒 SSL secured</span>
            <span>🏦 Stripe payments</span>
            <span>📧 Email via Resend</span>
            <span>🗄️ Hosted on Vercel</span>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>&copy; {new Date().getFullYear()} Quotzal. All rights reserved.</span>
            <a href="mailto:hello@quotzal.com" className="text-slate-400 hover:text-white transition-colors">hello@quotzal.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Check() {
  return (
    <svg className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-base font-medium text-slate-900">{question}</span>
        <svg
          className={`w-5 h-5 text-emerald-600 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}
