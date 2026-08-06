import { NextRequest } from "next/server";
import { extractJsonFromModelResponse, validateAnalysisResult } from "@/lib/analysis";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalyzeUserContent,
  buildManualAnalyzePrompt,
  type AnalyzePayload,
} from "@/lib/analysis-prompt";
import { groqErrorResponse, requestGroqJson } from "@/lib/groq";
import { ANALYSIS_RESPONSE_SCHEMA } from "@/lib/groq-schemas";

function manualModeResponse(prompt: string, reason: string) {
  return Response.json({ manualMode: true, reason, prompt });
}

function logModelParseIssue(rawText: string, error: string) {
  if (process.env.NODE_ENV === "production") {
    console.warn("Metis analyze parse issue", { error, responseLength: rawText.length });
    return;
  }

  console.warn("Metis analyze parse issue", { error, rawText });
}

export async function POST(req: NextRequest) {
  let payload: AnalyzePayload;

  try {
    payload = (await req.json()) as AnalyzePayload;
  } catch {
    return Response.json({ error: "Nie udało się odczytać danych analizy." }, { status: 400 });
  }

  const { context, message } = payload;

  if (!message?.trim() || !context?.trim()) {
    return Response.json({ error: "Brak wiadomości lub kontekstu sprawy." }, { status: 400 });
  }

  if (message.length > 10000) {
    return Response.json(
      { error: "Wiadomość jest bardzo długa (limit 10 000 znaków). Skróć ją lub podziel na części." },
      { status: 400 }
    );
  }

  if (context.length > 20000) {
    return Response.json(
      { error: "Kontekst sprawy jest bardzo długi (limit 20 000 znaków). Skróć opis w ustawieniach kontekstu." },
      { status: 400 }
    );
  }

  if (
    payload.conversationHistory !== undefined &&
    !Array.isArray(payload.conversationHistory)
  ) {
    return Response.json({ error: "Historia wątku ma niepoprawny format." }, { status: 400 });
  }

  const historyCharacters = (payload.conversationHistory || []).reduce(
    (sum, exchange) =>
      sum +
      (typeof exchange?.incomingMessage === "string" ? exchange.incomingMessage.length : 0) +
      (typeof exchange?.userReply === "string" ? exchange.userReply.length : 0),
    0
  );
  if ((payload.conversationHistory?.length || 0) > 3 || historyCharacters > 12000) {
    return Response.json(
      { error: "Historia wątku jest zbyt długa. Do analizy można dołączyć trzy ostatnie wymiany." },
      { status: 400 }
    );
  }

  const userContent = buildAnalyzeUserContent(payload);
  const manualPrompt = buildManualAnalyzePrompt(userContent);
  const apiKey = process.env.GROQ_API_KEY;

  if (process.env.USE_MANUAL_AI === "true") {
    return manualModeResponse(manualPrompt, "Manual mode enabled");
  }

  if (!apiKey) {
    return manualModeResponse(manualPrompt, "Missing GROQ_API_KEY");
  }

  try {
    const text = await requestGroqJson({
      apiKey,
      systemPrompt: ANALYSIS_SYSTEM_PROMPT,
      userContent,
      maxCompletionTokens: 2400,
      schemaName: "metis_message_analysis",
      schema: ANALYSIS_RESPONSE_SCHEMA,
    });
    const extracted = extractJsonFromModelResponse(text);

    if (!extracted.ok) {
      logModelParseIssue(text, extracted.error);
      return Response.json(
        { error: "Analiza nie powiodła się — spróbuj ponownie za chwilę." },
        { status: 502 }
      );
    }

    const validation = validateAnalysisResult(extracted.data);
    if (!validation.ok) {
      logModelParseIssue(extracted.extractedJson, validation.error);
      return Response.json(
        { error: "Analiza nie powiodła się — spróbuj ponownie za chwilę." },
        { status: 502 }
      );
    }
    return Response.json(validation.data);
  } catch (error) {
    return groqErrorResponse(error, "Analiza");
  }
}
