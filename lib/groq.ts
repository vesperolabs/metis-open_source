export const GROQ_MODEL = "openai/gpt-oss-120b";
export const GROQ_REQUEST_TIMEOUT_MS = 30_000;

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

export type GroqErrorKind =
  | "rate_limit"
  | "timeout"
  | "invalid_response"
  | "provider";

export class GroqRequestError extends Error {
  readonly kind: GroqErrorKind;
  readonly status?: number;
  readonly retryAfter?: string;

  constructor(
    kind: GroqErrorKind,
    message: string,
    status?: number,
    retryAfter?: string
  ) {
    super(message);
    this.name = "GroqRequestError";
    this.kind = kind;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

type GroqJsonRequest = {
  apiKey: string;
  systemPrompt: string;
  userContent: string;
  maxCompletionTokens: number;
  schemaName: string;
  schema: Record<string, unknown>;
  timeoutMs?: number;
};

type GroqCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

export async function requestGroqJson({
  apiKey,
  systemPrompt,
  userContent,
  maxCompletionTokens,
  schemaName,
  schema,
  timeoutMs = GROQ_REQUEST_TIMEOUT_MS,
}: GroqJsonRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        max_completion_tokens: maxCompletionTokens,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: schemaName,
            strict: true,
            schema,
          },
        },
      }),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new GroqRequestError("timeout", "Groq request timed out");
    }

    throw new GroqRequestError(
      "provider",
      error instanceof Error ? error.message : "Groq request failed"
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const retryAfter = response.headers.get("retry-after") || undefined;
    if (response.status === 429) {
      throw new GroqRequestError(
        "rate_limit",
        "Groq rate limit exceeded",
        response.status,
        retryAfter
      );
    }

    throw new GroqRequestError(
      "provider",
      `Groq returned HTTP ${response.status}`,
      response.status,
      retryAfter
    );
  }

  let data: GroqCompletionResponse;
  try {
    data = (await response.json()) as GroqCompletionResponse;
  } catch {
    throw new GroqRequestError("invalid_response", "Groq returned invalid JSON");
  }

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new GroqRequestError("invalid_response", "Groq returned empty content");
  }

  return content;
}

export function groqErrorResponse(error: unknown, operation: "Analiza" | "Ocena") {
  const failure = error instanceof GroqRequestError ? error : null;

  console.warn("Metis Groq request failed", {
    operation,
    kind: failure?.kind || "unknown",
    status: failure?.status,
  });

  if (failure?.kind === "rate_limit") {
    return Response.json(
      { error: "Limit zapytań został chwilowo wykorzystany. Odczekaj chwilę i spróbuj ponownie." },
      {
        status: 429,
        headers: failure.retryAfter ? { "Retry-After": failure.retryAfter } : undefined,
      }
    );
  }

  if (failure?.kind === "timeout") {
    return Response.json(
      { error: `${operation} trwała zbyt długo. Spróbuj ponownie za chwilę.` },
      { status: 504 }
    );
  }

  if (failure?.kind === "invalid_response") {
    return Response.json(
      { error: `${operation} nie powiodła się — spróbuj ponownie za chwilę.` },
      { status: 502 }
    );
  }

  return Response.json(
    { error: "Nie udało się połączyć z silnikiem analizy. Odczekaj chwilę i spróbuj ponownie." },
    { status: 503 }
  );
}
