# Security policy

Metis handles potentially sensitive family communication. The public repository and demo must never be used to publish real case data.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting feature for this repository. Do not open a public issue containing exploit details, credentials, private messages or personal data.

Include:

- the affected route or component,
- steps to reproduce using synthetic data,
- the likely impact,
- a suggested mitigation if you have one.

## Supported version

Only the current `main` branch is maintained. This portfolio project has no service-level agreement or guaranteed response time.

## Security boundaries

- `GROQ_API_KEY`, `ELEVENLABS_API_KEY` and any personal PostHog key must stay outside Git.
- AI provider calls must remain server-side.
- Voice recordings may be sent to ElevenLabs only after an explicit transcription action. Metis must not persist raw audio, log transcripts, or expose `ELEVENLABS_API_KEY` to the browser.
- Analytics must not contain message text, case context, generated output or sent replies.
- Browser storage is local persistence, not encrypted backup or cross-device storage.
- The public demo has no user accounts or authentication; browser storage is accessible to anyone using that browser profile.
- Metis is not suitable for emergency communication or professional legal advice.

If you accidentally publish a real credential or personal case data, revoke or remove access immediately before attempting a normal code fix.
