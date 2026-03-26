import type { Metadata } from "next";
import Link from "next/link";
import { QuotzalLogo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Quotzal privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/"><QuotzalLogo size="sm" /></Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">Log in</Link>
            <Link href="/signup" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 h-11 inline-flex items-center rounded-xl transition-colors">Sign Up Free</Link>
          </div>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mt-2 mb-16 border-b border-gray-100 pb-16">Last updated: March 24, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-600 leading-7">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">1. Information We Collect</h2>
            <p>
              <strong>Broker accounts:</strong> When you create an account, we collect your email address,
              brokerage name, phone number, and address.
            </p>
            <p>
              <strong>Form submissions:</strong> When a client fills out an intake form, we collect the
              information they provide, including name, contact details, date of birth, and insurance-specific
              details. This data is stored on behalf of the broker who owns the form.
            </p>
            <p>
              <strong>Payment information:</strong> Payment processing is handled by Stripe. We do not
              store credit card numbers or banking details on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Provide and maintain the Service</li>
              <li>Send email notifications about form submissions</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send account-related communications (trial reminders, billing alerts)</li>
              <li>Improve the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">3. Data Sharing</h2>
            <p>
              Form submission data is shared only with the broker whose intake form was used. We do not
              sell, rent, or share personal information with third parties for marketing purposes.
            </p>
            <p>We may share data with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Supabase:</strong> Database hosting and authentication</li>
              <li><strong>Stripe:</strong> Payment processing</li>
              <li><strong>Resend:</strong> Transactional email delivery</li>
              <li><strong>Vercel:</strong> Application hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">4. Data Security</h2>
            <p>
              All data is transmitted over HTTPS encryption. Our database uses row-level security
              to ensure brokers can only access their own data. We implement industry-standard
              security measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">5. Data Retention</h2>
            <p>
              Submission data is retained according to the broker&apos;s plan: 12 months for Starter plans
              and 24 months for Pro plans. After the retention period, data is automatically and
              permanently deleted. Brokers receive a 30-day warning before deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access your data at any time through the dashboard</li>
              <li>Export your data in CSV format</li>
              <li>Delete your account and all associated data</li>
              <li>Request correction of inaccurate information</li>
            </ul>
            <p className="mt-2">
              If you are a client who submitted information through an intake form and wish to
              have your data deleted, please contact the broker directly or email us at support@quotzal.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">7. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use
              tracking cookies or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">8. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify account holders
              of significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">Contact</h2>
            <p>
              For privacy-related questions, contact us at support@quotzal.com.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <QuotzalLogo size="sm" dark />
              <p className="text-sm mt-1">Insurance intake, simplified.</p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <Link href="/demo" className="text-gray-300 hover:text-white transition-colors">Demo</Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Log in</Link>
              <Link href="/signup" className="text-gray-300 hover:text-white transition-colors">Sign Up</Link>
              <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Quotzal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
