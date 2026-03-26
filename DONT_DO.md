## Instructions
Paste this file at the start of any new Claude Code session.
Update this file whenever something goes wrong.

## Known Issues
(Empty for now — add entries as you discover problems)

## Format for new entries:
### [Date] — [What broke]
- What happened:
- What caused it:
- What to never do again:


### 2026-03-20 — broker_links must be created alongside broker row
- What happened: /f/[slug] returned 404 even though broker existed in DB
- What caused it: broker_links row was missing — the page requires both a brokers row AND a broker_links row with is_primary=true
- What to never do again: Never create a broker row without immediately creating a corresponding broker_links row. The onboarding wizard (Task 6) must insert both in the same transaction.

### 2026-03-20 — broker slug and broker_links slug must be different
- What happened: INSERT into broker_links with same slug as brokers table was blocked by the global slug uniqueness trigger
- What caused it: The trigger correctly prevents duplicate slugs across tables
- What to never do again: broker_links primary link slug must be different from the brokers.slug value. Use a suffix like "-link" or a UUID-based slug for the primary link.

### 2026-03-25 — Custom fields must be scoped per-step and per-insurance-type
- What happened: Custom fields were only scoped to the form level (all on Personal Info step)
- What caused it: Original CustomField type only had `applies_to` (insurance type filter) but no step assignment
- What to never do again: Do not scope custom fields only to the form level — they must be per-step and per-insurance-type. The `CustomField` type in `form-config.ts` has both `step` and `insuranceType` fields.

### [March 2026] — Claude Code added unrequested features during a polish task
- What happened: While running a UI polish task, Claude Code made additional commits
  adding rate limiting, email verification, success pages, and security headers
- What caused it: Claude Code continued working autonomously between tasks
- What to never do again: Always stop and ask before adding ANY feature not in the
  current prompt. Never auto-commit work that wasn't requested.

### 2026-03-25 — FormPreview only renders legacy FormConfig fields
- What happened: Preview phone mockup on My Form page did not show/hide new extended fields (occupation, homeowner, annualMileage, etc.) when toggled
- What caused it: FormPreview only received legacy FormConfig which maps a subset of fields. ExtendedFormConfig fields were invisible to the preview.
- What to never do again: When adding new configurable fields to ExtendedFormConfig, always ensure the FormPreview component also receives extendedConfig and renders the new fields. The preview must show every toggleable field.

### 2026-03-25 — navigator.sendBeacon sends text/plain by default
- What happened: Form config changes could be lost on page close because sendBeacon sent JSON as text/plain, not application/json
- What caused it: sendBeacon(url, string) defaults to text/plain content type
- What to never do again: Always use `new Blob([json], { type: 'application/json' })` when calling sendBeacon with JSON payloads.

### 2026-03-25 — Submission detail panel must show extended_fields from form_data
- What happened: Extended fields (policyNumber, yearsWithCarrier, occupation, etc.) were saved correctly in form_data.extended_fields but not displayed in the broker's submission detail panel
- What caused it: The panel only read direct columns (current_carrier, current_limits) and did not parse form_data.extended_fields
- What to never do again: When adding new fields to the intake form, always verify the data appears in: (1) Review step, (2) Submit API, (3) Email notification, (4) Submission detail panel. All four must be checked.

### 2026-03-26 — Onboarding "broker already exists" on Stripe checkout cancel
- What happened: User completes onboarding, goes to Stripe checkout, cancels, returns to /onboarding. Clicking "Start Free Trial" again shows "A broker with this email or slug already exists"
- What caused it: save-onboarding API used INSERT which fails with 23505 on retry because the broker was already created on the first attempt. Also, handleCheckoutSuccess tried to INSERT broker_links again even though save-onboarding already created them.
- What to never do again: Any onboarding/setup API that creates rows must handle retries gracefully — use upsert logic (check-then-update or check-then-insert). Never assume the user will only hit the endpoint once. Always consider the cancelled-checkout-retry flow.

### 2026-03-26 — Landing page mobile horizontal overflow
- What happened: Landing page had 15px horizontal overflow on 375px mobile viewport
- What caused it: Some elements in the hero section exceeded the viewport width
- What to never do again: Always add `overflow-x-hidden` on full-page wrappers, especially landing pages with absolute-positioned decorative elements. Run Playwright mobile viewport tests.