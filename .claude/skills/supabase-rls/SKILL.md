# Supabase + RLS Skill

Use when: writing DB queries, adding tables, debugging RLS errors,
or adding new API routes that touch the database.

## Critical Rules for Quotzal
- ALL public API routes use createAdminClient() from src/lib/supabase/admin.ts
- Regular server client (src/lib/supabase/server.ts) is for dashboard routes only
- NEVER bypass RLS from client-side code

## Slug Uniqueness — Most Common Bug
- brokers.slug and broker_links.slug must be globally unique ACROSS BOTH TABLES
- Convention: broker_links.slug = brokers.slug + "-link"
- There is a DB trigger enforcing this — if you hit a unique violation, check both tables

## Tables
- brokers — one per broker account (has plan, status, stripe IDs)
- broker_links — one per shareable form link, linked to brokers
- submissions — all client form data as JSONB in form_data column
- payments — invoice history
- demo_requests — from marketing page, not linked to a broker

## Adding a New Migration
1. Create new file in supabase/migrations/ with timestamp prefix
2. NEVER edit 001_initial_schema.sql or any existing migration
3. Run in Supabase dashboard SQL editor

## Debugging RLS Errors
If you get "row not found" in a public route, you're using server client.
Switch to createAdminClient(). RLS blocks service routes on purpose.
