import assert from "node:assert/strict";
import test from "node:test";
import {
  ELEVENLABS_TRANSCRIPTION_MODEL,
  ElevenLabsRequestError,
  requestElevenLabsTranscription,
} from "../lib/elevenlabs.ts";

async function withMockFetch<T>(mock: typeof fetch, run: () => Promise<T>) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    return await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function audioFixture() {
  return new File(["synthetic audio"], "voice.webm", { type: "audio/webm" });
}

test("ElevenLabs transcription uses the fixed Polish Scribe request", async () => {
  await withMockFetch(
    (async (input, init) => {
      assert.equal(input, "https://api.elevenlabs.io/v1/speech-to-text");
      assert.equal(new Headers(init?.headers).get("xi-api-key"), "test-key");
      assert.ok(init?.body instanceof FormData);
      assert.equal(init.body.get("model_id"), ELEVENLABS_TRANSCRIPTION_MODEL);
      assert.equal(init.body.get("language_code"), "pol");
      assert.ok(init.body.get("file") instanceof File);
      return Response.json({ text: "To jest transkrypcja." });
    }) as typeof fetch,
    async () => {
      const result = await requestElevenLabsTranscription({
        apiKey: "test-key",
        audio: audioFixture(),
      });
      assert.equal(result, "To jest transkrypcja.");
    }
  );
});

test("ElevenLabs transcription preserves rate-limit status and retry hint", async () => {
  await withMockFetch(
    (async () => new Response("rate limited", {
      status: 429,
      headers: { "Retry-After": "17" },
    })) as typeof fetch,
    async () => {
      await assert.rejects(
        requestElevenLabsTranscription({ apiKey: "test-key", audio: audioFixture() }),
        (error: unknown) => {
          assert.ok(error instanceof ElevenLabsRequestError);
          assert.equal(error.kind, "rate_limit");
          assert.equal(error.status, 429);
          assert.equal(error.retryAfter, "17");
          return true;
        }
      );
    }
  );
});

test("ElevenLabs transcription rejects an empty provider response", async () => {
  await withMockFetch(
    (async () => Response.json({ text: "   " })) as typeof fetch,
    async () => {
      await assert.rejects(
        requestElevenLabsTranscription({ apiKey: "test-key", audio: audioFixture() }),
        (error: unknown) => {
          assert.ok(error instanceof ElevenLabsRequestError);
          assert.equal(error.kind, "invalid_response");
          return true;
        }
      );
    }
  );
});
