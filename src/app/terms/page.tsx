import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Quotzal terms of service and usage agreement.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link href="/" className="text-sm text-emerald-600 hover:text-emerald-700 mb-8 block">
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: March 24, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Quotzal (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, do not use the Service. The Service is operated by Quotzal
              (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">2. Description of Service</h2>
            <p>
              Quotzal provides insurance brokers with digital intake forms to collect client information
              for insurance quoting purposes. The Service includes form creation, submission management,
              email notifications, and data export features.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">3. Account Registration</h2>
            <p>
              You must provide accurate and complete information when creating an account. You are
              responsible for maintaining the security of your account credentials and for all activities
              that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">4. Subscription and Billing</h2>
            <p>
              The Service offers paid subscription plans billed monthly. Your subscription will
              automatically renew unless cancelled before the end of the billing period. You may cancel
              at any time from your dashboard. Refunds are not provided for partial billing periods.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">5. Data and Privacy</h2>
            <p>
              You are responsible for ensuring you have the right to collect and process the personal
              information submitted through your intake forms. You must comply with all applicable privacy
              laws and regulations. See our <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700">Privacy Policy</Link> for
              details on how we handle data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">6. Acceptable Use</h2>
            <p>
              You may not use the Service for any unlawful purpose, to collect data without consent,
              to transmit malicious content, or to attempt to gain unauthorized access to the Service
              or its systems.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">7. Data Retention</h2>
            <p>
              Submission data is retained according to your plan&apos;s retention period (12 months for
              Starter, 24 months for Pro). After the retention period, data is permanently deleted.
              You may export your data at any time before deletion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">8. Limitation of Liability</h2>
            <p>
              The Service is provided &quot;as is&quot; without warranties of any kind. We shall not be liable
              for any indirect, incidental, special, or consequential damages arising from your use
              of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account for violation of these terms.
              You may delete your account at any time from your dashboard settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">10. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the Service after changes
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Contact</h2>
            <p>
              For questions about these terms, contact us at support@quotzal.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
