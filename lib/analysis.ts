export interface AnalysisResult {
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  risk_explanation: string;
  should_reply: "yes" | "no" | "consult_lawyer";
  decision_explanation: string;
  message_summary: string;
  recommended_stance: "neutral" | "firm" | "clarify" | "consult";
  stance_explanation: string;
  options: string[];
  attention_points: string[];
  what_not_to_write: string[];
  lawyer_questions: string[];
  draft_reply: string;
}

export type JsonExtractionResult =
  | { ok: true; data: unknown; extractedJson: string }
  | { ok: false; error: string };

export type AnalysisValidationResult =
  | { ok: true; data: AnalysisResult }
  | { ok: false; error: string };

export function normalizeModelResponseText(input: string) {
  return input
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\u2060]/g, "")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/\u00a0/g, " ");
}

function removeWholeMarkdownFence(input: string) {
  if (!input.startsWith("```") || !input.endsWith("```")) {
    return input;
  }

  const lines = input.split(/\r?\n/);
  if (lines.length < 3 || !lines[0].startsWith("```") || lines[lines.length - 1] !== "```") {
    return input;
  }

  return lines.slice(1, -1).join("\n").trim();
}

function findBalancedJsonObjectFrom(input: string, start: number) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < input.length; i += 1) {
    const char = input[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return input.slice(start, i + 1);
      }
    }
  }

  return null;
}

function findFirstParseableJsonObject(input: string) {
  for (let start = input.indexOf("{"); start !== -1; start = input.indexOf("{", start + 1)) {
    const candidate = findBalancedJsonObjectFrom(input, start);

    if (!candidate) {
      return null;
    }

    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  return null;
}

export function extractJsonFromModelResponse(input: string): JsonExtractionResult {
  const trimmed = normalizeModelResponseText(input).trim();

  if (!trimmed) {
    return { ok: false, error: "Empty response" };
  }

  const withoutFence = normalizeModelResponseText(removeWholeMarkdownFence(trimmed));

  try {
    return {
      ok: true,
      data: JSON.parse(withoutFence),
      extractedJson: withoutFence,
    };
  } catch {
    const extractedJson = findFirstParseableJsonObject(withoutFence);

    if (!extractedJson) {
      return { ok: false, error: "No parseable JSON object found" };
    }

    try {
      return {
        ok: true,
        data: JSON.parse(extractedJson),
        extractedJson,
      };
    } catch {
      return { ok: false, error: "Extracted JSON is invalid" };
    }
  }
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeRiskLevel(value: unknown): AnalysisResult["risk_level"] | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return normalized === "LOW" || normalized === "MEDIUM" || normalized === "HIGH"
    ? normalized
    : null;
}

function normalizeShouldReply(value: unknown): AnalysisResult["should_reply"] | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "yes" || normalized === "no" || normalized === "consult_lawyer") {
    return normalized;
  }
  if (normalized === "consult" || normalized === "lawyer" || normalized === "ask_lawyer") {
    return "consult_lawyer";
  }

  return null;
}

function normalizeRecommendedStance(
  value: unknown,
  riskLevel: AnalysisResult["risk_level"],
  shouldReply: AnalysisResult["should_reply"]
): AnalysisResult["recommended_stance"] {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (normalized === "neutral" || normalized === "firm" || normalized === "clarify" || normalized === "consult") {
      return normalized;
    }
  }

  if (riskLevel === "HIGH" || shouldReply === "consult_lawyer") return "consult";
  return "neutral";
}

export function validateAnalysisResult(value: unknown): AnalysisValidationResult {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, error: "Odpowiedź AI nie jest obiektem JSON." };
  }

  const source = value as Record<string, unknown>;
  const riskLevel = normalizeRiskLevel(source.risk_level);
  const shouldReply = normalizeShouldReply(source.should_reply);

  if (!riskLevel) {
    return { ok: false, error: "Brak poprawnego pola risk_level: LOW, MEDIUM albo HIGH." };
  }

  if (!shouldReply) {
    return { ok: false, error: "Brak poprawnego pola should_reply: yes, no albo consult_lawyer." };
  }

  return {
    ok: true,
    data: {
      risk_level: riskLevel,
      risk_explanation: normalizeString(source.risk_explanation),
      should_reply: shouldReply,
      decision_explanation: normalizeString(source.decision_explanation),
      message_summary:
        normalizeString(source.message_summary) || normalizeString(source.what_other_side_wants),
      recommended_stance: normalizeRecommendedStance(
        source.recommended_stance,
        riskLevel,
        shouldReply
      ),
      stance_explanation: normalizeString(source.stance_explanation),
      options: normalizeStringArray(source.options),
      attention_points:
        normalizeStringArray(source.attention_points).length > 0
          ? normalizeStringArray(source.attention_points)
          : normalizeStringArray(source.traps),
      what_not_to_write: normalizeStringArray(source.what_not_to_write),
      lawyer_questions: normalizeStringArray(source.lawyer_questions),
      draft_reply: normalizeString(source.draft_reply),
    },
  };
}

export function hasDraftReply(result: AnalysisResult) {
  return result.draft_reply.trim().length > 0;
}

export function canShowHighDraftOverride(result: AnalysisResult) {
  return result.risk_level === "HIGH" && hasDraftReply(result);
}

export function shouldShowDraftEditor(result: AnalysisResult, showHighOverride: boolean) {
  if (result.risk_level !== "HIGH") {
    return true;
  }

  return showHighOverride && hasDraftReply(result);
}
