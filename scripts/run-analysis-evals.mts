import { extractJsonFromModelResponse, validateAnalysisResult } from "../lib/analysis.ts";
import { ANALYSIS_EVAL_SCENARIOS, scoreAnalysisScenario } from "../lib/analysis-evals.ts";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalyzeUserContent } from "../lib/analysis-prompt.ts";
import { requestGroqJson } from "../lib/groq.ts";
import { ANALYSIS_RESPONSE_SCHEMA } from "../lib/groq-schemas.ts";

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) {
  console.error("Ustaw GROQ_API_KEY, aby uruchomić syntetyczny zestaw ocen.");
  process.exit(1);
}

let passed = 0;

for (const scenario of ANALYSIS_EVAL_SCENARIOS) {
  const text = await requestGroqJson({
    apiKey,
    systemPrompt: ANALYSIS_SYSTEM_PROMPT,
    userContent: buildAnalyzeUserContent({
      context: scenario.context,
      message: scenario.message,
      channel: "Test syntetyczny",
      date: "2026-01-15",
    }),
    maxCompletionTokens: 2400,
    schemaName: "metis_message_analysis",
    schema: ANALYSIS_RESPONSE_SCHEMA,
  });
  const extracted = extractJsonFromModelResponse(text);
  const validation = extracted.ok ? validateAnalysisResult(extracted.data) : null;

  if (!validation?.ok) {
    console.log(`${scenario.id}: FAIL (niepoprawna odpowiedź)`);
    continue;
  }

  const score = scoreAnalysisScenario(validation.data, scenario);
  if (score.passed) passed += 1;
  console.log(`${scenario.id}: ${score.passed ? "PASS" : "FAIL"}`, score.checks);
}

console.log(`\nWynik: ${passed}/${ANALYSIS_EVAL_SCENARIOS.length}`);
process.exitCode = passed === ANALYSIS_EVAL_SCENARIOS.length ? 0 : 1;
