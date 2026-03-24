# QUOTZAL — Claude Code Constitution
## Master Reference | Updated March 2026

---

## Project Identity

- **App name:** Quotzal
- **Domain:** quotzal.com
- **Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase, Stripe, Resend, Google Places
- **Pricing:** Starter $19/month · Pro $39/month
- **Form links:** quotzal.com/f/[slug]
- **Customer:** Independent solo insurance broker
- **Local path:** `C:\Users\kingt\Desktop\quotzal`
- **Test form:** `http://localhost:3000/f/tb-primary`
- **Admin email:** csbrianaiad@gmail.com

---

## Project Status (as of March 2026)

All 13 tasks are complete. The codebase is in **bugfix and polish mode**.
Do not start new features unless explicitly requested. Do not refactor working code. Fix only what is reported.

| Task | Status |
|---|---|
| Task 1 — Dependencies | ✅ Complete |
| Task 2 — Database Schema | ✅ Complete |
| Task 3 — Auth | ✅ Complete |
| Task 4 — Public Intake Form | ✅ Complete |
| Task 5 — Broker Dashboard | ✅ Complete |
| Task 6 — Onboarding Wizard | ✅ Complete |
| Task 7 — Stripe Webhooks | ✅ Complete |
| Task 8 — Settings & Billing | ✅ Complete |
| Task 9 — Email Templates | ✅ Complete |
| Task 10 — Cron Jobs | ✅ Complete |
| Task 11 — Super Admin Dashboard | ✅ Complete |
| Task 12 — Demo & Marketing | ✅ Complete |
| Task 13 — My Form & Polish | ✅ Complete |

---

## PRIME DIRECTIVE — AUTONOMOUS EXECUTION

This is a solo-builder project. Claude Code has full autonomy to execute tasks without asking for permission.

**DO NOT ask for confirmation before coding.**
**DO NOT present a plan and wait.**
**DO NOT say "Waiting for your confirmation."**

Instead, for every task:
1. Print 2–3 lines stating what you are building and which files you will touch
2. Start coding immediately
3. When done, report what was built, what to test, and remind to commit

**The only exception:** If a task requires touching more than 8 files OR would delete/overwrite a
currently working feature — stop, flag it once clearly, then wait. Everything else: just build it.

---

## SESSION START

Begin every session with:
```
Working on Quotzal — insurance intake SaaS. Reading DONT_DO.md. Task: [task]. Building now.
```
Then start immediately. No waiting.

---

## PROTECT — Never Touch These

- Never touch `.env.local` under any circumstances
- Never modify files unrelated to the current task
- Never install a package without stating what it is and why
- Never overwrite working code without explicit instruction
- Never refactor working code unless explicitly asked
- Never add features that were not requested

---

## CODE STANDARDS

- TypeScript only — no `any` types ever
- All components must have typed interfaces
- Always handle error and loading states — no silent failures
- Tailwind classes only — no inline styles
- Mobile responsive on every component
- One component per file
- Files: `kebab-case` · Components: `PascalCase` · Functions: `camelCase`
- No `console.log` in any file
- No placeholder or dummy components — real implementation only
- No complex solution when a simple one exists

---

## THINK AHEAD — Before Writing Any Code

Actively scan for these and resolve them proactively. If something requires manual action, print it as a flag:

```
⚠️ ISSUE FOUND: [what the problem is]
FIX: [what you did or what needs to be done manually]
```

Check for:
- Schema mismatches between DB columns and what the code expects
- Missing environment variables the new code will need
- API routes that will be called but don't exist yet
- RLS violations — public routes need `createAdminClient()`, not `createClient()`
- Duplicate logic that already exists elsewhere in the codebase
- Changes that break existing working features
- TypeScript type gaps — new DB columns need new types

---

## CRITICAL RULES — Lessons Learned

These caused real bugs. Read every one before touching anything.

