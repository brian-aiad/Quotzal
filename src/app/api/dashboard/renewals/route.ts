import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface FormDataCurrentInsurance {
  expiry_date?: string;
}

interface FormDataShape {
  current_insurance?: FormDataCurrentInsurance;
}

interface RenewalRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  insurance_type: string;
  current_carrier: string | null;
  policy_expiry: string | null;
  form_data: FormDataShape;
  status: string;
}

interface RenewalItem {
  id: string;
  clientName: string;
  email: string;
  phone: string | null;
  insuranceType: string;
  carrier: string | null;
  expiryDate: string;
  daysUntilExpiry: number;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  // Check broker plan
  const { data: broker } = await supabase
    .from('brokers')
    .select('plan')
    .eq('id', user.id)
    .single<{ plan: string }>();

  if (!broker) {
    return NextResponse.json(
      { success: false, error: 'Broker not found', code: 'BROKER_NOT_FOUND' },
      { status: 404 }
    );
  }

  if (broker.plan !== 'pro') {
    return NextResponse.json(
      { success: true, data: { renewals: [], counts: { next30: 0, next60: 0, next90: 0 }, plan: broker.plan } }
    );
  }

  // Fetch all non-archived submissions that might have expiry data
  const { data, error } = await supabase
    .from('submissions')
    .select('id, first_name, last_name, email, phone, insurance_type, current_carrier, policy_expiry, form_data, status')
    .neq('status', 'archived')
    .eq('broker_id', user.id);

  if (error) {
    console.error('dashboard/renewals GET error:', error);
    return NextResponse.json(
      { success: false, error: 'An internal error occurred', code: 'FETCH_FAILED' },
      { status: 500 }
    );
  }

  const rows = (data ?? []) as RenewalRow[];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const ninetyDaysFromNow = new Date(now);
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

  const renewals: RenewalItem[] = [];

  for (const row of rows) {
    // Try policy_expiry column first, then form_data.current_insurance.expiry_date
    const expiryStr =
      row.policy_expiry ??
      row.form_data?.current_insurance?.expiry_date ??
      null;

    if (!expiryStr) continue;

    const expiryDate = new Date(`${expiryStr.slice(0, 10)}T00:00:00`);
    if (isNaN(expiryDate.getTime())) continue;

    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate >= now && expiryDate <= ninetyDaysFromNow) {
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      renewals.push({
        id: row.id,
        clientName: `${row.first_name} ${row.last_name}`.trim(),
        email: row.email,
        phone: row.phone,
        insuranceType: row.insurance_type,
        carrier: row.current_carrier,
        expiryDate: expiryStr,
        daysUntilExpiry,
      });
    }
  }

  // Sort by expiry date ascending (soonest first)
  renewals.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  const counts = {
    next30: renewals.filter((r) => r.daysUntilExpiry <= 30).length,
    next60: renewals.filter((r) => r.daysUntilExpiry > 30 && r.daysUntilExpiry <= 60).length,
    next90: renewals.filter((r) => r.daysUntilExpiry > 60 && r.daysUntilExpiry <= 90).length,
  };

  return NextResponse.json({
    success: true,
    data: { renewals, counts, plan: broker.plan },
  });
}
