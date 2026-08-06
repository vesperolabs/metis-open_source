# Metis contributor instructions

Metis is a Polish-language communication assistant for people navigating high-conflict family disputes.

## Product boundary

Metis does not replace a lawyer and must not present professional legal advice. It helps organize information, identify communication risks, prepare questions for a lawyer and draft neutral, calm but firm messages.

## Priorities

- privacy and data minimization,
- evidence-based, gender-symmetric analysis,
- de-escalation without forced submission,
- auditable structured output,
- clear boundaries around professional legal advice,
- synthetic tests instead of real case material.

## Repository structure

- `app/` — Next.js pages, components and API routes
- `lib/` — product logic, prompts, schemas, storage and analytics
- `tests/` — automated tests using fictional data
- `docs/product/` — current behavior and product decisions
- `docs/design/` — design system

## Data safety

- Never add real messages, court documents, names, case numbers, contact details or credentials to code, tests, documentation, logs, issues or pull requests.
- Keep `GROQ_API_KEY` and any analytics key outside version control.
- AI calls must remain server-side.
- Analytics must never contain message text, case context, generated output or sent replies.
- Before committing, inspect the diff for personal data and secrets.

## Verification

Run:

```bash
npm test
npx tsc --noEmit
npm run build
```

Prompt changes require a synthetic regression test and must preserve the structured frontend contract unless the whole contract is intentionally migrated.

## Next.js

This project uses Next.js 16. Read the relevant local guide in `node_modules/next/dist/docs/` before changing framework-specific APIs or conventions.

## Design

Read `docs/design/design-system.md` before making visual changes. Do not change the visual direction without an explicit design decision.
