# QUOTZAL AUTONOMOUS BUILD — REMAINING TASKS

## Rules
- Work through ALL tasks in order, one at a time
- Run `npm run build` after each task to verify it compiles
- Fix any TypeScript or build errors before moving to the next task
- Run `git add . && git commit -m "feat: [task name]" && git push` after each working task
- ONLY stop if human action is required outside the codebase
- When human action is needed, print:

=== HUMAN ACTION REQUIRED ===
1. [exact step]
2. [exact step]
Type "continue" when done.
==============================

---

## TASK 9 — Email Templates

Create src/lib/emails/index.ts with all email sending functions using Resend.

Functions to create:

sendNewSubmissionEmail(brokerEmail, submission):
- Subject: "New [insuranceType] — [firstName] [lastName]"
- Body: customer info, 2-3 line type summary, current insurance, CTA → /dashboard?submission=[id]

sendCustomerConfirmationEmail(customerEmail, submission, brokerName, brokerLogo?):
- Subject: "Your [type] quote request has been received — [brokerName]"
- Body: full submitted data by section, footer with brokerEmail, logo in header if Pro

sendDemoEmail(email, name, demoSlug):
- Subject: "Your Quotzal demo link is ready"
- Body: demo link, expires 7 days, Sign Up CTA

sendTrialEndingEmail(brokerEmail, brokerageName, daysLeft, submissionCount):
- Subject: 7="Your Quotzal trial — 7 days left", 3="Your trial ends in 3 days", 1="Your Quotzal link expires tomorrow"
- CTA → /dashboard/billing

sendPaymentFailedEmail(brokerEmail, brokerageName, amount):
- Subject: "Action required — your Quotzal link expires in 7 days"
- Body: couldn't process $[amount], link active 7 more days, Update Payment Method CTA

sendLinkDeactivatedEmail(brokerEmail, brokerageName, slug):
- Subject: "Your Quotzal link has been deactivated"
- Body: link deactivated, data preserved, Reactivate CTA

sendWelcomeEmail(brokerEmail, brokerageName, slug):
- Subject: "Welcome to Quotzal, [brokerageName]! 🎉"
- Body: live link, 4 sharing ideas, Open Dashboard CTA

sendDeletionWarningEmail(brokerEmail, brokerageName, count, deletionDate, isPro):
- Subject: "Your submission data will be deleted in 30 days"
- Body: count submissions deleting on date, Export CSV CTA, upgrade prompt if not Pro

sendBroadcastEmail(emails, subject, body):
- Sends same email to multiple broker emails via Resend

Dev from: "onboarding@resend.dev"
Prod from: "noreply@quotzal.com"

Use plain HTML strings (not React Email). Clean, minimal, mobile-readable.

---

## TASK 10 — Cron Jobs

Create vercel.json at project root:
{
  "crons": [
    { "path": "/api/cron/trial-reminders", "schedule": "0 10 * * *" },
    { "path": "/api/cron/data-retention", "schedule": "0 2 * * *" }
  ]
}

Create src/app/api/cron/trial-reminders/route.ts:
- Verify CRON_SECRET header matches process.env.CRON_SECRET
- Find all brokers where status = 'trialing'
- For each, calculate days until trial_ends_at
- Send trial ending email at exactly 7, 3, and 1 days remaining
- Track sent emails in broker.sent_trial_reminders jsonb column
- Only send each reminder once per broker

Create src/app/api/cron/data-retention/route.ts:
- Verify CRON_SECRET header
- Find submissions where scheduled_deletion_at <= now() + 30 days AND deletion_warning_sent_at IS NULL
- Group by broker_id, send deletion warning email, set deletion_warning_sent_at = now()
- Hard delete submissions where scheduled_deletion_at <= now()
- Log counts

CRON_SECRET is already in .env.local. If missing, note it in human action block.

---

## TASK 11 — Super Admin Dashboard

