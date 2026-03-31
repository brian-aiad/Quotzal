# Next.js Patterns Skill

Use when: creating new pages, API routes, or components in the Quotzal codebase.

## App Router Conventions
- All pages use App Router (src/app/)
- API routes use route.ts with named exports (GET, POST, etc.)
- Server components by default; add "use client" only when needed

## Route Structure
- src/app/page.tsx — marketing/landing page
- src/app/dashboard/ — authenticated broker dashboard
- src/app/f/[slug]/ — public intake form (customer-facing)
- src/app/api/ — API routes

## Auth Pattern
- Middleware at src/middleware.ts handles auth redirects
- Dashboard routes require auth via Supabase session
- Public routes (f/[slug], api/submit) do NOT require auth

## Data Fetching
- Server components: fetch directly with Supabase server client
- Client components: use API routes or React hooks
- Public API routes: always use createAdminClient() to bypass RLS

## Component Organization
- Shared UI components: src/components/
- Page-specific components: colocated in the page directory
- Form field components: src/app/f/[slug]/components/fields/
