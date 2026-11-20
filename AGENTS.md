# Quotzal agent instructions

<!-- AI_BRAIN_STANDARD:BEGIN -->
## Shared AI context and working standard

The single maintained project context is in OneDrive's `Downloads/AI_Brain`:
- Windows: `%USERPROFILE%\OneDrive\Downloads\AI_Brain`
- Mac: `~/Library/CloudStorage/OneDrive-Personal/Downloads/AI_Brain`

Before work, read `START_HERE.md`, `WORKFLOW.md`, and `Projects/quotzal/CONTEXT.md` in that brain. Follow this repository's technical and release rules as well.

Reuse the existing real checkout: Windows `%USERPROFILE%/Desktop/Projects/quotzal`; Mac `~/Code/Projects/quotzal`. Inspect branch, remotes, and local changes, preserve unfinished work, fetch the existing origin, and reconcile the intended shared branch safely. Do not create another permanent clone for an iteration.

After meaningful work, run the required and relevant checks, commit and push according to the user's authorization, then update the shared project `CONTEXT.md` with date/device, verified result, branch/commit, checks, remaining work, and next step. Verify receiving-device source and note contents before claiming synchronization.

Keep current handoff and status in the shared brain; dated repository notes are historical evidence and implementation references. Keep credentials and private operational data out of Git and shared notes. If OneDrive is unavailable, preserve local work and report the pending context update without creating another authoritative brain.
<!-- AI_BRAIN_STANDARD:END -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project guidance

Read [CLAUDE.md](CLAUDE.md) for application safeguards and the shelved review checkpoint. Continue on `sync/2026-10-19-reviewed`; do not replace it with older `main`. Main promotion and deployment remain blocked by the documented schema, dependency, and validation issues. Routine organization does not apply database migrations or send emails.
