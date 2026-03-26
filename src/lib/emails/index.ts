import { Resend } from "resend";
import { escapeHtml } from "@/lib/sanitize";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "Quotzal <onboarding@resend.dev>";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://quotzal.com";

// ============================================================
// Types
// ============================================================

export interface SubmissionEmailData {
  id: string;
  insuranceType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  hasCurrentInsurance: boolean;
  currentCarrier?: string;
  currentCoverageLimits?: string;
  policyExpiryDate?: string;
  formData: Record<string, unknown>;
}

// ============================================================
// Design System
// ============================================================

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
const C_PRIMARY = "#10b981";
const C_TEXT = "#374151";
const C_HEADING = "#111827";
const C_MUTED = "#6b7280";
const C_BG = "#f8fafc";
const C_CARD = "#ffffff";
const C_BORDER = "#e5e7eb";
const C_RED = "#ef4444";
const C_AMBER = "#f59e0b";

function emailLayout(body: string, options?: { accentColor?: string; footerHtml?: string }): string {
  const accent = options?.accentColor ?? C_PRIMARY;
  const footer = options?.footerHtml ?? `<p style="margin:0;font-size:12px;color:#9ca3af;">Powered by <a href="${BASE_URL}" style="color:#9ca3af;text-decoration:none;">Quotzal</a> &middot; <a href="${BASE_URL}" style="color:#9ca3af;text-decoration:none;">quotzal.com</a></p>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:${C_BG};font-family:${FONT};">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C_BG};padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
  <!-- Header with logo -->
  <tr><td style="padding:20px 0;text-align:center;">
    <a href="${BASE_URL}" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
      <img src="${BASE_URL}/icon.svg" alt="Quotzal" width="28" height="28" style="display:inline-block;vertical-align:middle;" />
      <span style="font-size:22px;font-weight:800;color:${C_PRIMARY};letter-spacing:-0.5px;vertical-align:middle;">Quotzal</span>
    </a>
  </td></tr>
  <!-- Card -->
  <tr><td>
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C_CARD};border-radius:8px;overflow:hidden;border:1px solid ${C_BORDER};">
      <tr><td style="height:4px;background-color:${accent};font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:40px 36px;">${body}</td></tr>
    </table>
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:24px 0;text-align:center;">${footer}</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function btn(text: string, href: string, color: string = C_PRIMARY): string {
  return `<a href="${href}" style="display:inline-block;padding:14px 28px;background-color:${color};color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;font-family:${FONT};">${text}</a>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 12px;font-size:24px;font-weight:700;color:${C_HEADING};line-height:1.3;">${text}</h2>`;
}

function para(text: string): string {
  return `<p style="margin:0 0 20px;font-size:16px;color:${C_TEXT};line-height:1.6;">${text}</p>`;
}

function muted(text: string): string {
  return `<p style="margin:0;font-size:14px;color:${C_MUTED};line-height:1.6;">${text}</p>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid ${C_BORDER};margin:28px 0;"/>`;
}

function infoTable(rows: [string, string][]): string {
  const trs = rows
    .filter(([, v]) => v && v !== "—")
    .map(([label, value]) => `<tr>
      <td style="padding:8px 12px;font-size:14px;color:${C_MUTED};font-weight:500;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:8px 12px;font-size:14px;color:${C_TEXT};font-weight:400;">${escapeHtml(value)}</td>
    </tr>`)
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background-color:#f9fafb;border-radius:6px;overflow:hidden;margin:16px 0;">${trs}</table>`;
}

function sectionHeading(text: string): string {
  return `<h3 style="margin:24px 0 8px;font-size:13px;font-weight:600;color:${C_MUTED};text-transform:uppercase;letter-spacing:0.05em;">${text}</h3>`;
}

