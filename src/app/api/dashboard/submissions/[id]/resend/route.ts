import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { escapeHtml } from '@/lib/sanitize';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch submission (RLS enforces broker owns it)
    const { data: submission } = await supabase
      .from('submissions')
      .select('email, first_name, link_id')
      .eq('id', id)
      .single<{ email: string; first_name: string; link_id: string }>();

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Fetch the link slug
    const { data: link } = await supabase
      .from('broker_links')
      .select('slug')
      .eq('id', submission.link_id)
      .single<{ slug: string }>();

    if (!link) {
      return NextResponse.json({ error: 'Form link not found' }, { status: 404 });
    }

    // Fetch broker name
    const { data: broker } = await supabase
      .from('brokers')
      .select('brokerage_name')
      .eq('id', user.id)
      .single<{ brokerage_name: string }>();

    const brokerName = broker?.brokerage_name ?? 'Your insurance broker';
    const formUrl = `https://quotzal.com/f/${link.slug}`;
    const safeName = escapeHtml(submission.first_name);
    const safeBrokerName = escapeHtml(brokerName);

    await resend.emails.send({
      from: 'Quotzal <onboarding@resend.dev>',
      to: submission.email,
      subject: `${brokerName} — your insurance quote form`,
      html: `
        <h2>Hi ${safeName},</h2>
        <p><strong>${safeBrokerName}</strong> has sent you a link to complete your insurance quote:</p>
        <p><a href="${formUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Complete Your Quote</a></p>
        <p>Or copy this link: ${formUrl}</p>
        <br />
        <p style="color:#6b7280;font-size:12px;">Powered by Quotzal</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to resend email' }, { status: 500 });
  }
}
