# Project structure

## Purpose

Quotzal is an insurance-broker intake application. Its reviewed development checkpoint is retained for future work. See [CLAUDE.md](../CLAUDE.md), [BUILD.md](../BUILD.md) and [DONT_DO.md](../DONT_DO.md) for application-specific guidance.

## Canonical workspace

- Windows: `C:/Users/kingt/Desktop/Projects/quotzal`
- Mac: `/Users/brianaiad/Desktop/Projects/quotzal`
- Use these as actual project directories, not shortcuts or symlinks.
- Repository: `brian-aiad/Quotzal`.
- Current working branch: `sync/2026-10-19-reviewed`, shared across the two devices.

Filesystem relocation from Code/Projects to these physical Desktop directories is pending final verification.

Start in this existing checkout, inspect Git status, fetch origin, and reconcile local work before updating. Reuse this folder for each session. The reviewed branch contains work ahead of `main`; do not replace it with the older main checkout. Promotion to main remains pending the known schema, security and validation issues recorded in the shared context and repository review checkpoint.

## Folder map

| Path | Contents |
| --- | --- |
| `src/app/` | Next.js routes, broker dashboard, public intake and server API handlers. |
| `src/components/` | Shared application components. |
| `src/lib/` | Validation, application types, email and external-service integrations. |
| `public/` | Runtime assets served directly by Next.js. |
| `supabase/schema.sql`, `supabase/migrations/` | Versioned database definition and migration source. |
| `tests/` | Offline regression checks and browser tests. |
| `docs/` | Project organization and maintained supporting documentation. |
| `AGENTS.md`, `CLAUDE.md`, `BUILD.md`, `DONT_DO.md` | Assistant entry points and application-specific guidance. |
| `node_modules/`, `.next/`, `test-results/` | Local dependencies and generated build/test output. |

Keep runtime assets and imports at their established paths. Use logical project categories consistently without renaming framework directories or moving assets that existing code references.

## Commands

Run from the repository root:

```sh
npm run dev
node --test tests/2026-10-19-review-regressions.cjs
npx tsc --noEmit
npm run lint
npm run build
```

The development command uses port 3006. Browser tests require a correctly configured local target and dedicated test credentials; their existing default target must be reviewed before running. The offline regression suite uses service doubles. Do not run migrations, invitation/email jobs or tests against production data as part of routine workspace organization.

## Shared context

Read `OneDrive/Downloads/AI_Brain/START_HERE.md`, then `Projects/quotzal/CONTEXT.md` inside that brain. Update the project note after meaningful verified work with branch/commit, checks, decisions and next steps. Record a failed or deferred check accurately. Keep detailed source history in Git and existing repository documents.

## History/recovery

The old baseline and review worktrees have been consolidated into the canonical project. Their commits and branches remain available in Git. Verified source/ignored-file archives, Git history, manifests and the original Windows startup edits are under `C:/Users/kingt/Code/Archive/quotzal/2026-11-19-consolidation`. A safety stash also preserves the Windows startup edits that matched the Mac commit. Private configuration and authentication state remain local and excluded from Git.
