# Stripe Webhook Skill

Use when: debugging Stripe webhooks, adding new webhook handlers,
or testing subscription lifecycle events.

## Quotzal Webhook Setup
- Handler lives at: src/app/api/webhooks/stripe/route.ts
- Always verify signature first before processing
- All 4 events must stay idempotent (won't double-record replayed events)

## The 4 Events We Handle
1. invoice.paid → record payment, set broker status = active
2. payment_intent.payment_failed → set status = past_due, send payment-failed email
3. customer.subscription.deleted → set status = cancelled, deactivate broker_links row
4. customer.subscription.updated → sync plan field on brokers table

## Testing Locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger invoice.paid

## Price IDs
- Starter: price_1TD94DE13aQ2nFtGN0eLOiHE
- Pro: price_1TD96LE13aQ2nFtGCAa0rUVL

## Rules
- Never skip signature verification (STRIPE_WEBHOOK_SECRET)
- Always use createAdminClient() in this route (not regular server client)
- Log webhook errors and send admin alert email on failure