function infoRow(label: string, value: string): string {
  return `<p style="margin:4px 0;font-size:14px;color:${C_TEXT};"><strong style="color:${C_MUTED};">${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function formatInsuranceType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ============================================================
// Type-Specific Summaries
// ============================================================

function generateTypeSummary(insuranceType: string, formData: Record<string, unknown>): string {
  switch (insuranceType) {
    case "auto_personal":
    case "auto_commercial": {
      const drivers = formData.drivers as Array<Record<string, unknown>> | undefined;
      const vehicles = formData.vehicles as Array<Record<string, unknown>> | undefined;
      const driverCount = drivers?.length ?? 0;
      const vehicleCount = vehicles?.length ?? 0;
      const firstVehicle = vehicles?.[0];
      let summary = `${driverCount} driver${driverCount !== 1 ? "s" : ""}, ${vehicleCount} vehicle${vehicleCount !== 1 ? "s" : ""}`;
      if (firstVehicle) {
        summary += ` — ${firstVehicle.year || ""} ${firstVehicle.make || ""} ${firstVehicle.model || ""}`;
      }
      if (insuranceType === "auto_commercial") {
        const bizName = formData.businessName as string | undefined;
        if (bizName) summary = `${bizName} — ${summary}`;
      }
      return summary;
    }
    case "home": {
      const addr = (formData.propertyAddress as string) || "Address not provided";
      const sqft = formData.squareFootage as string | undefined;
      return sqft ? `${addr}, ${sqft} sqft` : addr;
    }
    case "life": {
      const coverageMap: Record<string, string> = { under_100k: "Under $100K", "100k_250k": "$100K–$250K", "250k_500k": "$250K–$500K", "500k_1m": "$500K–$1M", over_1m: "Over $1M" };
      return coverageMap[formData.coverageAmount as string] || "Coverage not specified";
    }
    case "motorcycle":
    case "boat":
    case "rv": {
      return `${formData.year || ""} ${formData.make || ""} ${formData.model || ""}`.trim() || "Details in dashboard";
    }
    case "other": {
      return (formData.description as string) || "See details in dashboard";
    }
    default:
      return "See full details in dashboard";
  }
}

function generateDetailSections(insuranceType: string, formData: Record<string, unknown>): string {
  switch (insuranceType) {
    case "auto_personal":
    case "auto_commercial": {
      let html = "";
      if (insuranceType === "auto_commercial") {
        html += sectionHeading("Business Info");
        html += infoRow("Business Name", (formData.businessName as string) || "—");
        html += infoRow("Business Type", (formData.businessType as string) || "—");
      }
      const drivers = formData.drivers as Array<Record<string, unknown>> | undefined;
      if (drivers?.length) {
        html += sectionHeading("Drivers");
        drivers.forEach((d, i) => {
          html += `<p style="margin:8px 0 4px;font-size:13px;font-weight:600;color:${C_HEADING};">Driver ${i + 1}: ${d.fullName || "—"}</p>`;
          html += infoRow("DOB", (d.dateOfBirth as string) || "—");
          html += infoRow("License", `${d.licenseNumber || "—"} (${d.licenseState || "—"})`);
          html += infoRow("SR-22", d.sr22Required ? "Yes" : "No");
        });
      }
      const vehicles = formData.vehicles as Array<Record<string, unknown>> | undefined;
      if (vehicles?.length) {
        html += sectionHeading("Vehicles");
        vehicles.forEach((v, i) => {
          html += `<p style="margin:8px 0 4px;font-size:13px;font-weight:600;color:${C_HEADING};">Vehicle ${i + 1}: ${v.year || ""} ${v.make || ""} ${v.model || ""}</p>`;
          html += infoRow("VIN", (v.vin as string) || "—");
          html += infoRow("Coverage", v.coverageType === "full" ? "Full Coverage" : "Liability Only");
        });
      }
      return html;
    }
    case "home": {
      let html = sectionHeading("Property Details");
      html += infoRow("Address", (formData.propertyAddress as string) || "—");
      html += infoRow("Type", (formData.propertyType as string) || "—");
      html += infoRow("Year Built", (formData.yearBuilt as string) || "—");
      html += infoRow("Sq Ft", (formData.squareFootage as string) || "—");
      html += infoRow("Pool", formData.hasPool ? "Yes" : "No");
      html += infoRow("Prior Claims", formData.hasPriorClaims ? `Yes (${formData.numberOfClaims || "?"})` : "No");
      return html;
    }
    case "life": {
      const coverageMap: Record<string, string> = { under_100k: "Under $100K", "100k_250k": "$100K–$250K", "250k_500k": "$250K–$500K", "500k_1m": "$500K–$1M", over_1m: "Over $1M" };
      let html = sectionHeading("Life Insurance");
      html += infoRow("Coverage", coverageMap[formData.coverageAmount as string] || "—");
      html += infoRow("Type", (formData.policyType as string) || "—");
      html += infoRow("Smoker", formData.isSmoker ? "Yes" : "No");
      html += infoRow("Beneficiary", `${formData.beneficiaryName || "—"}`);
      return html;
    }
    case "motorcycle": {
      let html = sectionHeading("Motorcycle");
      html += infoRow("Vehicle", `${formData.year || ""} ${formData.make || ""} ${formData.model || ""}`);
      html += infoRow("VIN", (formData.vin as string) || "—");
      html += infoRow("Coverage", formData.coverageType === "full" ? "Full Coverage" : "Liability Only");
      return html;
    }
    case "boat": {
      let html = sectionHeading("Boat");
      html += infoRow("Vessel", `${formData.year || ""} ${formData.make || ""} ${formData.model || ""}`);
      html += infoRow("HIN", (formData.hin as string) || "—");
      html += infoRow("Length", `${formData.boatLength || "?"}ft`);
      return html;
    }
    case "rv": {
      let html = sectionHeading("RV");
      html += infoRow("Vehicle", `${formData.year || ""} ${formData.make || ""} ${formData.model || ""}`);
      html += infoRow("VIN", (formData.vin as string) || "—");
      html += infoRow("Class", ((formData.rvClass as string) || "—").replace(/_/g, " "));
      return html;
    }
    case "other": {
      let html = sectionHeading("Details");
      html += infoRow("Description", (formData.description as string) || "—");
      html += infoRow("Est. Value", formData.estimatedValue ? `$${formData.estimatedValue}` : "—");
      return html;
    }
    default:
      return "";
  }
}

// ============================================================
// 1. New Submission — Broker Notification
// ============================================================

export async function sendNewSubmissionEmail(
  brokerEmail: string,
  submission: SubmissionEmailData
) {
  const typeLabel = formatInsuranceType(submission.insuranceType);
  const summary = generateTypeSummary(submission.insuranceType, submission.formData);
  const now = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  const detailSections = generateDetailSections(submission.insuranceType, submission.formData);

  // Extended fields from form_data
  const extFields = (submission.formData.extended_fields ?? {}) as Record<string, string>;

  const currentInsuranceSection = submission.hasCurrentInsurance
    ? [
        sectionHeading("Current Insurance"),
        infoRow("Carrier", submission.currentCarrier || "Not provided"),
        submission.currentCoverageLimits ? infoRow("Coverage Limits", submission.currentCoverageLimits) : "",
        submission.policyExpiryDate ? infoRow("Policy Expires", submission.policyExpiryDate) : "",
        extFields.policyNumber ? infoRow("Policy Number", extFields.policyNumber) : "",
        extFields.yearsWithCarrier ? infoRow("Years with Carrier", extFields.yearsWithCarrier) : "",
        extFields.continuousCoverage === "yes" ? infoRow("Continuous Coverage", "Yes") : "",
      ].join("")
    : "";

  // Build additional info section from extended fields (excluding current insurance fields already shown)
  const currentInsExtKeys = ["policyNumber", "yearsWithCarrier", "continuousCoverage"];
  const additionalInfoRows = Object.entries(extFields)
    .filter(([key, val]) => val && val.trim() && !currentInsExtKeys.includes(key))
    .map(([key, val]) => {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
      return infoRow(label, val === "yes" ? "Yes" : val);
    });
  const additionalInfoSection = additionalInfoRows.length > 0
    ? sectionHeading("Additional Information") + additionalInfoRows.join("")
    : "";

  const body = `
    ${heading("New Lead Received")}
    ${para("Someone just completed your insurance intake form.")}
    ${divider()}
    ${infoTable([
      ["Name", `${submission.firstName} ${submission.lastName}`],
      ["Email", submission.email],
      ["Phone", submission.phone || "Not provided"],
      ["Address", (submission.formData.address as string) || (submission.formData.propertyAddress as string) || ""],
      ["Insurance", typeLabel],
      ["Summary", summary],
      ["Date of Birth", submission.dateOfBirth || "Not provided"],
      ["Currently Insured", submission.hasCurrentInsurance ? "Yes" : "No"],
      ["Submitted", now],
    ])}
    ${detailSections}
    ${currentInsuranceSection}
    ${additionalInfoSection}
    <div style="margin:28px 0 16px;text-align:center;">
      ${btn(`Email ${escapeHtml(submission.firstName)}`, `mailto:${escapeHtml(submission.email)}`)}
      <div style="height:12px;"></div>
      ${btn("View in Dashboard", `${BASE_URL}/dashboard/submissions`, "#374151")}
    </div>
    ${divider()}
    ${muted(`You can reply directly to <a href="mailto:${escapeHtml(submission.email)}" style="color:${C_PRIMARY};text-decoration:none;">${escapeHtml(submission.email)}</a> or call ${submission.phone ? `<a href="tel:${escapeHtml(submission.phone)}" style="color:${C_PRIMARY};text-decoration:none;">${escapeHtml(submission.phone)}</a>` : "them"} to follow up.`)}
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: brokerEmail,
    subject: `🔔 New lead: ${submission.firstName} ${submission.lastName} — ${typeLabel}`,
    html: emailLayout(body),
  });
}

