import assert from "node:assert/strict";
import test from "node:test";
import { EVALUATION_SYSTEM_PROMPT, validateEvaluationResult } from "../lib/evaluation.ts";

test("evaluation validator normalizes a valid result", () => {
  const result = validateEvaluationResult({
    overall_assessment: "SAFE",
    overall_explanation: "Krótka, rzeczowa granica.",
    sentences: [{ text: "Zostaję przy ustalonym terminie.", risk: "SAFE", issue: "", suggestion: "" }],
    revised_draft: "Zostaję przy ustalonym terminie.",
    key_changes: [],
  });
  assert.equal(result?.overall_assessment, "safe");
  assert.equal(result?.sentences[0].risk, "safe");
});

test("evaluation prompt does not equate firmness with risk", () => {
  assert.match(EVALUATION_SYSTEM_PROMPT, /spokojny ton nie oznacza uległości/i);
  assert.match(EVALUATION_SYSTEM_PROMPT, /jasna odmowa/i);
  assert.match(EVALUATION_SYSTEM_PROMPT, /płeć ani rola rodzica nie zmieniają/i);
});

test("evaluation prompt requires every generated text value to be in Polish", () => {
  assert.match(
    EVALUATION_SYSTEM_PROMPT,
    /wszystkie wartości tekstowe.*elementy tablic.*wyłącznie po polsku/i,
  );
});
