import assert from "node:assert/strict";
import test from "node:test";
import { ANALYSIS_EVAL_SCENARIOS, scoreAnalysisScenario } from "../lib/analysis-evals.ts";
import { ANALYSIS_SYSTEM_PROMPT } from "../lib/analysis-prompt.ts";
import type { AnalysisResult } from "../lib/analysis.ts";

test("synthetic suite covers risk levels, stances and gender-paired cases", () => {
  assert.ok(ANALYSIS_EVAL_SCENARIOS.length >= 10);
  const risks = new Set(ANALYSIS_EVAL_SCENARIOS.flatMap((scenario) => scenario.expected.riskLevels));
  const stances = new Set(ANALYSIS_EVAL_SCENARIOS.flatMap((scenario) => scenario.expected.stances));
  assert.deepEqual([...risks].sort(), ["HIGH", "LOW", "MEDIUM"]);
  assert.deepEqual([...stances].sort(), ["clarify", "consult", "firm", "neutral"]);

  for (const scenario of ANALYSIS_EVAL_SCENARIOS.filter((item) => item.pairedWith)) {
    const pair = ANALYSIS_EVAL_SCENARIOS.find((item) => item.id === scenario.pairedWith);
    assert.ok(pair, `Missing pair for ${scenario.id}`);
    assert.deepEqual(scenario.expected, pair.expected);
  }
});

test("contract scorer accepts a calm firm boundary and rejects an apologetic concession", () => {
  const scenario = ANALYSIS_EVAL_SCENARIOS.find((item) => item.id === "firm-father");
  assert.ok(scenario);
  const base: AnalysisResult = {
    risk_level: "MEDIUM",
    risk_explanation: "Jednostronna zmiana ustaleń.",
    should_reply: "yes",
    decision_explanation: "Warto podtrzymać termin.",
    message_summary: "Wiadomość odwołuje ustalony weekend.",
    recommended_stance: "firm",
    stance_explanation: "Jasna granica jest uzasadniona.",
    options: ["Podtrzymać termin."],
    attention_points: ["Nie potwierdzać zmiany."],
    what_not_to_write: [],
    lawyer_questions: [],
    draft_reply: "Trzymajmy się ustalonego harmonogramu — weekend zgodnie z planem.",
  };

  assert.equal(scoreAnalysisScenario(base, scenario).passed, true);
  assert.equal(
    scoreAnalysisScenario({ ...base, draft_reply: "Przepraszam, masz rację. Postaram się dostosować." }, scenario).passed,
    false
  );
});

test("analysis prompt encodes the neutral, evidence-based and gender-symmetric contract", () => {
  assert.match(ANALYSIS_SYSTEM_PROMPT, /nie zakładasz, że użytkownik jest na słabszej pozycji/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /płeć i rola rodzica nie wpływają/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /spokojny ton nie oznacza zgody/i);
  assert.match(ANALYSIS_SYSTEM_PROMPT, /nie przypisujesz drugiej stronie intencji bez dowodów/i);
  assert.doesNotMatch(ANALYSIS_SYSTEM_PROMPT, /what_other_side_wants/);
});
