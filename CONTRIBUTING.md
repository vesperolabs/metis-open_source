# Contributing

Thanks for your interest in Metis. Contributions should preserve its privacy model, neutral tone and boundary against professional legal advice.

## Before opening a change

- Use fictional names and facts in code, tests, screenshots and issues.
- Never include real messages, court documents, case numbers, contact details or API keys.
- Keep `GROQ_API_KEY` on the server and outside version control.
- Do not add a database, account system or external processor without first documenting the new data flow and privacy consequences.

## Development setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Real AI calls require `GROQ_API_KEY`. For incoming-message work without an API call, set `USE_MANUAL_AI=true`.

## Checks

Run all checks before submitting a pull request:

```bash
npm test
npx tsc --noEmit
npm run build
```

## Prompt and model changes

Prompt changes are product behavior changes. Include a synthetic regression test that demonstrates the intended behavior. Preserve the existing JSON response contract unless the frontend and migration behavior are updated in the same change.

At minimum, verify that a change does not:

- infer hidden motives as facts,
- assume the user is guilty or on the losing side,
- equate calm language with submission,
- vary risk based on gender or parental role,
- present legal conclusions as professional advice,
- expose a draft when the high-risk boundary should apply,
- generate user-facing analysis in a language other than Polish.

## Pull requests

Keep changes focused and explain:

1. what behavior changed,
2. why it helps the user,
3. which privacy or safety boundaries are affected,
4. how the change was tested.

Security issues should not be reported in a public issue. Follow [SECURITY.md](SECURITY.md).
