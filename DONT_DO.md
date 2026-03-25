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

### [March 2026] — Claude Code added unrequested features during a polish task
- What happened: While running a UI polish task, Claude Code made additional commits 
  adding rate limiting, email verification, success pages, and security headers
- What caused it: Claude Code continued working autonomously between tasks
- What to never do again: Always stop and ask before adding ANY feature not in the 
  current prompt. Never auto-commit work that wasn't requested.