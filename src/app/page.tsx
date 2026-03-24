"use client";

import { useState } from "react";
import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="bg-[#0f172a] border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-white">Quotzal</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#0f172a] text-white py-20 sm:py-28">
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
              className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors text-base"
            >
              Get your free demo link
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-8 py-3 border border-slate-600 text-slate-200 font-semibold rounded-lg hover:bg-slate-800 transition-colors text-base"
            >
              See pricing
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Three steps. That&apos;s it.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Here&apos;s what lands in your inbox
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-xl mx-auto">
            Every submission is organized into clear sections with all the details you need.
          </p>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden max-w-lg mx-auto">
            <div className="px-6 py-4 border-b border-gray-100">
              <span className="text-base font-bold text-gray-900">Quotzal</span>
            </div>
            <div className="px-6 py-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">New Auto Personal</h3>
              <p className="text-sm text-gray-500">Sarah Johnson</p>
              <div className="bg-blue-50 rounded-lg px-4 py-3">
                <p className="text-sm text-blue-800 font-medium">
                  2 drivers, 1 vehicle — 2024 Toyota Camry, Full Coverage
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Customer Info</p>
                <p className="text-sm text-gray-700"><span className="text-gray-500">Name:</span> Sarah Johnson</p>
                <p className="text-sm text-gray-700"><span className="text-gray-500">Email:</span> sarah@email.com</p>
                <p className="text-sm text-gray-700"><span className="text-gray-500">Phone:</span> (555) 234-5678</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Current Insurance</p>
                <p className="text-sm text-gray-700"><span className="text-gray-500">Carrier:</span> State Farm</p>
                <p className="text-sm text-gray-700"><span className="text-gray-500">Expires:</span> June 15, 2026</p>
              </div>
              <div className="pt-2">
                <span className="inline-block px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg">
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
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Start free for 30 days. No credit card required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Starter */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$19</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
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
                className="block w-full text-center py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white border-2 border-blue-600 rounded-2xl p-8 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$39</span>
                <span className="text-gray-500">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600">
                <li className="flex items-start gap-2"><Check /> Everything in Starter</li>
                <li className="flex items-start gap-2"><Check /> Unlimited link aliases</li>
                <li className="flex items-start gap-2"><Check /> White label (your logo &amp; colors)</li>
                <li className="flex items-start gap-2"><Check /> Renewal reminders</li>
                <li className="flex items-start gap-2"><Check /> PDF export</li>
                <li className="flex items-start gap-2"><Check /> 24-month data retention</li>
              </ul>
              <Link
                href="/signup?plan=pro"
                className="block w-full text-center py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
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
              <span className="text-lg font-bold text-white">Quotzal</span>
              <p className="text-sm mt-1">Insurance intake, simplified.</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link href="/demo" className="hover:text-white transition-colors">Demo</Link>
              <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Quotzal. All rights reserved.
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
      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Check() {
  return (
    <svg className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-gray-900">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}
