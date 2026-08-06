import assert from "node:assert/strict";
import test from "node:test";
import {
  GROQ_MODEL,
  GroqRequestError,
  requestGroqJson,
} from "../lib/groq.ts";

const TEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: { ok: { type: "boolean" } },
  required: ["ok"],
};

async function withMockFetch<T>(mock: typeof fetch, run: () => Promise<T>) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    return await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("Groq request uses the fixed model and strict structured output", async () => {
  let requestBody: Record<string, unknown> | undefined;

  await withMockFetch(
    (async (input, init) => {
      assert.equal(input, "https://api.groq.com/openai/v1/chat/completions");
      assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-key");
      requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
      return Response.json({
        choices: [{ message: { content: JSON.stringify({ ok: true }) } }],
      });
    }) as typeof fetch,
    async () => {
      const result = await requestGroqJson({
        apiKey: "test-key",
        systemPrompt: "system",
        userContent: "user",
        maxCompletionTokens: 100,
        schemaName: "test_schema",
        schema: TEST_SCHEMA,
      });

      assert.equal(result, JSON.stringify({ ok: true }));
    }
  );

  assert.equal(GROQ_MODEL, "openai/gpt-oss-120b");
  assert.equal(requestBody?.model, GROQ_MODEL);
  assert.equal(requestBody?.max_completion_tokens, 100);
  assert.deepEqual(requestBody?.response_format, {
    type: "json_schema",
    json_schema: {
      name: "test_schema",
      strict: true,
      schema: TEST_SCHEMA,
    },
  });
});

test("Groq request preserves rate-limit status and retry hint", async () => {
  await withMockFetch(
    (async () =>
      new Response("rate limited", {
        status: 429,
        headers: { "Retry-After": "17" },
      })) as typeof fetch,
    async () => {
      await assert.rejects(
        requestGroqJson({
          apiKey: "test-key",
          systemPrompt: "system",
          userContent: "user",
          maxCompletionTokens: 100,
          schemaName: "test_schema",
          schema: TEST_SCHEMA,
        }),
        (error: unknown) => {
          assert.ok(error instanceof GroqRequestError);
          assert.equal(error.kind, "rate_limit");
          assert.equal(error.status, 429);
          assert.equal(error.retryAfter, "17");
          return true;
        }
      );
    }
  );
});

test("Groq request aborts after the configured timeout", async () => {
  await withMockFetch(
    ((_, init) =>
      new Promise<Response>((_, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
      })) as typeof fetch,
    async () => {
      await assert.rejects(
        requestGroqJson({
          apiKey: "test-key",
          systemPrompt: "system",
          userContent: "user",
          maxCompletionTokens: 100,
          schemaName: "test_schema",
          schema: TEST_SCHEMA,
          timeoutMs: 5,
        }),
        (error: unknown) => {
          assert.ok(error instanceof GroqRequestError);
          assert.equal(error.kind, "timeout");
          return true;
        }
      );
    }
  );
});
