const REQUIRED_SERVER_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_STARTER_PRICE_ID",
  "STRIPE_PRO_PRICE_ID",
  "RESEND_API_KEY",
  "ADMIN_EMAIL",
  "CRON_SECRET",
];

let validated = false;

export function validateEnv(): void {
  if (validated) return;
  const missing = REQUIRED_SERVER_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[ENV] Missing required environment variables: ${missing.join(", ")}`);
  }
  validated = true;
}