### ⚠ Always use `createAdminClient()` in public pages and API routes
`createClient()` enforces RLS — public routes get blocked.
`/f/[slug]` and `/api/submit-form` MUST use `createAdminClient()`.
Only use `createClient()` inside authenticated dashboard pages where a user session exists.

### ⚠ `broker_links` row must be created alongside the `brokers` row
The onboarding wizard must insert BOTH a `brokers` row AND a `broker_links` row together.
`/f/[slug]` returns 404 if a broker exists but has no `is_primary` broker_links row.

### ⚠ `brokers.slug` and `broker_links.slug` must be different values
The global slug uniqueness trigger blocks duplicates across all tables.
Use: `brokers.slug = chosen-slug`, `broker_links.slug = chosen-slug-link` (or any unique suffix).
The public form at `/f/[slug]` looks up `broker_links` first — that slug is the shareable link.

### ⚠ Violation types are exactly 8 (reduced from 16 in March 2026)
Current 8: Speeding (1-10), Speeding (11-20), Speeding (21+), DUI/DWI, At-Fault Accident,
Not-At-Fault Accident, Reckless Driving, Other Moving Violation.
If types are ever changed, update Playwright stress test selectors at the same time.

### ⚠ Never pre-select a violation type
Marital Status defaults to Single. Violation type does NOT pre-select — user must actively choose.
This is intentional. Do not change it.

### ⚠ Vehicle 1 is always auto-added
`getDefaultTypeData` seeds one empty vehicle in `auto_personal` and `auto_commercial`.
Both vehicle components guard against empty array. Do not remove this.

### ⚠ 6-step wizard step order is final
| Step | Content |
|---|---|
| 1 | Insurance Type |
| 2 | Personal Info |
| 3 | Drivers (auto types only — others skip to step 5) |
| 4 | Vehicles (auto types only) |
| 5 | Current Insurance |
| 6 | Review & Submit |
Non-auto types skip steps 3 and 4. Do not reorder or renumber.
If a step is disabled via form_config, remove it from the navigation array dynamically — do not shift step numbers.

### ⚠ No dropdown placeholders — real options only
All dropdowns open showing real options. No "Select a..." placeholder.
Current Carrier: datalist with 25 common US insurers + free type.
Coverage Limits: datalist with 10 common limit combos + free type.

### ⚠ form_config is a JSONB column on brokers — always pass from server component
Never fetch form_config client-side inside the preview or intake form.
Always fetch it in the server component (`/f/[slug]/page.tsx`) and pass it down as a prop.

---

## DATABASE SCHEMA — Quick Reference

| Table | Key Fields |
|---|---|
| `brokers` | id, email, brokerage_name, slug, logo_url, brand_color, phone, address, plan, status, insurance_types_enabled[], stripe_customer_id, stripe_subscription_id, trial_ends_at, sent_trial_reminders (jsonb), form_config (jsonb) |
| `broker_links` | id, broker_id, slug (unique), label, is_primary, is_active |
| `submissions` | id, broker_id, link_id, insurance_type, status, form_data (JSONB), first_name, last_name, email, phone, date_of_birth, has_current_insurance, current_carrier, scheduled_deletion_at, deletion_warning_sent_at |
| `payments` | id, broker_id, amount, status, stripe_invoice_id (unique), period_start, period_end |
| `demo_requests` | id, email, brokerage_name, full_name, phone, demo_slug (unique), expires_at, converted |

**form_config default shape:**
```json
{
  "fields": {
    "date_of_birth":         { "enabled": true, "required": false },
    "phone":                 { "enabled": true, "required": false },
    "current_insurance":     { "enabled": true, "required": false },
    "vin":                   { "enabled": true, "required": false },
    "driver_license_number": { "enabled": true, "required": false },
    "marital_status":        { "enabled": true, "required": false },
    "sr22":                  { "enabled": true, "required": false },
    "violations":            { "enabled": true, "required": false }
  },
  "custom_fields": []
}
```

