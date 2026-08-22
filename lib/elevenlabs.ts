export const ELEVENLABS_TRANSCRIPTION_MODEL = "scribe_v2";
export const ELEVENLABS_TRANSCRIPTION_TIMEOUT_MS = 60_000;

const ELEVENLABS_TRANSCRIPTION_URL = "https://api.elevenlabs.io/v1/speech-to-text";

export type ElevenLabsErrorKind =
  | "rate_limit"
  | "timeout"
  | "invalid_response"
  | "provider";

export class ElevenLabsRequestError extends Error {
  readonly kind: ElevenLabsErrorKind;
  readonly status?: number;
  readonly retryAfter?: string;

  constructor(
    kind: ElevenLabsErrorKind,
    message: string,
    status?: number,
    retryAfter?: string
  ) {
    super(message);
    this.name = "ElevenLabsRequestError";
    this.kind = kind;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

type TranscriptionRequest = {
  apiKey: string;
  audio: File;
  timeoutMs?: number;
};

type ElevenLabsTranscriptionResponse = {
  text?: unknown;
};

export async function requestElevenLabsTranscription({
  apiKey,
  audio,
  timeoutMs = ELEVENLABS_TRANSCRIPTION_TIMEOUT_MS,
}: TranscriptionRequest) {
  const body = new FormData();
  body.append("model_id", ELEVENLABS_TRANSCRIPTION_MODEL);
  body.append("language_code", "pol");
  body.append("file", audio, audio.name || "nagranie-audio");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(ELEVENLABS_TRANSCRIPTION_URL, {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body,
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ElevenLabsRequestError("timeout", "ElevenLabs request timed out");
    }

    throw new ElevenLabsRequestError(
      "provider",
      error instanceof Error ? error.message : "ElevenLabs request failed"
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const retryAfter = response.headers.get("retry-after") || undefined;
    if (response.status === 429) {
      throw new ElevenLabsRequestError(
        "rate_limit",
        "ElevenLabs rate limit exceeded",
        response.status,
        retryAfter
      );
    }

    throw new ElevenLabsRequestError(
      "provider",
      `ElevenLabs returned HTTP ${response.status}`,
      response.status,
      retryAfter
    );
  }

  let data: ElevenLabsTranscriptionResponse;
  try {
    data = (await response.json()) as ElevenLabsTranscriptionResponse;
  } catch {
    throw new ElevenLabsRequestError("invalid_response", "ElevenLabs returned invalid JSON");
  }

  if (typeof data.text !== "string" || !data.text.trim()) {
    throw new ElevenLabsRequestError("invalid_response", "ElevenLabs returned empty text");
  }

  return data.text.trim();
}

export function elevenLabsErrorResponse(error: unknown) {
  const failure = error instanceof ElevenLabsRequestError ? error : null;

  console.warn("Metis ElevenLabs transcription failed", {
    kind: failure?.kind || "unknown",
    status: failure?.status,
  });

  if (failure?.kind === "rate_limit") {
    return Response.json(
      { error: "Limit transkrypcji głosowych został chwilowo wykorzystany. Spróbuj ponownie później." },
      {
        status: 429,
        headers: failure.retryAfter ? { "Retry-After": failure.retryAfter } : undefined,
      }
    );
  }

  if (failure?.kind === "timeout") {
    return Response.json(
      { error: "Transkrypcja trwała zbyt długo. Spróbuj krótszego nagrania." },
      { status: 504 }
    );
  }

  if (failure?.kind === "invalid_response") {
    return Response.json(
      { error: "Nie udało się odczytać nagrania. Spróbuj ponownie lub wpisz tekst ręcznie." },
      { status: 502 }
    );
  }

  return Response.json(
    { error: "Transkrypcja jest teraz niedostępna. Spróbuj ponownie za chwilę." },
    { status: 503 }
  );
}
