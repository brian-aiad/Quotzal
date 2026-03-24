import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Quotzal privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 mb-8 block">
          ← Back to home
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 24, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Data Sharing</h2>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Data Security</h2>
            <p>
              All data is transmitted over HTTPS encryption. Our database uses row-level security
              to ensure brokers can only access their own data. We implement industry-standard
              security measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <p>
              Submission data is retained according to the broker&apos;s plan: 12 months for Starter plans
              and 24 months for Pro plans. After the retention period, data is automatically and
              permanently deleted. Brokers receive a 30-day warning before deletion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your Rights</h2>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use
              tracking cookies or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify account holders
              of significant changes via email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
            <p>
              For privacy-related questions, contact us at support@quotzal.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
