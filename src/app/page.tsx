"use client";

import { useState } from "react";
import Link from "next/link";
import { QuotzalLogo } from "@/components/ui/logo";

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="bg-[#0f172a] border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
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
      <section id="main-content" className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
            Send a link.
            <br />
            Get everything you need.
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Insurance brokers: stop chasing clients for info. One link collects all the details you need to quote — organized, instant, professional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors duration-150 text-lg focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Get your free demo link
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-8 py-4 border border-slate-500 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 transition-colors duration-150 text-lg"
            >
              See pricing
            </a>
          </div>
          {/* Trust signals */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center mt-8 text-sm text-slate-400">
            <span>✓ No credit card required</span>
            <span>✓ 30-day free trial</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Social Proof — aspirational placeholders, replace with real numbers before launch */}
      <section className="py-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-slate-500 mb-4">Trusted by independent insurance brokers across the US</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full">500+ brokers</span>
            <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full">12,000+ quotes collected</span>
            <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full">4.9★ rating</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            How It Works
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            Three steps. That&apos;s it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-7 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-0.5 bg-emerald-200" />
            <StepCard
              number={1}
              title="Send your link"
              description="Text, email, or embed your unique Quotzal link. Clients click and see a clean, professional form."
            />
            <StepCard
              number={2}
              title="Client fills the form"
              description="Smart intake forms ask the right questions for each insurance type — auto, home, life, and more."
            />
            <StepCard
              number={3}
              title="You get an organized email"
              description="Every detail lands in your inbox and dashboard, formatted and ready to quote. No chasing required."
            />
          </div>
        </div>
      </section>

      {/* Sample Email Preview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Here&apos;s what lands in your inbox
          </h2>
          <p className="text-slate-500 text-center mb-10 max-w-xl mx-auto">
            Every submission is organized into clear sections with all the details you need.
          </p>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden max-w-lg mx-auto border-l-4 border-l-emerald-500">
            <div className="px-6 py-4 border-b border-slate-100">
              <QuotzalLogo size="xs" />
            </div>
            <div className="px-6 py-6 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">New Auto Personal</h3>
              <p className="text-sm text-slate-500">Sarah Johnson</p>
              <div className="bg-emerald-50 rounded-lg px-4 py-3">
                <p className="text-sm text-emerald-800 font-medium">
                  2 drivers, 1 vehicle — 2024 Toyota Camry, Full Coverage
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Customer Info</p>
                <p className="text-sm text-slate-700"><span className="text-slate-500">Name:</span> Sarah Johnson</p>
                <p className="text-sm text-slate-700"><span className="text-slate-500">Email:</span> sarah@email.com</p>
                <p className="text-sm text-slate-700"><span className="text-slate-500">Phone:</span> (555) 234-5678</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Current Insurance</p>
                <p className="text-sm text-slate-700"><span className="text-slate-500">Carrier:</span> State Farm</p>
                <p className="text-sm text-slate-700"><span className="text-slate-500">Expires:</span> June 15, 2026</p>
              </div>
              <div className="pt-2">
                <span className="inline-block px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg">
                  View Full Details
                </span>
              </div>
            </div>
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
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50">
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
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>&copy; {new Date().getFullYear()} Quotzal. All rights reserved.</span>
            <a href="mailto:hello@quotzal.com" className="text-slate-400 hover:text-white transition-colors">hello@quotzal.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
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
