import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Sidebar } from './components/sidebar';
import { AdminBanner } from './components/admin-banner';
import type { BrokerProfile } from '@/lib/types/dashboard';

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
      .select('id, email, brokerage_name, slug, logo_url, brand_color, phone, address, plan, status, insurance_types_enabled, stripe_customer_id, stripe_subscription_id, created_at')
      .eq('id', impersonatingId)
      .single<BrokerProfile>();
    broker = data;
    isImpersonating = true;
  } else {
    const { data } = await supabase
      .from('brokers')
      .select('id, email, brokerage_name, slug, logo_url, brand_color, phone, address, plan, status, insurance_types_enabled, stripe_customer_id, stripe_subscription_id, created_at')
      .eq('id', user.id)
      .single<BrokerProfile>();
    broker = data;
  }

  if (!broker) {
    redirect('/onboarding');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar brokerName={broker.brokerage_name} brokerEmail={broker.email} />
      <main className="flex-1 md:ml-0 mt-14 md:mt-0">
        {isImpersonating && (
          <AdminBanner brokerName={broker.brokerage_name} />
        )}
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
