# QUOTZAL — Claude Code Context

## What This Is
Insurance intake/quoting platform with an embeddable widget (inline form + floating button modes). Users embed widget.js on their site. Leads captured via intake form, stored in Supabase, emailed via Resend.

## Tech Stack
- Next.js (TypeScript, App Router)
- Supabase (auth + database) — schema in /supabase/schema.sql
- Stripe — Starter: price_1TD94DE13aQ2nFtGN0eLOiHE | Pro: price_1TD96LE13aQ2nFtGCAa0rUVL
- Resend — transactional email
- Google Places API + Google Maps API — address autocomplete/validation
- Playwright — E2E tests in /tests/

## Project Structure
- /src/app — Next.js App Router pages
- /src/components — React components
- /src/lib — utilities, helpers, API clients
- /supabase — schema.sql + .temp/
- /tests — Playwright E2E specs

## Key Files
- /supabase/schema.sql — single source of truth for DB schema
- /src/middleware.ts — auth middleware, do not break auth routes
- /settings.local.json — local dev config
- DONT_DO.md — READ THIS before any task, hard constraints

## Widget System
The embeddable widget (widget.js) has two modes:
- Inline Form — renders form directly in the page
- Floating Button — green pill button, opens modal on click, Escape/backdrop closes it
The slug and base URL must be correct in the snippet. Test in a real HTML file, not just unit tests.

## Stripe Rules
- NEVER hardcode price IDs — always reference env vars
- STRIPE_STARTER_PRICE_ID and STRIPE_PRO_PRICE_ID are in .env.local
- Webhook secret is STRIPE_WEBHOOK_SECRET — validate every webhook

## Testing
- Run Playwright tests before marking any form/widget task done
- Test files: intake-form.spec.ts, customer-form-field.spec.ts, form-config.spec.ts, full-form-stress-test.spec.ts, preview-reactivity.spec.ts, current-insurance-e2e.ts
- Always run: npx playwright test before committing

## Workflow
- Read DONT_DO.md before starting
- Plan first, code second
- Commit after each completed task (terminal says "Recommend committing before the next task")
- Never touch .env.local — use .env.example for reference only

## Environment Variables (reference names only, never log values)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY / STRIPE_WEBHOOK_SECRET
- STRIPE_STARTER_PRICE_ID / STRIPE_PRO_PRICE_ID
- RESEND_API_KEY
- NEXT_PUBLIC_GOOGLE_PLACES_API_KEY / NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

## Common Commands
- npm run dev — start dev server
- npx playwright test — run all E2E tests
- npx playwright test --ui — visual test runner
- npx supabase db push — push schema changes