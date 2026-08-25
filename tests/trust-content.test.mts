import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("trust and legal routes stay linked from the shared footer", () => {
  const chrome = source("app/components/AppChrome.tsx");

  for (const route of ["/bezpieczenstwo", "/prywatnosc", "/regulamin"]) {
    assert.match(chrome, new RegExp(`href=\"${route}\"`));
  }
});

test("complete portfolio demo is public without an access code or sales funnel", () => {
  const publicAccessSurfaces = [
    "app/page.tsx",
    "app/components/PublicDemoCard.tsx",
    "app/regulamin/page.tsx",
    "app/prywatnosc/page.tsx",
    "app/bezpieczenstwo/page.tsx",
  ].map(source).join("\n");

  assert.doesNotMatch(publicAccessSurfaces, /19,99|planowana cena|program wsparcia|napisz po kod|kod dostępu|pełna wersja beta|WhatsApp/i);
  assert.match(publicAccessSurfaces, /publiczn(?:e|ym) demo/i);
  assert.match(publicAccessSurfaces, /bez konta/i);
  assert.match(publicAccessSurfaces, /bez kodu/i);
  assert.match(source("app/layout.tsx"), /\{children\}/);
  assert.doesNotMatch(source("app/layout.tsx"), /DemoGate/);
});

test("privacy surfaces name the operator, processors and analytics guardrails", () => {
  const privacy = source("app/prywatnosc/page.tsx");
  const security = source("app/bezpieczenstwo/page.tsx");
  const analytics = source("lib/analytics.ts");

  assert.match(privacy, /Kacper Staroszczyk/);
  assert.match(privacy, /kacper\.staroszczyk@gmail\.com/);
  for (const processor of ["Groq", "Vercel", "PostHog"]) {
    assert.match(`${privacy}\n${security}`, new RegExp(processor));
  }
  assert.match(analytics, /persistence: \"memory\"/);
  assert.match(analytics, /autocapture: false/);
  assert.match(analytics, /disable_session_recording: true/);
});

test("terms describe a free public portfolio demo", () => {
  const terms = source("app/regulamin/page.tsx");

  assert.match(terms, /publicznym demem portfolio/);
  assert.match(terms, /bezpłatne/i);
  assert.match(terms, /nie wymaga kodu/i);
  assert.doesNotMatch(terms, /19,99|Cena:/);
  assert.doesNotMatch(terms, /pełna wersja beta|Jak otrzymać kod|WhatsApp/i);
});

test("voice transcription visibly confirms when recording is active", () => {
  const voiceInput = source("app/components/VoiceTranscribeButton.tsx");

  assert.match(voiceInput, /Nagrywanie — możesz mówić/);
  assert.match(voiceInput, /Zatrzymaj i przepisz/);
  assert.match(voiceInput, /animate-pulse/);
  assert.match(voiceInput, /aria-live="polite"/);
});

test("Vercel Web Analytics is mounted globally without case-content tracking", () => {
  const layout = source("app/layout.tsx");
  const architecture = source("ARCHITECTURE.md");

  assert.match(layout, /@vercel\/analytics\/next/);
  assert.match(layout, /<VercelAnalytics \/>/);
  assert.match(architecture, /Vercel Web Analytics/);
  assert.match(architecture, /does not send case content/i);
});
