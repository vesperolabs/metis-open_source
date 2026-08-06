export const ANALYSIS_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    risk_level: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
    risk_explanation: { type: "string" },
    should_reply: { type: "string", enum: ["yes", "no", "consult_lawyer"] },
    decision_explanation: { type: "string" },
    message_summary: { type: "string" },
    recommended_stance: {
      type: "string",
      enum: ["neutral", "firm", "clarify", "consult"],
    },
    stance_explanation: { type: "string" },
    options: { type: "array", items: { type: "string" } },
    attention_points: { type: "array", items: { type: "string" } },
    what_not_to_write: { type: "array", items: { type: "string" } },
    lawyer_questions: { type: "array", items: { type: "string" } },
    draft_reply: { type: "string" },
  },
  required: [
    "risk_level",
    "risk_explanation",
    "should_reply",
    "decision_explanation",
    "message_summary",
    "recommended_stance",
    "stance_explanation",
    "options",
    "attention_points",
    "what_not_to_write",
    "lawyer_questions",
    "draft_reply",
  ],
} as const;

export const EVALUATION_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    overall_assessment: {
      type: "string",
      enum: ["safe", "caution", "risky"],
    },
    overall_explanation: { type: "string" },
    sentences: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          text: { type: "string" },
          risk: { type: "string", enum: ["safe", "caution", "risky"] },
          issue: { type: "string" },
          suggestion: { type: "string" },
        },
        required: ["text", "risk", "issue", "suggestion"],
      },
    },
    revised_draft: { type: "string" },
    key_changes: { type: "array", items: { type: "string" } },
  },
  required: [
    "overall_assessment",
    "overall_explanation",
    "sentences",
    "revised_draft",
    "key_changes",
  ],
} as const;
