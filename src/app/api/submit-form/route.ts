import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendNewSubmissionEmail,
  sendCustomerConfirmationEmail,
} from '@/lib/emails';
import type { SubmissionEmailData } from '@/lib/emails';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/sanitize';
import {
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
  VIN_LENGTH,
  MAX_ADDRESS_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_CARRIER_NAME_LENGTH,
} from '@/lib/constants';

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
    const rl = checkRateLimit(ip, 'submit-form', {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again later.', code: 'RATE_LIMITED' },
        { status: 429, headers: rateLimitHeaders(rl) }
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
      !personalInfo || !currentInsurance || !typeSpecificData ||
      typeof personalInfo.firstName !== 'string' || !personalInfo.firstName.trim() ||
      typeof personalInfo.lastName !== 'string' || !personalInfo.lastName.trim() ||
      typeof personalInfo.email !== 'string' || !personalInfo.email.trim()
    ) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalInfo.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Validate input lengths
    if (personalInfo.firstName.length > MAX_NAME_LENGTH || personalInfo.lastName.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Name must be ${MAX_NAME_LENGTH} characters or less`, code: 'NAME_TOO_LONG' },
        { status: 400 }
      );
    }
    if (personalInfo.email.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Email must be ${MAX_EMAIL_LENGTH} characters or less`, code: 'EMAIL_TOO_LONG' },
        { status: 400 }
      );
    }
    if (personalInfo.phone && personalInfo.phone.length > MAX_PHONE_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Phone must be ${MAX_PHONE_LENGTH} characters or less`, code: 'PHONE_TOO_LONG' },
        { status: 400 }
      );
    }

    // Validate VIN if present in type-specific data
    const vinValue = typeSpecificData?.vin as string | undefined;
    if (vinValue && vinValue.length !== VIN_LENGTH) {
      return NextResponse.json(
        { success: false, error: `VIN must be exactly ${VIN_LENGTH} characters`, code: 'INVALID_VIN' },
        { status: 400 }
      );
    }

    // Validate address fields in type-specific data
    const addressFields = ['address', 'garaging_address', 'property_address'] as const;
    for (const field of addressFields) {
      const val = typeSpecificData?.[field] as string | undefined;
      if (val && val.length > MAX_ADDRESS_LENGTH) {
        return NextResponse.json(
          { success: false, error: `Address must be ${MAX_ADDRESS_LENGTH} characters or less`, code: 'ADDRESS_TOO_LONG' },
          { status: 400 }
        );
      }
    }

    // Validate notes in type-specific data
    const notesValue = typeSpecificData?.notes as string | undefined;
    if (notesValue && notesValue.length > MAX_NOTES_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Notes must be ${MAX_NOTES_LENGTH} characters or less`, code: 'NOTES_TOO_LONG' },
        { status: 400 }
      );
    }

    if (currentInsurance.currentCarrier && currentInsurance.currentCarrier.length > MAX_CARRIER_NAME_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Carrier name must be ${MAX_CARRIER_NAME_LENGTH} characters or less`, code: 'CARRIER_TOO_LONG' },
        { status: 400 }
      );
    }

    // Sanitize text inputs
    const firstName = sanitizeText(personalInfo.firstName, MAX_NAME_LENGTH);
    const lastName = sanitizeText(personalInfo.lastName, MAX_NAME_LENGTH);
    const email = sanitizeText(personalInfo.email, MAX_EMAIL_LENGTH);
    const phone = sanitizeText(personalInfo.phone || '', MAX_PHONE_LENGTH);
    const dateOfBirth = sanitizeText(personalInfo.dateOfBirth || '', 10);
    const currentCarrier = sanitizeText(currentInsurance.currentCarrier || '', MAX_CARRIER_NAME_LENGTH);
    const currentLimits = sanitizeText(currentInsurance.currentCoverageLimits || '', MAX_CARRIER_NAME_LENGTH);
    const policyExpiry = sanitizeText(currentInsurance.policyExpiryDate || '', 10);

    const supabase = createAdminClient();

    const { data: link } = await supabase
      .from('broker_links')
      .select('broker_id')
      .eq('id', linkId)
      .eq('broker_id', brokerId)
      .eq('is_active', true)
      .single();
    if (!link) {
      return NextResponse.json({ success: false, error: 'Form unavailable', code: 'FORM_UNAVAILABLE' }, { status: 404 });
    }

    // Look up broker for email + logo
    const { data: broker } = await supabase
      .from('brokers')
      .select('email, brokerage_name, logo_url, status, insurance_types_enabled')
      .eq('id', brokerId)
      .single<{ email: string; brokerage_name: string; logo_url: string | null; status: string; insurance_types_enabled: string[] }>();

    if (!broker) {
      return NextResponse.json(
        { success: false, error: 'Broker not found', code: 'BROKER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!['active', 'trialing', 'past_due'].includes(broker.status) || !broker.insurance_types_enabled.includes(insuranceType)) {
      return NextResponse.json({ success: false, error: 'Form unavailable', code: 'FORM_UNAVAILABLE' }, { status: 403 });
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
        { success: false, error: 'Failed to save submission', code: 'INSERT_FAILED' },
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

    return NextResponse.json({ success: true }, { headers: rateLimitHeaders(rl) });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