// ============================================================
// 2. Customer Confirmation
// ============================================================

export async function sendCustomerConfirmationEmail(
  customerEmail: string,
  submission: SubmissionEmailData,
  brokerName: string,
  brokerEmail: string,
  brokerLogo?: string
) {
  const typeLabel = formatInsuranceType(submission.insuranceType);
  const safeBroker = escapeHtml(brokerName);
  const safeName = escapeHtml(submission.firstName);

  const body = `
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:48px;">✅</span>
    </div>
    ${heading(`You're all set, ${safeName}!`)}
    ${para(`<strong>${safeBroker}</strong> received your <strong>${typeLabel}</strong> quote request and will be in touch shortly.`)}
    ${divider()}
    <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;color:${C_HEADING};">What happens next?</h3>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="padding:6px 12px 6px 0;font-size:20px;vertical-align:top;">🔍</td><td style="padding:6px 0;font-size:14px;color:${C_TEXT};"><strong>Step 1:</strong> We review your information</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:20px;vertical-align:top;">📋</td><td style="padding:6px 0;font-size:14px;color:${C_TEXT};"><strong>Step 2:</strong> We prepare your personalized quote</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:20px;vertical-align:top;">📞</td><td style="padding:6px 0;font-size:14px;color:${C_TEXT};"><strong>Step 3:</strong> We contact you with your options</td></tr>
    </table>
    ${divider()}
    <div style="background-color:#f9fafb;border-radius:6px;padding:20px;margin:0 0 16px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${C_HEADING};">Questions? Contact ${safeBroker} directly:</p>
      <p style="margin:0;font-size:14px;color:${C_TEXT};">✉️ <a href="mailto:${escapeHtml(brokerEmail)}" style="color:${C_PRIMARY};text-decoration:none;">${escapeHtml(brokerEmail)}</a></p>
    </div>
    ${muted("Expected response time: within 1 business day")}
  `;

  const footerHtml = `<p style="margin:0;font-size:12px;color:#9ca3af;">This confirmation was sent on behalf of ${safeBroker}</p>`;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: customerEmail,
    subject: `✅ Your insurance quote request was received — ${brokerName}`,
    html: emailLayout(body, { footerHtml }),
  });
}

// ============================================================
// 3. Demo Link
// ============================================================

export async function sendDemoEmail(
  email: string,
  name: string,
  demoSlug: string
) {
  const demoLink = `${BASE_URL}/f/${demoSlug}`;

  const body = `
    ${heading("Your Quotzal demo link is ready")}
    ${para(`Hi ${escapeHtml(name)}, thanks for your interest! Here's your personalized demo link:`)}
    <div style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:16px;margin:0 0 20px;text-align:center;">
      <a href="${demoLink}" style="font-size:16px;font-weight:600;color:#065f46;text-decoration:none;">${demoLink}</a>
    </div>
    ${muted("This link expires in 7 days. Try it yourself or share it with a test customer.")}
    <div style="margin:28px 0 0;text-align:center;">
      ${btn("Sign Up and Go Live", `${BASE_URL}/signup`)}
    </div>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: "Your Quotzal demo link is ready",
    html: emailLayout(body),
  });
}

