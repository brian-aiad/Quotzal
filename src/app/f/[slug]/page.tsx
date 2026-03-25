import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { IntakeForm } from './intake-form';
import { InactivePage } from './components/inactive-page';
import { ExpiredPage } from './components/expired-page';
import type { BrokerData, InsuranceType, FormConfig } from '@/lib/types/intake-form';
import { DEFAULT_FORM_CONFIG } from '@/lib/types/intake-form';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

interface BrokerRow {
  id: string;
  brokerage_name: string;
  slug: string;
  logo_url: string | null;
  brand_color: string | null;
  plan: string;
  status: string;
  insurance_types_enabled: string[];
  form_config: FormConfig | null;
  email: string;
  phone: string | null;
}

interface BrokerLinkRow {
  id: string;
  broker_id: string;
  slug: string;
  is_active: boolean;
  brokers: BrokerRow;
}

interface DemoRequestRow {
  id: string;
  demo_slug: string;
  expires_at: string;
  converted: boolean;
}

export default async function IntakeFormPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";
  const supabase = createAdminClient();

  // 1. Try broker_links first
  const { data: linkData } = await supabase
    .from('broker_links')
    .select('id, broker_id, slug, is_active, brokers(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single<BrokerLinkRow>();

  let broker: BrokerRow | null = null;
  let linkId: string | null = null;

  if (linkData) {
    broker = linkData.brokers;
    linkId = linkData.id;
  } else {
    // 2. Try broker primary slug
    const { data: brokerData } = await supabase
      .from('brokers')
      .select('*')
      .eq('slug', slug)
      .single<BrokerRow>();

    if (brokerData) {
      broker = brokerData;
      // Get the primary link for this broker
      const { data: primaryLink } = await supabase
        .from('broker_links')
        .select('id')
        .eq('broker_id', brokerData.id)
        .eq('is_primary', true)
        .eq('is_active', true)
        .single<{ id: string }>();

      linkId = primaryLink?.id ?? null;
    }
  }

  // Not found
  if (!broker || !linkId) {
    notFound();
  }

  // Check if cancelled or suspended
  if (broker.status === 'cancelled' || broker.status === 'suspended') {
    return <InactivePage />;
  }

  // Check demo link expiration
  const { data: demoRequest } = await supabase
    .from('demo_requests')
    .select('id, demo_slug, expires_at, converted')
    .eq('demo_slug', slug)
    .single<DemoRequestRow>();

  if (demoRequest && !demoRequest.converted) {
    const expiresAt = new Date(demoRequest.expires_at);
    if (expiresAt < new Date()) {
      return <ExpiredPage />;
    }
  }

  // Active broker — build branding
  const isPro =
    broker.plan === 'pro' &&
    ['active', 'trialing', 'past_due'].includes(broker.status);

  const brokerData: BrokerData = {
    id: broker.id,
    brokerageName: broker.brokerage_name,
    slug: broker.slug,
    logoUrl: isPro ? broker.logo_url : null,
    brandColor: isPro ? broker.brand_color : null,
    plan: broker.plan as 'starter' | 'pro',
    status: broker.status,
    insuranceTypesEnabled: broker.insurance_types_enabled as InsuranceType[],
    linkId,
    formConfig: (broker.form_config as FormConfig) ?? DEFAULT_FORM_CONFIG,
    email: broker.email,
    phone: broker.phone,
  };

  return <IntakeForm broker={brokerData} preview={isPreview} />;
}
