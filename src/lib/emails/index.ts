import { Resend } from "resend";
import { escapeHtml } from "@/lib/sanitize";

const resend = new Resend(process.env.RESEND_API_KEY);

// Dev: "onboarding@resend.dev" — switch to "noreply@quotzal.com" after Resend domain verification (Phase 4)
const FROM_ADDRESS = "Quotzal <onboarding@resend.dev>";

const BASE_URL = "https://quotzal.com";

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
// Shared Layout
// ============================================================

function emailLayout(body: string, footerExtra?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #e5e7eb;">
              <span style="font-size:20px;font-weight:700;color:#111827;">Quotzal</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e5e7eb;background-color:#f9fafb;">
              ${footerExtra || ""}
              <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">Powered by <a href="${BASE_URL}" style="color:#9ca3af;">Quotzal</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, href: string, color: string = "#2563eb"): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 28px;background-color:${color};color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${text}</a>`;
}

function sectionHeading(text: string): string {
  return `<h3 style="margin:24px 0 8px;font-size:14px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.05em;">${text}</h3>`;
}

function infoRow(label: string, value: string): string {
  return `<p style="margin:4px 0;font-size:14px;color:#374151;"><strong style="color:#6b7280;">${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function formatInsuranceType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
        const year = firstVehicle.year || "";
        const make = firstVehicle.make || "";
        const model = firstVehicle.model || "";
        const coverage = firstVehicle.coverageType === "full" ? "Full Coverage" : "Liability Only";
        summary += ` — ${year} ${make} ${model}, ${coverage}`;
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
      const yearBuilt = formData.yearBuilt as string | undefined;
      const propType = (formData.propertyType as string) || "";
      let summary = addr;
      if (sqft) summary += `, ${sqft} sqft`;
      if (yearBuilt) summary += `, built ${yearBuilt}`;
      if (propType) summary += ` (${propType})`;
      return summary;
    }
    case "life": {
      const coverageMap: Record<string, string> = {
        under_100k: "Under $100K",
        "100k_250k": "$100K–$250K",
        "250k_500k": "$250K–$500K",
        "500k_1m": "$500K–$1M",
        over_1m: "Over $1M",
      };
      const coverage = coverageMap[formData.coverageAmount as string] || "Not specified";
      const policyType = formData.policyType as string | undefined;
      const typeLabel = policyType === "term" ? "Term Life" : policyType === "whole" ? "Whole Life" : "Type TBD";
      const smoker = formData.isSmoker ? "Smoker" : "Non-smoker";
      return `${coverage} ${typeLabel}, ${smoker}`;
    }
    case "motorcycle": {
      const year = (formData.year as string) || "";
      const make = (formData.make as string) || "";
      const model = (formData.model as string) || "";
      const coverage = formData.coverageType === "full" ? "Full Coverage" : "Liability Only";
      return `${year} ${make} ${model}, ${coverage}`;
    }
    case "boat": {
      const year = (formData.year as string) || "";
      const make = (formData.make as string) || "";
      const model = (formData.model as string) || "";
      const length = formData.boatLength as string | undefined;
      let summary = `${year} ${make} ${model}`;
      if (length) summary += `, ${length}ft`;
      return summary;
    }
    case "rv": {
      const year = (formData.year as string) || "";
      const make = (formData.make as string) || "";
      const model = (formData.model as string) || "";
      const rvClassMap: Record<string, string> = {
        class_a: "Class A",
        class_b: "Class B",
        class_c: "Class C",
        travel_trailer: "Travel Trailer",
        "5th_wheel": "5th Wheel",
        other: "Other",
      };
      const rvClass = rvClassMap[formData.rvClass as string] || "";
      return `${year} ${make} ${model}${rvClass ? ` (${rvClass})` : ""}`;
    }
    case "other": {
      const desc = (formData.description as string) || "No description";
      const value = formData.estimatedValue as string | undefined;
      return value ? `${desc} — Est. value: $${value}` : desc;
    }
    default:
      return "See full details in dashboard";
  }
}

// ============================================================
// Type-Specific Detail Sections (for customer confirmation)
// ============================================================

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
          html += `<p style="margin:8px 0 4px;font-size:13px;font-weight:600;color:#111827;">Driver ${i + 1}: ${d.fullName || "—"}</p>`;
          html += infoRow("DOB", (d.dateOfBirth as string) || "—");
          html += infoRow("License", `${d.licenseNumber || "—"} (${d.licenseState || "—"})`);
          html += infoRow("SR-22", d.sr22Required ? "Yes" : "No");
        });
      }
      const vehicles = formData.vehicles as Array<Record<string, unknown>> | undefined;
      if (vehicles?.length) {
        html += sectionHeading("Vehicles");
        vehicles.forEach((v, i) => {
          html += `<p style="margin:8px 0 4px;font-size:13px;font-weight:600;color:#111827;">Vehicle ${i + 1}: ${v.year || ""} ${v.make || ""} ${v.model || ""}</p>`;
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
      html += infoRow("Square Footage", (formData.squareFootage as string) || "—");
      html += infoRow("Stories", (formData.stories as string) || "—");
      html += infoRow("Roof Age", (formData.roofAge as string) || "—");
      html += infoRow("Roof Material", ((formData.roofMaterial as string) || "—").replace(/_/g, " "));
      html += infoRow("Pool", formData.hasPool ? "Yes" : "No");
      html += infoRow("Trampoline", formData.hasTrampoline ? "Yes" : "No");
      html += infoRow("Dogs", formData.hasDogs ? `Yes${formData.dogBreed ? ` (${formData.dogBreed})` : ""}` : "No");
      html += infoRow("Flood Zone", (formData.floodZone as string) || "—");
      html += infoRow("Prior Claims", formData.hasPriorClaims ? `Yes (${formData.numberOfClaims || "?"})` : "No");
      if (formData.hasLienholder) {
        html += infoRow("Lender", (formData.lenderName as string) || "—");
      }
      return html;
    }
    case "life": {
      const coverageMap: Record<string, string> = {
        under_100k: "Under $100K",
        "100k_250k": "$100K–$250K",
        "250k_500k": "$250K–$500K",
        "500k_1m": "$500K–$1M",
        over_1m: "Over $1M",
      };
      let html = sectionHeading("Life Insurance Details");
      html += infoRow("Coverage Amount", coverageMap[formData.coverageAmount as string] || "—");
      html += infoRow("Policy Type", (formData.policyType as string) || "—");
      if (formData.termLength) html += infoRow("Term Length", `${formData.termLength} years`);
      html += infoRow("Smoker", formData.isSmoker ? "Yes" : "No");
      html += infoRow("Health Conditions", formData.hasHealthConditions ? (formData.healthConditionsDescription as string) || "Yes" : "No");
      html += infoRow("Height", `${formData.heightFeet || "?"}' ${formData.heightInches || "?"}`);
      html += infoRow("Weight", `${formData.weight || "?"} lbs`);
      html += infoRow("Beneficiary", `${formData.beneficiaryName || "—"} (${(formData.beneficiaryRelationship as string) || "—"})`);
      return html;
    }
    case "motorcycle": {
      let html = sectionHeading("Motorcycle Details");
      html += infoRow("Vehicle", `${formData.year || ""} ${formData.make || ""} ${formData.model || ""}`);
      html += infoRow("VIN", (formData.vin as string) || "—");
      html += infoRow("Ownership", (formData.ownership as string) || "—");
      html += infoRow("Stored", (formData.storedLocation as string) || "—");
      html += infoRow("Coverage", formData.coverageType === "full" ? "Full Coverage" : "Liability Only");
      return html;
    }
    case "boat": {
      let html = sectionHeading("Boat Details");
      html += infoRow("Vessel", `${formData.year || ""} ${formData.make || ""} ${formData.model || ""}`);
      html += infoRow("HIN", (formData.hin as string) || "—");
      html += infoRow("Length", `${formData.boatLength || "?"}ft`);
      html += infoRow("Hull Type", ((formData.hullType as string) || "—").replace(/_/g, " "));
      html += infoRow("Stored", (formData.storedLocation as string) || "—");
      html += infoRow("Financed", formData.isFinanced ? `Yes — ${formData.lienholderName || "—"}` : "No");
      return html;
    }
    case "rv": {
      let html = sectionHeading("RV Details");
      html += infoRow("Vehicle", `${formData.year || ""} ${formData.make || ""} ${formData.model || ""}`);
      html += infoRow("VIN", (formData.vin as string) || "—");
      html += infoRow("Class", ((formData.rvClass as string) || "—").replace(/_/g, " "));
      html += infoRow("Ownership", (formData.ownership as string) || "—");
      html += infoRow("Stored", (formData.storedLocation as string) || "—");
      html += infoRow("Full-Time Residence", formData.isFullTimeResidence ? "Yes" : "No");
      html += infoRow("Coverage", formData.coverageType === "full" ? "Full Coverage" : "Liability Only");
      return html;
    }
    case "other": {
      let html = sectionHeading("Details");
      html += infoRow("Description", (formData.description as string) || "—");
      html += infoRow("Estimated Value", formData.estimatedValue ? `$${formData.estimatedValue}` : "—");
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

  let currentInsuranceHtml = "";
  if (submission.hasCurrentInsurance) {
    currentInsuranceHtml = sectionHeading("Current Insurance");
    currentInsuranceHtml += infoRow("Carrier", submission.currentCarrier || "—");
    currentInsuranceHtml += infoRow("Limits", submission.currentCoverageLimits || "—");
    if (submission.policyExpiryDate) {
      currentInsuranceHtml += infoRow("Expires", submission.policyExpiryDate);
    }
  }

  const body = `
    <h2 style="margin:0 0 4px;font-size:20px;color:#111827;">New ${typeLabel}</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">${submission.firstName} ${submission.lastName}</p>

    <div style="background-color:#f0f9ff;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:#1e40af;font-weight:500;">${summary}</p>
    </div>

    ${sectionHeading("Customer Info")}
    ${infoRow("Name", `${submission.firstName} ${submission.lastName}`)}
    ${infoRow("Email", submission.email)}
    ${infoRow("Phone", submission.phone || "—")}
    ${infoRow("Date of Birth", submission.dateOfBirth || "—")}

    ${currentInsuranceHtml}

    <div style="margin-top:28px;">
      ${ctaButton("View Full Details", `${BASE_URL}/dashboard?submission=${submission.id}`)}
    </div>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: brokerEmail,
    subject: `New ${typeLabel} — ${submission.firstName} ${submission.lastName}`,
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

  const logoHtml = brokerLogo
    ? `<img src="${brokerLogo}" alt="${brokerName}" style="max-height:48px;max-width:200px;margin-bottom:16px;" /><br />`
    : "";

  let currentInsuranceHtml = "";
  if (submission.hasCurrentInsurance) {
    currentInsuranceHtml = sectionHeading("Current Insurance");
    currentInsuranceHtml += infoRow("Carrier", submission.currentCarrier || "—");
    currentInsuranceHtml += infoRow("Limits", submission.currentCoverageLimits || "—");
    if (submission.policyExpiryDate) {
      currentInsuranceHtml += infoRow("Expires", submission.policyExpiryDate);
    }
  }

  const detailSections = generateDetailSections(submission.insuranceType, submission.formData);

  const body = `
    ${logoHtml}
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Your ${typeLabel} quote request has been received</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#374151;">
      Hi ${submission.firstName}, here's a copy of everything you submitted to <strong>${brokerName}</strong>. They will review your information and reach out to you shortly.
    </p>

    ${sectionHeading("Personal Info")}
    ${infoRow("Name", `${submission.firstName} ${submission.lastName}`)}
    ${infoRow("Email", submission.email)}
    ${infoRow("Phone", submission.phone || "—")}
    ${infoRow("Date of Birth", submission.dateOfBirth || "—")}

    ${detailSections}
    ${currentInsuranceHtml}
  `;

  const footer = `<p style="margin:0 0 4px;font-size:12px;color:#6b7280;">Contact: <a href="mailto:${brokerEmail}" style="color:#6b7280;">${brokerEmail}</a></p>`;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: customerEmail,
    subject: `Your ${typeLabel} quote request has been received — ${brokerName}`,
    html: emailLayout(body, footer),
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
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Your Quotzal demo link is ready</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#374151;">
      Hi ${name}, thanks for your interest in Quotzal! Here's your personalized demo link:
    </p>

    <div style="background-color:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:16px;text-align:center;">
      <a href="${demoLink}" style="font-size:16px;font-weight:600;color:#1e40af;text-decoration:none;">${demoLink}</a>
    </div>

    <p style="margin:0 0 24px;font-size:13px;color:#6b7280;">
      This link expires in 7 days. Share it with a test customer or try it yourself to see the full intake experience.
    </p>

    <div style="margin-top:8px;">
      ${ctaButton("Sign Up and Go Live", `${BASE_URL}/signup`)}
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
    7: "Your Quotzal trial — 7 days left",
    3: "Your trial ends in 3 days",
    1: "Your Quotzal link expires tomorrow",
  };
  const subject = subjectMap[daysLeft] || `Your Quotzal trial ends in ${daysLeft} days`;

  const urgencyColor = daysLeft <= 1 ? "#dc2626" : daysLeft <= 3 ? "#d97706" : "#2563eb";

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Hi ${brokerageName},</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#374151;">
      Your Quotzal free trial ends in <strong style="color:${urgencyColor};">${daysLeft} day${daysLeft !== 1 ? "s" : ""}</strong>.
    </p>

    ${submissionCount > 0 ? `
    <div style="background-color:#f0f9ff;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:#1e40af;">
        You've received <strong>${submissionCount} submission${submissionCount !== 1 ? "s" : ""}</strong> during your trial. Subscribe to keep receiving new leads.
      </p>
    </div>
    ` : ""}

    <p style="margin:0 0 24px;font-size:14px;color:#374151;">
      After your trial ends, your intake form link will be deactivated and you'll stop receiving submissions. Subscribe now to keep your link active.
    </p>

    <div style="margin-top:8px;">
      ${ctaButton("Keep my account active", `${BASE_URL}/dashboard/billing`, urgencyColor)}
    </div>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: brokerEmail,
    subject,
    html: emailLayout(body),
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
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Action required</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#374151;">
      Hi ${brokerageName}, we weren't able to process your payment of <strong>$${dollars}</strong>.
    </p>

    <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:#991b1b;">
        Your intake form link will remain active for <strong>7 more days</strong>. Please update your payment method to avoid interruption.
      </p>
    </div>

    <div style="margin-top:8px;">
      ${ctaButton("Update Payment Method", `${BASE_URL}/dashboard/billing`, "#dc2626")}
    </div>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: brokerEmail,
    subject: "Action required — your Quotzal link expires in 7 days",
    html: emailLayout(body),
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
  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Your Quotzal link has been deactivated</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#374151;">
      Hi ${brokerageName}, your intake form link <strong>quotzal.com/f/${slug}</strong> is no longer accepting submissions.
    </p>

    <p style="margin:0 0 16px;font-size:14px;color:#374151;">
      Your existing submission data has been preserved. You can reactivate your account at any time by subscribing again — your slug and data will be waiting for you.
    </p>

    <div style="margin-top:8px;">
      ${ctaButton("Reactivate My Account", `${BASE_URL}/dashboard/billing`)}
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
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Welcome to Quotzal, ${brokerageName}! 🎉</h2>
    <p style="margin:0 0 20px;font-size:14px;color:#374151;">
      Your account is now active and your intake form link is live:
    </p>

    <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;">
      <a href="${formLink}" style="font-size:16px;font-weight:600;color:#166534;text-decoration:none;">${formLink}</a>
    </div>

    <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#111827;">4 places to share your link:</p>
    <ol style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#374151;line-height:1.8;">
      <li>Add it to your email signature</li>
      <li>Pin it to your social media bio</li>
      <li>Text it to clients who call asking for a quote</li>
      <li>Include it on your website's "Get a Quote" page</li>
    </ol>

    <div style="margin-top:8px;">
      ${ctaButton("Open Your Dashboard", `${BASE_URL}/dashboard`)}
    </div>
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
    ? `
    <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:#1e40af;">
        <strong>Pro tip:</strong> Upgrade to Pro to extend your data retention to 24 months.
      </p>
      <p style="margin:8px 0 0;">
        ${ctaButton("Upgrade to Pro — $39/mo", `${BASE_URL}/dashboard/billing`)}
      </p>
    </div>
    `
    : "";

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Your submission data will be deleted in 30 days</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#374151;">
      Hi ${brokerageName}, <strong>${count} submission${count !== 1 ? "s" : ""}</strong> will be permanently deleted on <strong>${deletionDate}</strong> as part of your data retention policy.
    </p>

    <p style="margin:0 0 20px;font-size:14px;color:#374151;">
      Export your data now to keep a local copy before it's removed.
    </p>

    <div style="margin-bottom:20px;">
      ${ctaButton("Export CSV", `${BASE_URL}/dashboard?export=true`)}
    </div>

    ${upgradePrompt}
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: brokerEmail,
    subject: "Your submission data will be deleted in 30 days",
    html: emailLayout(body),
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
    `<div style="font-size:14px;color:#374151;line-height:1.7;">${body}</div>`
  );

  // Resend batch API supports up to 100 emails per call
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