// ============================================================
// 4. Trial Ending
// ============================================================

export async function sendTrialEndingEmail(
  brokerEmail: string,
  brokerageName: string,
  daysLeft: number,
  submissionCount: number
) {
  const subjectMap: Record<number, string> = {
    7: "Your Quotzal trial ends in 7 days",
    3: "⏰ 3 days left on your Quotzal trial",
    1: "Your Quotzal trial ends tomorrow",
    0: "Your Quotzal trial has ended",
  };
  const subject = subjectMap[daysLeft] || `Your Quotzal trial ends in ${daysLeft} days`;

  const isExpired = daysLeft <= 0;
  const accent = isExpired ? C_RED : daysLeft <= 3 ? C_AMBER : C_PRIMARY;

  const headingText = isExpired
    ? "Your trial has ended"
    : daysLeft <= 3
    ? `${daysLeft} days left — don't lose access`
    : "Your free trial ends soon";

  const bodyText = isExpired
    ? "Your free trial has ended. Subscribe to restore access to your dashboard and all your leads."
    : `You have <strong style="color:${accent};">${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong> left on your free trial. Subscribe now to keep receiving leads without interruption.`;

  const body = `
    ${heading(headingText)}
    ${para(`Hi ${escapeHtml(brokerageName)}, ${bodyText}`)}
    ${submissionCount > 0 ? `
    <div style="background-color:#f0fdf4;border-radius:6px;padding:12px 16px;margin:0 0 20px;">
      <p style="margin:0;font-size:14px;color:#065f46;">You've received <strong>${submissionCount} lead${submissionCount !== 1 ? "s" : ""}</strong> during your trial.</p>
    </div>` : ""}
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td width="50%" style="padding:0 6px 0 0;vertical-align:top;">
          <div style="border:1px solid ${C_BORDER};border-radius:6px;padding:20px;text-align:center;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${C_HEADING};">Starter</p>
            <p style="margin:0 0 12px;font-size:24px;font-weight:700;color:${C_HEADING};">$19<span style="font-size:14px;font-weight:400;color:${C_MUTED};">/mo</span></p>
            ${btn("Subscribe", `${BASE_URL}/dashboard/billing`, C_PRIMARY)}
          </div>
        </td>
        <td width="50%" style="padding:0 0 0 6px;vertical-align:top;">
          <div style="border:2px solid ${C_PRIMARY};border-radius:6px;padding:20px;text-align:center;">
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${C_HEADING};">Pro</p>
            <p style="margin:0 0 12px;font-size:24px;font-weight:700;color:${C_HEADING};">$39<span style="font-size:14px;font-weight:400;color:${C_MUTED};">/mo</span></p>
            ${btn("Subscribe", `${BASE_URL}/dashboard/billing`, C_PRIMARY)}
          </div>
        </td>
      </tr>
    </table>
    ${muted("Questions? Reply to this email.")}
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: brokerEmail,
    subject,
    html: emailLayout(body, { accentColor: accent }),
  });
}

// ============================================================
// 5. Payment Failed
// ============================================================

export async function sendPaymentFailedEmail(
  brokerEmail: string,
  brokerageName: string,
  amount: number
) {
  const dollars = (amount / 100).toFixed(2);

  const body = `
    ${heading("Action required")}
    ${para(`Hi ${escapeHtml(brokerageName)}, we weren't able to process your payment of <strong>$${dollars}</strong>.`)}
    <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;margin:0 0 20px;">
      <p style="margin:0;font-size:14px;color:#991b1b;">Your intake form link will remain active for <strong>7 more days</strong>. Please update your payment method to avoid interruption.</p>
    </div>
    <div style="text-align:center;">
      ${btn("Update Payment Method", `${BASE_URL}/dashboard/billing`, C_RED)}
    </div>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: brokerEmail,
    subject: "Action required — your Quotzal payment failed",
    html: emailLayout(body, { accentColor: C_RED }),
  });
}

