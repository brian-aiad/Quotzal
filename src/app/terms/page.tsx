import type { Metadata } from "next";
import Link from "next/link";
import { QuotzalLogo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Quotzal terms of service and usage agreement.",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-gray-400 mt-2 mb-16 border-b border-gray-100 pb-16">Last updated: March 24, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-600 leading-7">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Quotzal (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, do not use the Service. The Service is operated by Quotzal
              (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">2. Description of Service</h2>
            <p>
              Quotzal provides insurance brokers with digital intake forms to collect client information
              for insurance quoting purposes. The Service includes form creation, submission management,
              email notifications, and data export features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">3. Account Registration</h2>
            <p>
              You must provide accurate and complete information when creating an account. You are
              responsible for maintaining the security of your account credentials and for all activities
              that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">4. Subscription and Billing</h2>
            <p>
              The Service offers paid subscription plans billed monthly. Your subscription will
              automatically renew unless cancelled before the end of the billing period. You may cancel
              at any time from your dashboard. Refunds are not provided for partial billing periods.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">5. Data and Privacy</h2>
            <p>
              You are responsible for ensuring you have the right to collect and process the personal
              information submitted through your intake forms. You must comply with all applicable privacy
              laws and regulations. See our <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">Privacy Policy</Link> for
              details on how we handle data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">6. Acceptable Use</h2>
            <p>
              You may not use the Service for any unlawful purpose, to collect data without consent,
              to transmit malicious content, or to attempt to gain unauthorized access to the Service
              or its systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">7. Data Retention</h2>
            <p>
              Submission data is retained according to your plan&apos;s retention period (12 months for
              Starter, 24 months for Pro). After the retention period, data is permanently deleted.
              You may export your data at any time before deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">8. Limitation of Liability</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. We shall not be liable
              for any indirect, incidental, special, or consequential damages arising from your use
              of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account for violation of these terms.
              You may delete your account at any time from your dashboard settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">10. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the Service after changes
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-12 mb-4">Contact</h2>
            <p>
              For questions about these terms, contact us at support@quotzal.com.
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
