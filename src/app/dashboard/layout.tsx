import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from './components/sidebar';
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

  const { data: broker } = await supabase
    .from('brokers')
    .select('id, email, brokerage_name, slug, logo_url, brand_color, phone, plan, status, insurance_types_enabled, created_at')
    .eq('id', user.id)
    .single<BrokerProfile>();

  if (!broker) {
    redirect('/onboarding');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar brokerName={broker.brokerage_name} brokerEmail={broker.email} />
      <main className="flex-1 md:ml-0 mt-14 md:mt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