// ============================================================
// 6. Link Deactivated
// ============================================================

export async function sendLinkDeactivatedEmail(
  brokerEmail: string,
  brokerageName: string,
  slug: string
) {
  const domain = BASE_URL.replace(/^https?:\/\//, "");
  const body = `
    ${heading("Your form link has been deactivated")}
    ${para(`Hi ${escapeHtml(brokerageName)}, your intake form link <strong>${domain}/f/${escapeHtml(slug)}</strong> is no longer accepting submissions.`)}
    ${para("Your existing submission data has been preserved. You can reactivate your account at any time by subscribing again.")}
    <div style="text-align:center;">
      ${btn("Reactivate My Account", `${BASE_URL}/dashboard/billing`)}
    </div>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: brokerEmail,
    subject: "Your Quotzal link has been deactivated",
    html: emailLayout(body),
  });
}

// ============================================================
// 7. Welcome
// ============================================================

export async function sendWelcomeEmail(
  brokerEmail: string,
  brokerageName: string,
  slug: string
) {
  const formLink = `${BASE_URL}/f/${slug}`;

  const body = `
    ${heading(`Welcome to Quotzal! 🎉`)}
    ${para(`Hi ${escapeHtml(brokerageName)}, your account is set up and your form link is ready to share.`)}
    <div style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:20px;margin:0 0 24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#065f46;font-weight:500;">Your form link:</p>
      <a href="${formLink}" style="font-size:18px;font-weight:700;color:#065f46;text-decoration:none;">${formLink}</a>
    </div>
    <div style="text-align:center;margin:0 0 28px;">
      ${btn("Go to Your Dashboard", `${BASE_URL}/dashboard`)}
    </div>
    ${divider()}
    <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;color:${C_HEADING};">3 things to do first:</h3>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      <tr><td style="padding:6px 12px 6px 0;font-size:20px;vertical-align:top;">📤</td><td style="padding:6px 0;font-size:14px;color:${C_TEXT};">Share your link with clients</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:20px;vertical-align:top;">🔔</td><td style="padding:6px 0;font-size:14px;color:${C_TEXT};">Check your notification settings</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:20px;vertical-align:top;">🎨</td><td style="padding:6px 0;font-size:14px;color:${C_TEXT};">Add your logo and brand color (Pro)</td></tr>
    </table>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: brokerEmail,
    subject: `Welcome to Quotzal, ${brokerageName}! 🎉`,
    html: emailLayout(body),
  });
}

