import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendNewSubmissionEmail,
  sendCustomerConfirmationEmail,
} from '@/lib/emails';
import type { SubmissionEmailData } from '@/lib/emails';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/sanitize';
import { sendLeadSMS } from '@/lib/sms';

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

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 submissions per IP per hour
    const ip = getClientIp(request.headers);
    const { allowed } = checkRateLimit(ip, 'submit-form', {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      );
    }

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

    // Sanitize text inputs
    const firstName = sanitizeText(personalInfo.firstName, 100);
    const lastName = sanitizeText(personalInfo.lastName, 100);
    const email = sanitizeText(personalInfo.email, 254);
    const phone = sanitizeText(personalInfo.phone || '', 20);
    const dateOfBirth = sanitizeText(personalInfo.dateOfBirth || '', 10);
    const currentCarrier = sanitizeText(currentInsurance.currentCarrier || '', 200);
    const currentLimits = sanitizeText(currentInsurance.currentCoverageLimits || '', 200);
    const policyExpiry = sanitizeText(currentInsurance.policyExpiryDate || '', 10);

    const supabase = createAdminClient();

    // Look up broker for email + logo + phone + sms pref
    const { data: broker } = await supabase
      .from('brokers')
      .select('email, brokerage_name, logo_url, phone, sms_notifications')
      .eq('id', brokerId)
      .single<{ email: string; brokerage_name: string; logo_url: string | null; phone: string | null; sms_notifications: boolean | null }>();

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
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        date_of_birth: dateOfBirth || null,
        has_current_insurance: currentInsurance.hasCurrentInsurance,
        current_carrier: currentCarrier || null,
        current_limits: currentLimits || null,
        policy_expiry: policyExpiry || null,
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
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      hasCurrentInsurance: currentInsurance.hasCurrentInsurance,
      currentCarrier: currentCarrier || undefined,
      currentCoverageLimits: currentLimits || undefined,
      policyExpiryDate: policyExpiry || undefined,
      formData: typeSpecificData,
    };

    // Send emails in parallel
    await Promise.all([
      sendNewSubmissionEmail(broker.email, submissionData),
      sendCustomerConfirmationEmail(
        email,
        submissionData,
        broker.brokerage_name,
        broker.email,
        broker.logo_url || undefined
      ),
    ]);

    // SMS notification (fire-and-forget)
    if (broker.sms_notifications && broker.phone) {
      try {
        await sendLeadSMS({
          brokerPhone: broker.phone,
          leadFirstName: firstName,
          leadLastName: lastName,
          insuranceType,
          leadEmail: email,
        });
      } catch {
        // SMS failure should never block the response
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
