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

### 2026-03-30 — Audit: check-slug endpoint had no rate limiting
- What happened: The /api/check-slug public endpoint had no rate limiting, allowing potential abuse
- What caused it: Rate limiting was added to submit-form and demo/create but overlooked for check-slug
- What to never do again: Every public API endpoint (no auth required) must have rate limiting. When adding a new public route, always add checkRateLimit() as the first operation.

### 2026-03-30 — Audit: env.ts only logged missing vars instead of throwing
- What happened: Missing environment variables were logged with console.error but the app would continue running in a broken state
- What caused it: validateEnv() used console.error instead of throwing an Error
- What to never do again: Environment validation must throw on missing required vars. A silent log lets the app start up and fail later with cryptic errors.

### 2026-03-30 — Audit: schema.sql missing form_config column and broker slug trigger
- What happened: The form_config JSONB column was used in code (form-config PATCH route) but missing from schema.sql. Also, the global slug uniqueness trigger only existed on broker_links, not on brokers.
- What caused it: Schema wasn't updated when form_config was added to the codebase. The trigger was only written for one direction.
- What to never do again: schema.sql is the single source of truth. When adding a new column or feature that touches the database, update schema.sql first. Global uniqueness constraints must be bidirectional (both tables need triggers).

### 2026-03-30 — Audit: Static inline styles must use Tailwind
- What happened: Several components used style={{}} with static values like height: 600, boxShadow, backgroundColor with hardcoded hex colors
- What caused it: Quick implementation without converting to Tailwind arbitrary value syntax
- What to never do again: Only use inline styles for dynamic Pro brand color injection (accent_color/brand_color from DB). All static styles must use Tailwind classes, including arbitrary values like h-[600px] or bg-emerald-600.

### 2026-03-31 — toast.success and toast.error were systematically swapped
- What happened: ~10 places in settings, form, and billing pages had success messages calling toast.error() and error messages calling toast.success()
- What caused it: Likely a find-and-replace or migration from a custom toast system that inverted the method names
- What to never do again: After migrating any notification system, grep for all toast calls and verify that success messages use toast.success() and error messages use toast.error(). The patterns are: `if (res.ok) → toast.success()` and `else → toast.error()`.

### 2026-03-31 — Rate limit routes missing standard HTTP headers
- What happened: All 3 public rate-limited routes (submit-form, demo/create, check-slug) returned 429 without X-RateLimit-Limit, X-RateLimit-Remaining, or Retry-After headers
- What caused it: checkRateLimit() only returned { allowed, remaining } without limit or resetAt info
- What to never do again: Any rate-limited endpoint must include X-RateLimit-Limit, X-RateLimit-Remaining on ALL responses (200 and 429) and Retry-After on 429 responses. Use rateLimitHeaders() helper from rate-limit.ts.

### 2026-03-31 — Dead code: unused ThankYou component and legacy toast.tsx
- What happened: src/app/f/[slug]/components/thank-you.tsx was imported but never rendered (thank-you UI was inline in intake-form.tsx). src/components/toast.tsx was a legacy custom toast system replaced by sonner but never deleted.
- What caused it: Components replaced by inline implementations or library migrations without cleanup
- What to never do again: When replacing a component with an inline implementation or library, delete the old component file AND remove its import. Grep for unused imports after migrations.

### 2026-03-26 — Current Insurance step disappears when toggling individual fields
- What happened: In the dashboard form editor, toggling off "Current Carrier" (Show OFF) caused the entire Current Insurance step to vanish from both the config panel and preview. The step count dropped (e.g., 6→5 for Auto Personal) and the UI jumped to Review & Submit.
- What caused it: `extendedToLegacyConfig()` tied `current_insurance.enabled` to a single field (`currentCarrier`). When that field was hidden, the legacy config marked the entire step as disabled, which `buildPreviewSteps()` used to exclude the step.
- What to never do again: Never tie a step's visibility to a single field toggle. The Current Insurance step has a base "Currently insured?" yes/no question that should always be present. Step visibility should depend on whether the type has current_insurance fields defined at all (`FIELDS_BY_TYPE`), not on whether any individual field is currently shown.