// ============================================================
// 8. Deletion Warning
// ============================================================

export async function sendDeletionWarningEmail(
  brokerEmail: string,
  brokerageName: string,
  count: number,
  deletionDate: string,
  isPro: boolean
) {
  const upgradePrompt = !isPro
    ? `<div style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:16px;margin:0 0 20px;">
        <p style="margin:0;font-size:14px;color:#065f46;"><strong>Pro tip:</strong> Upgrade to Pro to extend your data retention to 24 months.</p>
        <p style="margin:8px 0 0;">${btn("Upgrade to Pro — $39/mo", `${BASE_URL}/dashboard/billing`)}</p>
      </div>`
    : "";

  const body = `
    ${heading("Data deletion notice")}
    ${para(`Hi ${escapeHtml(brokerageName)}, <strong>${count} submission${count !== 1 ? "s" : ""}</strong> will be permanently deleted on <strong>${escapeHtml(deletionDate)}</strong> as part of your data retention policy.`)}
    ${para("Export your data now to keep a local copy before it's removed.")}
    <div style="text-align:center;margin:0 0 20px;">
      ${btn("Export CSV", `${BASE_URL}/dashboard/submissions`)}
    </div>
    ${upgradePrompt}
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: brokerEmail,
    subject: "Your submission data will be deleted in 30 days",
    html: emailLayout(body, { accentColor: C_AMBER }),
  });
}

// ============================================================
// 9. Broadcast Email
// ============================================================

export async function sendBroadcastEmail(
  emails: string[],
  subject: string,
  body: string
) {
  const html = emailLayout(
    `<div style="font-size:16px;color:${C_TEXT};line-height:1.6;">${body}</div>`
  );

  const batches: string[][] = [];
  for (let i = 0; i < emails.length; i += 100) {
    batches.push(emails.slice(i, i + 100));
  }

  const results = await Promise.all(
    batches.map((batch) =>
      resend.batch.send(
        batch.map((to) => ({
          from: FROM_ADDRESS,
          to,
          subject,
          html,
        }))
      )
    )
  );

  return results;
}

// ============================================================
// 10. Webhook Error Alert (admin notification)
// ============================================================

export async function sendWebhookErrorAlert(
  error: unknown,
  eventType: string
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const errorMessage = error instanceof Error ? error.message : String(error);
  const timestamp = new Date().toISOString();

  const body = `
    ${heading("⚠️ Stripe Webhook Error")}
    ${para("A webhook handler failed and needs attention.")}
    ${infoTable([
      ["Event Type", eventType],
      ["Error", errorMessage],
      ["Timestamp", timestamp],
    ])}
    ${muted('Check the <a href="https://dashboard.stripe.com/webhooks" style="color:' + C_PRIMARY + ';text-decoration:none;">Stripe Dashboard</a> for the full event payload and retry if needed.')}
  `;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: adminEmail,
      subject: "⚠️ Quotzal Stripe webhook error",
      html: emailLayout(body, { accentColor: C_RED }),
    });
  } catch {
    console.error("[WEBHOOK_ALERT] Failed to send webhook error email");
  }
}