Middleware already protects /admin/* (returns 404 if email != ADMIN_EMAIL).
All queries use createAdminClient (bypasses RLS).

Create src/app/admin/page.tsx — Overview:
- 6 stat cards: Total Brokers, Active, Trialing, Past Due, Cancelled/Suspended, Total Submissions, MRR (Active Starter × 1900 + Active Pro × 3900)
- Brokers table: Brokerage Name (link to /admin/brokers/[id]), Email, Plan pill, Status pill, Submission count, Joined date
- Real-time search by name or email, filter by status + plan

Create src/app/admin/layout.tsx:
- Simple dark sidebar layout
- Links: Overview, All Submissions, Broadcast
- Show logged-in admin email at bottom

Create src/app/admin/brokers/[id]/page.tsx — Broker Detail:
- All broker fields displayed
- Payment history table
- Override Plan dropdown (starter/pro) + Save with confirmation modal
- Override Status dropdown (trialing/active/past_due/cancelled/suspended) + Save
- Impersonate button: sets cookie 'admin_impersonating_broker_id' = broker.id, redirects to /dashboard
- Dashboard layout must check for this cookie and show red banner "⚠ ADMIN VIEW — Impersonating [name] [Exit]"
- Exit button clears cookie, redirects to /admin
- Suspend, Reactivate, Cancel buttons with confirmation modals

Create src/app/admin/submissions/page.tsx:
- All submissions across all brokers, read-only
- Filter by broker, insurance type, date range
- Export CSV button

Create src/app/admin/broadcast/page.tsx:
- Subject input, body textarea
- Recipient filter: All active / Trialing / Pro / Starter / Past Due
- Preview: "You are about to email [N] brokers"
- Send button with confirmation, uses sendBroadcastEmail from lib/emails

---

## TASK 12 — Demo Flow & Marketing Page

Create src/app/api/demo/create/route.ts:
- POST: creates demo_requests record
- Generates demo_slug: "demo-" + slugified brokerage name + random 4 digits
- Creates broker_links record with slug, is_active=true, expires 7 days
- Sends demo email via sendDemoEmail
- Returns { demoSlug, email }

Create src/app/demo/page.tsx:
- Form: Brokerage Name, Full Name, Email, Phone (optional)
- On submit: POST to /api/demo/create
- Success screen: "Your demo link is ready — check your email at [email]"

Update src/app/f/[slug]/page.tsx:
- If slug found in demo_requests and expires_at < now(): show expired page
- "This demo has expired. Ready to get your real Quotzal link?" + "Sign Up Free" → /signup

Create src/app/page.tsx — Marketing Landing Page:
Section 1 — Hero:
- Headline: "Send a link. Get everything you need."
- Subtext: "Insurance brokers: stop chasing clients for info."
- CTAs: "Get your free demo link" → /demo, "See pricing" → #pricing

Section 2 — How It Works:
- 3 steps: Send link → Client fills form → You get organized email

Section 3 — Sample email preview (styled HTML showing real submission sections)

Section 4 — Pricing (id="pricing"):
- Starter $19/mo: 1 link, all 8 types, dashboard, email, CSV, 12mo retention, Powered by Quotzal branding, 30-day trial
- Pro $39/mo: Everything + unlimited aliases, white label, renewal reminders, PDF export, 24mo retention
- CTAs → /signup?plan=starter and /signup?plan=pro

Section 5 — FAQ (accordion):
- What info does the form collect?
- Is it secure?
- Can I use my own branding?
- What happens after a client submits?
- Can I cancel anytime?
- Does it work on mobile?

Section 6 — Footer: Logo, tagline, /demo /login /signup links, Terms, Privacy, Copyright

Dark navy hero. White body. Mobile responsive. Professional and clean.

---

## TASK 13 — My Form Page & Final Polish

Create src/app/dashboard/form/page.tsx:

Section 1 — Primary Link
- Display "quotzal.com/f/[slug]" in styled box
- One-click copy button, "Open form" button

Section 2 — Link Aliases (Pro only)
- List broker_links where is_primary=false
- Each row: slug, label, copy button, deactivate toggle
- "+ Create New Alias" modal with slug input + label + availability check
- Starter: locked with upgrade CTA

Section 3 — Insurance Type Toggles
- Toggle cards for all 8 types
- Saves to brokers.insurance_types_enabled immediately
- Block disabling last enabled type

Section 4 — Form Preview
- Iframe loading /f/[slug]?preview=true
- In preview mode: show form but disable submission

FINAL POLISH:
1. Loading skeletons on dashboard submissions table
2. Toast notifications (success/error) — simple custom component
3. aria-labels on all form fields
4. 404 page at src/app/not-found.tsx — clean, branded
5. Error page at src/app/error.tsx
6. Metadata (title/description) on all pages via generateMetadata
7. Mobile sidebar collapses to hamburger at < 768px
8. Favicon check — ensure favicon.ico exists
9. Update signup page copy from "14-day" to "30-day free trial"
10. Print checklist of all required env vars

---

## After all tasks complete, print:

=== BUILD COMPLETE ===
Tasks completed: 9, 10, 11, 12, 13
All commits pushed to main.

REMAINING HUMAN ACTIONS FOR LAUNCH:
1. Deploy to Vercel and add all env vars
2. Connect quotzal.com domain in Vercel
3. Add Stripe production webhook endpoint
4. Switch Stripe to live mode and update price IDs
5. Verify Resend domain and update from addresses
6. Run final pre-launch checklist
======================
```

Save that file, then in Claude Code run:
```
claude --dangerously-skip-permissions
```

Then paste:
```
Read BUILD.md and execute all tasks autonomously starting 
with Task 9. Do not stop unless human action is required 
outside the codebase. Fix all errors before moving to next 
task. Commit after each task.