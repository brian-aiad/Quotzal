import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendNewSubmissionEmail,
  sendCustomerConfirmationEmail,
} from '@/lib/emails';
import type { SubmissionEmailData } from '@/lib/emails';

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

    // Look up broker for email + logo
    const { data: broker } = await supabase
      .from('brokers')
      .select('email, brokerage_name, logo_url')
      .eq('id', brokerId)
      .single<{ email: string; brokerage_name: string; logo_url: string | null }>();

    if (!broker) {
      return NextResponse.json(
        { error: 'Broker not found' },
        { status: 404 }
      );
    }

    // Save submission and return the ID
    const { data: inserted, error: insertError } = await supabase
      .from('submissions')
      .insert({
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
      })
      .select('id')
      .single();

    if (insertError || !inserted) {
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    const submissionData: SubmissionEmailData = {
      id: inserted.id,
      insuranceType,
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName,
      email: personalInfo.email,
      phone: personalInfo.phone,
      dateOfBirth: personalInfo.dateOfBirth,
      hasCurrentInsurance: currentInsurance.hasCurrentInsurance,
      currentCarrier: currentInsurance.currentCarrier,
      currentCoverageLimits: currentInsurance.currentCoverageLimits,
      policyExpiryDate: currentInsurance.policyExpiryDate,
      formData: typeSpecificData,
    };

    // Send emails in parallel
    await Promise.all([
      sendNewSubmissionEmail(broker.email, submissionData),
      sendCustomerConfirmationEmail(
        personalInfo.email,
        submissionData,
        broker.brokerage_name,
        broker.email,
        broker.logo_url || undefined
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
