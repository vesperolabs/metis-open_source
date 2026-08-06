import { NextRequest } from "next/server";
import { extractJsonFromModelResponse } from "@/lib/analysis";
import {
  buildEvaluationUserContent,
  EVALUATION_SYSTEM_PROMPT,
  validateEvaluationResult,
  type EvaluatePayload,
} from "@/lib/evaluation";
import { groqErrorResponse, requestGroqJson } from "@/lib/groq";
import { EVALUATION_RESPONSE_SCHEMA } from "@/lib/groq-schemas";

export async function POST(req: NextRequest) {
  let payload: EvaluatePayload;

  try {
    payload = (await req.json()) as EvaluatePayload;
  } catch {
    return Response.json({ error: "Nie udało się odczytać treści do oceny." }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Brak klucza API. Skonfiguruj GROQ_API_KEY." }, { status: 500 });
  }

  const { context, draft } = payload;

  if (!draft?.trim()) {
    return Response.json({ error: "Brak treści do oceny." }, { status: 400 });
  }

  if (draft.length > 5000) {
    return Response.json(
      { error: "Tekst jest bardzo długi (limit 5 000 znaków). Skróć go i spróbuj ponownie." },
      { status: 400 }
    );
  }

  if (typeof context === "string" && context.length > 20000) {
    return Response.json(
      { error: "Kontekst sprawy jest bardzo długi (limit 20 000 znaków). Skróć opis w ustawieniach kontekstu." },
      { status: 400 }
    );
  }

  const userContent = buildEvaluationUserContent(payload);

  let text = "";
  try {
    text = await requestGroqJson({
      apiKey,
      systemPrompt: EVALUATION_SYSTEM_PROMPT,
      userContent,
      maxCompletionTokens: 2000,
      schemaName: "metis_draft_evaluation",
      schema: EVALUATION_RESPONSE_SCHEMA,
    });
  } catch (error) {
    return groqErrorResponse(error, "Ocena");
  }

  const extracted = extractJsonFromModelResponse(text);
  if (!extracted.ok) {
    return Response.json(
      { error: "Ocena nie powiodła się — spróbuj ponownie za chwilę." },
      { status: 502 }
    );
  }

  const validated = validateEvaluationResult(extracted.data);
  if (!validated) {
    return Response.json(
      { error: "Ocena nie powiodła się — spróbuj ponownie za chwilę." },
      { status: 502 }
    );
  }

  return Response.json(validated);
}
