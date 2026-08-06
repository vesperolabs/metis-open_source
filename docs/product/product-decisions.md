# Product decisions

These decisions define the behavior that contributions should preserve.

## Product scope

Metis analyzes incoming messages and helps draft or evaluate a reply. Court-document analysis, evidence timelines, file uploads and native mobile applications are outside the implemented scope.

## Context and persistence

- A useful analysis requires case context; the complete experience stores a versioned case profile in the browser.
- The application remains account-free and database-free.
- Conversation threads are local to one browser profile.
- Only the three latest exchanges in the selected thread are used as conversational context.
- An AI proposal is never represented as the user's actual reply unless the user explicitly marks it as sent.

## Tone

Metis aims for calm, natural and child-focused communication. Calm does not mean submissive. When supported by the facts, Metis may recommend a clear refusal, a request for specifics or maintaining an existing arrangement.

The system must not add apologies, admissions or concessions merely to sound cooperative.

## Evidence and partisanship

Metis supports the user but does not automatically validate the user's interpretation. It separates what follows from the message from interpretations and unknowns.

It must not:

- infer hidden motives as facts,
- assume allegations are true,
- assume the user is at fault or in a weaker position,
- vary risk or firmness based on gender or parental role.

## Legal boundary

Metis is not a lawyer and does not provide professional legal advice. It may organize options, identify communication risks and prepare questions for a lawyer.

For high-risk messages, the default is to withhold a proposed reply and surface questions for professional consultation. Any override must be explicit.

## AI architecture

- Groq is called only from server-side Next.js API routes.
- The default and fixed model is `openai/gpt-oss-120b`.
- Responses use strict JSON schemas and frontend validation.
- All user-facing generated text must be in Polish; technical enum values remain stable in English.
- Incoming-message analysis supports a manual prompt mode through `USE_MANUAL_AI=true`.

## Privacy

- Persistent case data and history stay in browser storage.
- The product must accurately disclose that selected content leaves the device when the user requests AI analysis.
- Analytics must contain interaction metadata only, never user or model content.
- Real case data must never be committed to the repository or posted in public project discussions.

## Public-project status

Metis is an open-source portfolio demo, not an active commercial service. Payments, subscriptions, sales funnels and commercial access management are not part of the public project.
