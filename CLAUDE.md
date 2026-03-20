# QUOTZAL — Claude Code Constitution

## Project Identity
- App name: Quotzal
- Domain: quotzal.com
- Stack: Next.js 15, TypeScript, Tailwind CSS, Supabase, Stripe, Resend
- Pricing: Starter $19/month, Pro $39/month
- Form links: quotzal.com/f/[slug]
- Customer: Independent solo insurance broker

## PRIME DIRECTIVE
Before writing any code:
1. State what you are building
2. List every file you will create or modify
3. Describe your approach in plain English
4. Wait for confirmation

Never skip this. Never start coding without confirmation.

## PROTECT
- Never touch .env.local under any circumstances
- Never modify files unrelated to the current task
- Never install a package without stating what it is and why
- Never overwrite working code without explicit instruction
- If touching more than 3 files, stop and ask first

## CODE STANDARDS
- TypeScript only — no any types ever
- All components must have typed interfaces
- Always handle error and loading states — no silent failures
- Tailwind classes only — no inline styles
- Mobile responsive on every component
- One component per file
- Files: kebab-case. Components: PascalCase. Functions: camelCase

## AFTER EVERY TASK
- List every file created or modified
- Explain what changed and why in plain English
- Tell me exactly what to test and how to verify it works
- Remind me to commit before moving to the next task

## DONT DO
- No features that were not requested
- No refactoring working code unless asked
- No placeholder or dummy components — build the real thing
- No console.log in any file
- No complex solution when a simple one exists
- Never start the next task if the current one is not committed

## SESSION START
Begin every session with:
"Working on Quotzal — insurance intake SaaS.
Reading DONT_DO.md...
Task: [state task]
Files I will touch: [list them]
Plan: [plain English approach]
Waiting for your confirmation."