# Quotzal

Start with [AGENTS.md](AGENTS.md) for the OneDrive AI_Brain workflow and this project's current shared context. Keep the project rules below; record current status in the shared brain.

B2B SaaS for insurance brokers to collect client intake information.
Brokers configure multi-step intake forms (8 insurance types), share links
or embed a widget, and manage submissions in a dashboard.
Monetized via Stripe subscriptions (Starter/Pro) with free trial.

## Tech Stack
- Next.js 16 App Router, TypeScript strict mode, React 19
- Supabase (Postgres + Auth + RLS + SSR cookies)
- Tailwind CSS v4
- Stripe (checkout, billing portal, webhooks)
- Resend (7+ transactional email templates)
- Google Places API + Google Maps API (address autocomplete)
- Playwright (13 E2E test suites)
- Vercel (hosting + cron jobs)

## Project Structure
- /src/app/(auth)/          — login, signup, forgot-password, verify-email
- /src/app/onboarding/      — post-signup wizard + Stripe checkout
- /src/app/dashboard/       — broker dashboard (submissions, form editor, billing, settings, renewals)
- /src/app/admin/           — admin panel (broker mgmt, broadcast emails, impersonation)
- /src/app/f/[slug]/        — public embeddable intake form
- /src/app/api/             — 35 API routes
- /src/lib/supabase/        — client.ts, server.ts, admin.ts, middleware.ts
- /src/lib/emails/index.ts  — all Resend email templates
- /src/lib/types/           — form-config.ts, intake-form.ts, dashboard.ts
- /src/lib/env.ts           — env validation (throws on missing vars)
- /src/lib/sanitize.ts      — HTML escaping for XSS protection
- /public/widget.js         — embeddable widget (inline + floating button modes)
- /supabase/schema.sql      — single source of truth for DB schema
- /tests/                   — 13 Playwright spec files

## Database — 5 Tables
RLS enabled on all tables.
- brokers        — 1:1 with auth.users, has form_config (JSONB), stripe IDs, plan, status, trial_ends_at
- broker_links   — shareable form links, FK → brokers, globally unique slug
- submissions    — leads/intake data, FK → brokers + broker_links, form_data (JSONB), scheduled_deletion_at
- payments       — Stripe invoice history, FK → brokers
- demo_requests  — demo signups, RLS enabled but NO policies (service role only)

Key constraints:
- Slug uniqueness enforced via DB trigger across brokers, broker_links, demo_requests
- Public submission inserts must go through the validated submit-form API; the reviewed migration revokes direct anonymous inserts.
- demo_requests has no RLS policies — admin access via service role only

## Auth
- Supabase email/password, SSR cookie-based sessions
- Two roles: broker (auth'd user owns their data) and admin (hardcoded ADMIN_EMAIL env var)
- No RBAC — each broker is owner of their own rows only
- /dashboard/* and /onboarding → redirect to /login if no session
- /admin/* → ADMIN_EMAIL only
- /f/[slug] → fully public, no auth

## Stripe
- Plans: Starter (STRIPE_STARTER_PRICE_ID) and Pro (STRIPE_PRO_PRICE_ID)
- Broker status: trialing / active / past_due / cancelled / suspended
- Webhooks handled: invoice.paid, invoice.payment_failed, subscription.deleted, subscription.updated
- ALWAYS validate webhook signature using STRIPE_WEBHOOK_SECRET
- Onboarding uses upsert to handle retry after cancelled checkout

## Cron Jobs (Vercel)
- /api/cron/trial-reminders  — 10 AM UTC daily
- /api/cron/data-retention   — 2 AM UTC daily
- Protected by CRON_SECRET Bearer header

## Commands
- npm run dev              — start dev server
- npm run build            — production build
- npm run lint             — ESLint check
- npx playwright test      — run all E2E tests
- npx playwright test --ui — visual Playwright runner
- npx supabase db push     — push schema changes

## Rules
- NEVER use service role key client-side
- ALWAYS scope broker queries by auth.uid() — brokers own only their data
- NEVER skip RLS — every new table needs policies
- ALWAYS validate Stripe webhook signatures
- ALWAYS use env.ts for env vars — it throws on missing, never add raw process.env elsewhere
- ALWAYS sanitize user input through sanitize.ts before inserting to DB
- Custom form fields MUST be scoped per-step AND per-insurance-type
- /f/[slug] must remain publicly accessible with no auth requirement
- X-Frame-Options must stay SAMEORIGIN except for /f/* routes (embeddable)
- TypeScript strict mode — no implicit any
- Tailwind utility classes only, no custom CSS
- Named exports only, no default exports
- NEVER commit .env files

## Known Gotchas (from DONT_DO.md)
- broker + broker_links must be created together in onboarding
- sendBeacon must use Blob for JSON content-type
- Slug uniqueness is enforced by DB trigger — never assume it in app code
- schema.sql is the single source of truth — always keep it in sync after migrations

## Review checkpoint — 2026-10-19

- Project shelved at the user's request; preserve this checkpoint without deploying or expanding it.
- Review branch retains the three unpublished feature commits and reviewed cleanup.
- Run offline regressions: `node --test tests/2026-10-19-review-regressions.cjs`.
- The pipeline/intake migration is prepared but UNAPPLIED. Validate against a disposable database before any deployment. It maps `new` to `intake`, `reviewed` to `reviewing`, adds tags/first-open tracking columns, and revokes direct public inserts.
- Do not deploy this checkpoint: Next.js 16.2.0 has critical audit advisories, and authenticated end-to-end/database tests remain outstanding.
- Authenticated Playwright setup requires dedicated `QUOTZAL_TEST_EMAIL` and `QUOTZAL_TEST_PASSWORD`; never run these tests against a production account.
