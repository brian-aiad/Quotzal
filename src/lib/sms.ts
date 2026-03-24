interface SendLeadSMSParams {
  brokerPhone: string;
  leadFirstName: string;
  leadLastName: string;
  insuranceType: string;
  leadEmail: string;
}

export async function sendLeadSMS(params: SendLeadSMSParams): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  // Silently skip if Twilio not configured
  if (!sid || !token || !from) return;

  const typeLabel = params.insuranceType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const body = `New lead on Quotzal: ${params.leadFirstName} ${params.leadLastName} needs ${typeLabel} insurance. Email: ${params.leadEmail}. View at quotzal.com/dashboard`;

  // Use Twilio REST API directly to avoid requiring the full twilio package
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      Body: body,
      From: from,
      To: params.brokerPhone,
    }).toString(),
  });
}
