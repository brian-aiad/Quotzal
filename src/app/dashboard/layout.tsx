import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Sidebar } from './components/sidebar';
import { AdminBanner } from './components/admin-banner';
import type { BrokerProfile } from '@/lib/types/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your Quotzal intake forms, submissions, and settings',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check for admin impersonation
  const cookieStore = await cookies();
  const impersonatingId = cookieStore.get('admin_impersonating_broker_id')?.value;
  let isImpersonating = false;
  let broker: BrokerProfile | null = null;

  if (impersonatingId && user.email === process.env.ADMIN_EMAIL) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('brokers')
      .select('id, email, brokerage_name, slug, logo_url, brand_color, phone, address, plan, status, insurance_types_enabled, stripe_customer_id, stripe_subscription_id, trial_ends_at, created_at')
      .eq('id', impersonatingId)
      .single<BrokerProfile>();
    broker = data;
    isImpersonating = true;
  } else {
    const { data } = await supabase
      .from('brokers')
      .select('id, email, brokerage_name, slug, logo_url, brand_color, phone, address, plan, status, insurance_types_enabled, stripe_customer_id, stripe_subscription_id, trial_ends_at, created_at')
      .eq('id', user.id)
      .single<BrokerProfile>();
    broker = data;
  }

  if (!broker) {
    redirect('/onboarding');
  }

  // Trial expiry paywall
  const isTrialExpired =
    broker.status === 'trialing' &&
    broker.trial_ends_at !== null &&
    new Date(broker.trial_ends_at) < new Date() &&
    !broker.stripe_subscription_id;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar brokerName={broker.brokerage_name} brokerEmail={broker.email} />
      <main id="main-content" className="flex-1 md:ml-0 mt-14 md:mt-0 relative">
        {isImpersonating && (
          <AdminBanner brokerName={broker.brokerage_name} />
        )}
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>

        {/* Trial expired paywall overlay */}
        {isTrialExpired && (
          <div className="absolute inset-0 z-40 bg-white/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Free Trial Has Ended</h2>
              <p className="text-slate-600 mb-8">Subscribe to continue accessing your dashboard and leads.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <div className="border border-slate-200 rounded-xl p-6 bg-white text-left">
                  <h3 className="font-bold text-slate-900 mb-1">Starter</h3>
                  <p className="text-2xl font-bold text-slate-900 mb-3">$19<span className="text-sm font-normal text-slate-500">/mo</span></p>
                  <ul className="text-xs text-slate-600 space-y-1.5 mb-4">
                    <li>Unlimited leads</li>
                    <li>Email alerts</li>
                    <li>Dashboard &amp; CSV export</li>
                  </ul>
                  <form action="/api/create-checkout-session" method="POST">
                    <input type="hidden" name="plan" value="starter" />
                    <button type="submit" className="w-full py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm transition-colors">Subscribe</button>
                  </form>
                </div>
                <div className="border-2 border-emerald-600 rounded-xl p-6 bg-white text-left relative">
                  <span className="absolute -top-2.5 left-4 text-[10px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full">RECOMMENDED</span>
                  <h3 className="font-bold text-slate-900 mb-1">Pro</h3>
                  <p className="text-2xl font-bold text-slate-900 mb-3">$39<span className="text-sm font-normal text-slate-500">/mo</span></p>
                  <ul className="text-xs text-slate-600 space-y-1.5 mb-4">
                    <li>Everything in Starter</li>
                    <li>Custom branding</li>
                    <li>Link aliases &amp; SMS alerts</li>
                  </ul>
                  <form action="/api/create-checkout-session" method="POST">
                    <input type="hidden" name="plan" value="pro" />
                    <button type="submit" className="w-full py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 text-sm transition-colors">Subscribe</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
