import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("trust and legal routes stay public and linked from the shared footer", () => {
  const gate = source("app/components/DemoGate.tsx");
  const chrome = source("app/components/AppChrome.tsx");

  for (const route of ["/bezpieczenstwo", "/prywatnosc", "/regulamin"]) {
    assert.match(gate, new RegExp(`\"${route}\"`));
    assert.match(chrome, new RegExp(`href=\"${route}\"`));
  }
});

test("public access copy only offers the demo and contact for a code", () => {
  const publicAccessSurfaces = [
    "app/page.tsx",
    "app/components/AccessCodeLinks.tsx",
    "app/components/DemoGate.tsx",
    "app/components/FullAccessCard.tsx",
    "app/regulamin/page.tsx",
  ].map(source).join("\n");

  assert.doesNotMatch(publicAccessSurfaces, /19,99|planowana cena|program wsparcia/i);
  assert.match(publicAccessSurfaces, /Napisz po kod/);
  assert.match(publicAccessSurfaces, /jednorazow(?:e|ym) demo/i);
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

test("terms describe the current code-based beta without public pricing", () => {
  const terms = source("app/regulamin/page.tsx");

  assert.match(terms, /wersja beta/);
  assert.match(terms, /Jak otrzymać kod/);
  assert.doesNotMatch(terms, /19,99|Cena:/);
  assert.match(terms, /w ciągu 14 dni/);
});
