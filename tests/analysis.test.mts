import assert from "node:assert/strict";
import test from "node:test";
import {
  canShowHighDraftOverride,
  extractJsonFromModelResponse,
  shouldShowDraftEditor,
  validateAnalysisResult,
  type AnalysisResult,
} from "../lib/analysis.ts";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalyzeUserContent,
} from "../lib/analysis-prompt.ts";

const baseResult: AnalysisResult = {
  risk_level: "MEDIUM",
  risk_explanation: "Ryzyko średnie, bo wiadomość dotyczy zmiany kontaktu.",
  should_reply: "yes",
  decision_explanation: "Warto odpowiedzieć spokojnie.",
  message_summary: "Wiadomość proponuje zmianę terminu kontaktu.",
  recommended_stance: "firm",
  stance_explanation: "Warto podtrzymać dotychczasowe ustalenia.",
  options: ["Podtrzymać termin.", "Zaproponować inną równoważną zmianę."],
  attention_points: ["Nie potwierdzać precedensu."],
  what_not_to_write: ["Nie pisać emocjonalnie."],
  lawyer_questions: [],
  draft_reply: "Cześć, potwierdzam dotychczasowe ustalenia.",
};

function parseAndValidate(input: string) {
  const extracted = extractJsonFromModelResponse(input);
  assert.equal(extracted.ok, true, extracted.ok ? "" : extracted.error);

  const validation = validateAnalysisResult(extracted.data);
  assert.equal(validation.ok, true, validation.ok ? "" : validation.error);

  return validation.data;
}

test("parses JSON with Polish Unicode characters", () => {
  const result = parseAndValidate(JSON.stringify({
    ...baseResult,
    risk_explanation: "Zażółć gęślą jaźń. Wiadomość zawiera presję i zmianę ustaleń.",
    draft_reply: "Cześć, proszę o zachowanie dotychczasowych ustaleń.",
  }));

  assert.equal(result.risk_explanation.includes("Zażółć"), true);
  assert.equal(result.draft_reply.includes("Cześć"), true);
});

test("migrates the original intent-and-traps response shape", () => {
  const legacy = {
    ...baseResult,
    message_summary: undefined,
    attention_points: undefined,
    what_other_side_wants: "Druga strona proponuje zmianę terminu.",
    traps: ["Zmiana może stać się nową praktyką."],
  };

  const result = parseAndValidate(JSON.stringify(legacy));
  assert.equal(result.message_summary, legacy.what_other_side_wants);
  assert.deepEqual(result.attention_points, legacy.traps);
});

test("parses JSON inside markdown json fence", () => {
  const result = parseAndValidate(`\`\`\`json
${JSON.stringify(baseResult, null, 2)}
\`\`\``);

  assert.equal(result.risk_level, "MEDIUM");
});

test("parses JSON with text before and after it", () => {
  const result = parseAndValidate(`Oto analiza:

${JSON.stringify({ ...baseResult, risk_level: "LOW" })}

Mam nadzieję, że pomaga.`);

  assert.equal(result.risk_level, "LOW");
});

test("HIGH with empty draft_reply validates and does not request draft editor", () => {
  const highEmptyDraft = parseAndValidate(JSON.stringify({
    ...baseResult,
    risk_level: "HIGH",
    should_reply: "consult_lawyer",
    lawyer_questions: ["Czy odpowiadać formalnie?"],
    draft_reply: "",
  }));

  assert.equal(highEmptyDraft.draft_reply, "");
  assert.equal(canShowHighDraftOverride(highEmptyDraft), false);
  assert.equal(shouldShowDraftEditor(highEmptyDraft, false), false);
});

test("explicit override with empty HIGH draft still does not show draft editor", () => {
  const highEmptyDraft: AnalysisResult = {
    ...baseResult,
    risk_level: "HIGH",
    should_reply: "consult_lawyer",
    draft_reply: "",
  };

  assert.equal(shouldShowDraftEditor(highEmptyDraft, true), false);
});

test("MEDIUM and LOW with normal draft render draft editor as before", () => {
  const medium: AnalysisResult = { ...baseResult, risk_level: "MEDIUM" };
  const low: AnalysisResult = { ...baseResult, risk_level: "LOW" };

  assert.equal(shouldShowDraftEditor(medium, false), true);
  assert.equal(shouldShowDraftEditor(low, false), true);
});

test("analysis prompt includes the reply goal and only the last three exchanges", () => {
  const userContent = buildAnalyzeUserContent({
    context: "Stały harmonogram opieki.",
    message: "Nowa wiadomość",
    goal: "decline",
    conversationHistory: [1, 2, 3, 4].map((index) => ({
      receivedAt: `2026-08-0${index}`,
      channel: "SMS",
      incomingMessage: `Wiadomość ${index}`,
      userReply: index === 4 ? "Nie wyrażam zgody." : "",
    })),
  });

  assert.equal(userContent.includes("Cel odpowiedzi wybrany przez użytkownika: Odmów"), true);
  assert.equal(userContent.includes("Wiadomość 1"), false);
  assert.equal(userContent.includes("Wiadomość 2"), true);
  assert.equal(userContent.includes("Wiadomość 4"), true);
  assert.equal(userContent.includes("Odpowiedź użytkownika: brak zapisanej odpowiedzi"), true);
  assert.equal(userContent.includes("Odpowiedź użytkownika: Nie wyrażam zgody."), true);
});

test("analysis prompt requires every generated text value to be in Polish", () => {
  assert.match(
    ANALYSIS_SYSTEM_PROMPT,
    /wszystkie wartości tekstowe.*elementy tablic.*wyłącznie po polsku/i,
  );
});
