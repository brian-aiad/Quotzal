import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { IntakeForm } from './intake-form';
import { InactivePage } from './components/inactive-page';
import { ExpiredPage } from './components/expired-page';
import type { BrokerData, InsuranceType, FormConfig } from '@/lib/types/intake-form';
import { mergeFormConfig } from '@/lib/types/intake-form';
import { mergeExtendedFormConfig } from '@/lib/types/form-config';
import type { ExtendedFormConfig } from '@/lib/types/form-config';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: link } = await supabase
    .from('broker_links')
    .select('broker_id')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  let brokerName: string | null = null;
  if (link?.broker_id) {
    const { data: broker } = await supabase
      .from('brokers')
      .select('brokerage_name')
      .eq('id', link.broker_id)
      .single();
    brokerName = broker?.brokerage_name ?? null;
  } else {
    // Check demo_requests for metadata
    const { data: demo } = await supabase
      .from('demo_requests')
      .select('brokerage_name')
      .eq('demo_slug', slug)
      .maybeSingle();
    if (demo) brokerName = demo.brokerage_name;
  }

  return {
    title: brokerName ? `${brokerName} — Insurance Quote Form` : 'Insurance Quote Form',
    description: brokerName
      ? `Request an insurance quote from ${brokerName}. Quick, secure, and easy.`
      : 'Request an insurance quote. Quick, secure, and easy.',
  };
}

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

  // 3. Try demo_requests if no broker found
  if (!broker || !linkId) {
    const { data: demoRequest } = await supabase
      .from('demo_requests')
      .select('id, demo_slug, expires_at, converted, brokerage_name')
      .eq('demo_slug', slug)
      .single<DemoRequestRow & { brokerage_name: string }>();

    if (demoRequest) {
      if (demoRequest.converted) {
        return <ExpiredPage />;
      }
      const expiresAt = new Date(demoRequest.expires_at);
      if (expiresAt < new Date()) {
        return <ExpiredPage />;
      }

      // Render demo form with generic Quotzal branding
      const demoTypes: InsuranceType[] = [
        'auto_personal', 'auto_commercial', 'home', 'life',
        'motorcycle', 'boat', 'rv', 'other',
      ];
      const demoBrokerData: BrokerData = {
        id: 'demo',
        brokerageName: demoRequest.brokerage_name || 'Demo Broker',
        slug,
        logoUrl: null,
        brandColor: null,
        plan: 'starter',
        status: 'trialing',
        insuranceTypesEnabled: demoTypes,
        linkId: demoRequest.id,
        formConfig: mergeFormConfig(null),
        extendedFormConfig: mergeExtendedFormConfig(null),
        email: 'demo@quotzal.com',
        phone: null,
      };
      return <IntakeForm broker={demoBrokerData} preview />;
    }

    notFound();
  }

  // Check if cancelled or suspended
  if (broker.status === 'cancelled' || broker.status === 'suspended') {
    return <InactivePage />;
  }

  // Check demo link expiration for real broker links that also have demo entries
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

  const rawConfig = broker.form_config;
  const extendedFormConfig = mergeExtendedFormConfig(rawConfig as Partial<ExtendedFormConfig> | null);

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
    formConfig: mergeFormConfig(rawConfig as Partial<FormConfig> | null),
    extendedFormConfig,
    email: broker.email,
    phone: broker.phone,
  };

  return <IntakeForm broker={brokerData} preview={isPreview} />;
}
