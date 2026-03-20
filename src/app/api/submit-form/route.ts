import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SubmitFormBody {
  brokerId: string;
  linkId: string;
  insuranceType: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    email: string;
  };
  typeSpecificData: Record<string, unknown>;
  currentInsurance: {
    hasCurrentInsurance: boolean;
    currentCarrier?: string;
    currentCoverageLimits?: string;
    policyExpiryDate?: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitFormBody;
    const {
      brokerId,
      linkId,
      insuranceType,
      personalInfo,
      typeSpecificData,
      currentInsurance,
    } = body;

    // Validate required fields
    if (
      !brokerId ||
      !linkId ||
      !insuranceType ||
      !personalInfo.firstName ||
      !personalInfo.lastName ||
      !personalInfo.email
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Look up broker for email
    const { data: broker } = await supabase
      .from('brokers')
      .select('email, brokerage_name')
      .eq('id', brokerId)
      .single<{ email: string; brokerage_name: string }>();

    if (!broker) {
      return NextResponse.json(
        { error: 'Broker not found' },
        { status: 404 }
      );
    }

    // Save submission
    const { error: insertError } = await supabase.from('submissions').insert({
      broker_id: brokerId,
      link_id: linkId,
      insurance_type: insuranceType,
      first_name: personalInfo.firstName,
      last_name: personalInfo.lastName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      date_of_birth: personalInfo.dateOfBirth || null,
      has_current_insurance: currentInsurance.hasCurrentInsurance,
      current_carrier: currentInsurance.currentCarrier || null,
      current_limits: currentInsurance.currentCoverageLimits || null,
      policy_expiry: currentInsurance.policyExpiryDate || null,
      form_data: typeSpecificData,
    });

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // Email broker
    await resend.emails.send({
      from: 'Quotzal <notifications@quotzal.com>',
      to: broker.email,
      subject: `New ${insuranceType.replace(/_/g, ' ')} quote request from ${personalInfo.firstName} ${personalInfo.lastName}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Type:</strong> ${insuranceType.replace(/_/g, ' ')}</p>
        <p><strong>Name:</strong> ${personalInfo.firstName} ${personalInfo.lastName}</p>
        <p><strong>Email:</strong> ${personalInfo.email}</p>
        <p><strong>Phone:</strong> ${personalInfo.phone}</p>
        <p>Log in to your Quotzal dashboard to view the full submission details.</p>
      `,
    });

    // Email customer confirmation
    await resend.emails.send({
      from: 'Quotzal <notifications@quotzal.com>',
      to: personalInfo.email,
      subject: 'Your quote request has been received',
      html: `
        <h2>Thank you, ${personalInfo.firstName}!</h2>
        <p>Your ${insuranceType.replace(/_/g, ' ')} quote request has been submitted to <strong>${broker.brokerage_name}</strong>.</p>
        <p>They will review your information and reach out to you shortly.</p>
        <br />
        <p style="color: #6b7280; font-size: 12px;">Powered by Quotzal</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
