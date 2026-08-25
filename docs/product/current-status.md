# Metis current status

Last verified: 2026-08-22

## Status

Metis is maintained as a working open-source portfolio demo. It is not an active commercial service, does not accept payments and has no service-level commitment.

The reference interface is in Polish and targets communication in Polish family disputes. The application provides organizational and writing assistance, not professional legal advice.

## Implemented

- Public landing page and a static example analysis that does not call an AI API.
- One real quick-try analysis with temporary browser-session context.
- Public access to the complete demonstration experience without an account or code.
- Versioned case profile stored in `localStorage`, including names, context and writing-style samples.
- Separate local conversation threads containing incoming messages, analyses, proposed replies and replies explicitly marked as sent.
- Up to three recent confirmed exchanges used as context for the next analysis in a thread.
- Reply goals: maintain arrangements, decline, request specifics, propose an alternative or let Metis choose.
- Incoming-message analysis and reply drafting through Groq using `openai/gpt-oss-120b`.
- Sentence-by-sentence evaluation of the user's own draft.
- Strict structured JSON output with frontend validation.
- Explicit Polish-language output requirement for all user-facing generated text.
- High-risk boundary that can withhold a draft and prepare questions for a lawyer.
- Gender-symmetric and evidence-based prompt rules: calm can be firm, allegations are not assumed true and hidden intentions are not presented as facts.
- Vercel Web Analytics for page views and optional content-free PostHog events.
- Optional voice-to-text input for case context, received messages and the user's own draft. Every transcript is shown in an editable field before use.
- Public security, privacy and terms pages in the application.
- Synthetic tests for response contracts, safety behavior, local persistence and API failure handling.

## Data and privacy boundaries

- There are no user accounts or central case database.
- Case profiles and conversation history stay in the browser until the user removes them or browser storage is cleared.
- AI requests send the selected message and required context to the Next.js server and Groq.
- The Groq API key stays server-side.
- Voice recordings are sent to ElevenLabs only after an explicit action. Metis does not store raw audio and the ElevenLabs API key stays server-side.
- Analytics must never contain messages, case context, generated responses or sent replies.
- Local storage does not synchronize across devices and is not a backup.

## Known limitations

- The one-analysis demo limit is enforced in the browser and is not abuse-resistant.
- Voice-transcription limits are browser-local (three recordings per calendar month and three minutes per recording), so they are not abuse-resistant.
- ElevenLabs' default data-retention terms apply to audio submitted for transcription; the public demo cannot promise zero retention from that provider.
- Conversation history has no export, import or cross-device synchronization.
- `/api/evaluate` requires Groq and has no manual fallback.
- Model output quality can vary even with a strict schema and synthetic regression tests.
- The deployment may be changed or discontinued because this is a portfolio project.

## Sources of truth

- Implementation: `app/` and `lib/`
- Tests: `tests/`
- Architecture: `ARCHITECTURE.md`
- Product decisions: `docs/product/product-decisions.md`