**Migration SQL — run in Supabase SQL editor if form_config column is missing:**
```sql
ALTER TABLE brokers
ADD COLUMN IF NOT EXISTS form_config jsonb DEFAULT
'{"fields":{"date_of_birth":{"enabled":true,"required":false},"phone":{"enabled":true,"required":false},"current_insurance":{"enabled":true,"required":false},"vin":{"enabled":true,"required":false},"driver_license_number":{"enabled":true,"required":false},"marital_status":{"enabled":true,"required":false},"sr22":{"enabled":true,"required":false},"violations":{"enabled":true,"required":false}},"custom_fields":[]}';
```

- RLS enabled on all tables
- Global slug uniqueness trigger on `broker_links`
- Test broker ID: `558f597c-4f1a-421e-8852-0f8c827721b2`
- Test slug: `tb-primary`

---

## KEY FILES — What Lives Where

```
src/
  app/
    f/[slug]/
      page.tsx              ← server component, slug lookup (uses createAdminClient)
      intake-form.tsx       ← 6-step wizard (client component)
    (auth)/
      login/page.tsx
      signup/page.tsx
    auth/callback/route.ts
    dashboard/
      page.tsx              ← broker dashboard home
      layout.tsx            ← sidebar nav + mobile hamburger
      settings/page.tsx
      billing/page.tsx
      form/page.tsx         ← My Form / Form Studio page
    onboarding/page.tsx
    admin/
      page.tsx              ← super admin overview
      brokers/[id]/page.tsx
      submissions/page.tsx
      broadcast/page.tsx
    demo/page.tsx
    page.tsx                ← marketing landing page
    api/
      submit-form/route.ts          ← uses createAdminClient
      check-slug/route.ts
      create-stripe-customer/route.ts
      create-checkout-session/route.ts
      create-portal-session/route.ts
      demo/create/route.ts
      webhooks/stripe/route.ts
      dashboard/
        form/route.ts               ← GET broker form data
        form/update-config/route.ts ← PUT form_config to brokers table
      cron/
        trial-reminders/route.ts
        data-retention/route.ts
  components/
    dashboard/
      form-preview.tsx      ← read-only live phone-frame preview component
  lib/
    utils.ts                ← cn() helper
    stripe.ts               ← Stripe server client
    supabase/
      client.ts             ← browser client (dashboard authenticated pages only)
      server.ts             ← server client (dashboard authenticated pages only)
      admin.ts              ← service role client (all public routes)
    emails/
      index.ts              ← all email sending functions
    types/
      intake-form.ts        ← all TypeScript types including FormConfig
middleware.ts               ← session refresh + route protection
supabase/schema.sql         ← full DB schema
tests/
  intake-form.spec.ts
  full-form-stress-test.spec.ts
CLAUDE.md                   ← this file
DONT_DO.md                  ← running log of what broke and why
vercel.json                 ← cron configuration
```

---

## AFTER EVERY TASK

1. List every file created or modified
2. Explain what changed in plain English
3. Tell exactly what to test and how to verify it works
4. End with: `Ready to commit. Run: git add . && git commit -m "feat/fix: [description]" && git push`

---

## ENVIRONMENT VARIABLES — Required Checklist

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_PASSWORD
STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_STARTER_PRICE_ID
STRIPE_PRO_PRICE_ID
RESEND_API_KEY
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
ADMIN_EMAIL
NEXT_PUBLIC_BASE_URL
PRODUCTION_URL
CRON_SECRET
```

---

## QUICK REFERENCE URLS

| What | URL |
|---|---|
| Local dev | http://localhost:3000 |
| Test form | http://localhost:3000/f/tb-primary |
| Live app | https://quotzal.com |
| Admin panel | https://quotzal.com/admin |
| GitHub | https://github.com/brian-aiad/Quotzal |
| Supabase | https://supabase.com/dashboard (project: quotzal-prod) |
| Stripe | https://dashboard.stripe.com |
| Resend | https://resend.com |
| Vercel | https://vercel.com |
| Cloudflare | https://dash.cloudflare.com |

---

*Quotzal — Insurance Broker Intake SaaS · CLAUDE.md · Updated March 2026*
