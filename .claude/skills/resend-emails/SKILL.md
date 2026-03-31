# Resend Email Templates Skill

Use when: editing email templates, adding new emails, or debugging email delivery.

## Setup
- Templates live in: src/lib/emails/
- FROM address: noreply@quotzal.com (must be verified in Resend dashboard)
- All templates share a design system — match the emerald brand colors

## The 11 Templates
1. broker-notification — client submitted a form
2. customer-confirmation — sent to client after submission
3. demo-link — sent to demo requester
4. trial-reminder-7 — 7 days before trial ends
5. trial-reminder-3 — 3 days before trial ends
6. trial-reminder-1 — 1 day before trial ends
7. payment-failed — with link to update card in Stripe Portal
8. link-deactivated — when subscription cancels
9. welcome — after first successful payment
10. deletion-warning — before data purge
11. webhook-error-alert — goes to ADMIN_EMAIL on Stripe failures

## Rules
- All templates must use the shared HTML design system
- Test with real Resend API key in dev — don't mock emails
- RESEND_API_KEY must be in .env.local and Vercel env vars
