import assert from "node:assert/strict";
import test from "node:test";
import type { AnalysisResult } from "../lib/analysis.ts";
import {
  addAnalysisToHistory,
  buildConversationHistory,
  deleteHistoryThread,
  loadMessageHistory,
  saveSentReply,
} from "../lib/message-history.ts";
import {
  deleteSampleMessageHistory,
  isSampleMessageHistoryThreadId,
  seedSampleMessageHistory,
} from "../lib/sample-message-history.ts";

class MemoryStorage {
  data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}

const result: AnalysisResult = {
  risk_level: "LOW",
  risk_explanation: "Rutynowa logistyka.",
  should_reply: "yes",
  decision_explanation: "Wystarczy krótka odpowiedź.",
  message_summary: "Druga strona proponuje godzinę odbioru.",
  recommended_stance: "neutral",
  stance_explanation: "Nie potrzeba stawiać dodatkowej granicy.",
  options: ["Potwierdzić."],
  attention_points: [],
  what_not_to_write: [],
  lawyer_questions: [],
  draft_reply: "Potwierdzam godzinę 17:00.",
};

function addEntry(
  storage: MemoryStorage,
  message: string,
  threadId?: string,
  threadTitle?: string
) {
  return addAnalysisToHistory(
    {
      threadId,
      threadTitle,
      receivedAt: "2026-08-04",
      channel: "SMS",
      message,
      goal: "maintain",
      result,
    },
    storage
  );
}

test("creates a named thread and appends later analyses to it", () => {
  const storage = new MemoryStorage();
  const first = addEntry(storage, "Pierwsza wiadomość", undefined, "Wakacje");
  assert.equal(first.ok, true);
  if (!first.ok) return;

  const second = addEntry(storage, "Druga wiadomość", first.thread.id);
  assert.equal(second.ok, true);

  const history = loadMessageHistory(storage);
  assert.equal(history.threads.length, 1);
  assert.equal(history.threads[0].title, "Wakacje");
  assert.equal(history.threads[0].entries.length, 2);
});

test("uses only the last three exchanges and never treats an unsent proposal as sent", () => {
  const storage = new MemoryStorage();
  const first = addEntry(storage, "Wiadomość 1");
  assert.equal(first.ok, true);
  if (!first.ok) return;

  let lastEntryId = first.entry.id;
  for (let index = 2; index <= 4; index += 1) {
    const added = addEntry(storage, `Wiadomość ${index}`, first.thread.id);
    assert.equal(added.ok, true);
    if (added.ok) lastEntryId = added.entry.id;
  }

  const beforeSavingReply = buildConversationHistory(first.thread.id, 10, storage);
  assert.deepEqual(
    beforeSavingReply.map((exchange) => exchange.incomingMessage),
    ["Wiadomość 2", "Wiadomość 3", "Wiadomość 4"]
  );
  assert.deepEqual(beforeSavingReply.map((exchange) => exchange.userReply), ["", "", ""]);

  assert.equal(saveSentReply(lastEntryId, "Ostatecznie wysłana odpowiedź", storage), true);
  const afterSavingReply = buildConversationHistory(first.thread.id, 3, storage);
  assert.equal(afterSavingReply[2].userReply, "Ostatecznie wysłana odpowiedź");
});

test("deletes a whole thread without affecting the others", () => {
  const storage = new MemoryStorage();
  const first = addEntry(storage, "Pierwszy wątek", undefined, "Pierwszy");
  const second = addEntry(storage, "Drugi wątek", undefined, "Drugi");
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  if (!first.ok || !second.ok) return;

  assert.equal(deleteHistoryThread(first.thread.id, storage), true);
  const history = loadMessageHistory(storage);
  assert.deepEqual(history.threads.map((thread) => thread.title), ["Drugi"]);
});

test("adds reversible sample threads without changing real history", () => {
  const storage = new MemoryStorage();
  const real = addEntry(storage, "Prawdziwa wiadomość", undefined, "Mój wątek");
  assert.equal(real.ok, true);
  if (!real.ok) return;

  const seeded = seedSampleMessageHistory(storage);
  assert.equal(seeded.ok, true);
  if (!seeded.ok) return;

  const sampleThreads = seeded.threads.filter((thread) =>
    isSampleMessageHistoryThreadId(thread.id)
  );
  assert.equal(sampleThreads.length, 3);
  assert.equal(
    sampleThreads.reduce((sum, thread) => sum + thread.entries.length, 0),
    7
  );
  assert.equal(seeded.threads.some((thread) => thread.id === real.thread.id), true);
  assert.equal(
    sampleThreads.some((thread) =>
      thread.entries.some((entry) => entry.sentReply.length === 0)
    ),
    true
  );

  const seededAgain = seedSampleMessageHistory(storage);
  assert.equal(seededAgain.ok, true);
  if (!seededAgain.ok) return;
  assert.equal(
    seededAgain.threads.filter((thread) => isSampleMessageHistoryThreadId(thread.id)).length,
    3
  );

  assert.equal(deleteSampleMessageHistory(storage), true);
  const remaining = loadMessageHistory(storage).threads;
  assert.deepEqual(remaining.map((thread) => thread.id), [real.thread.id]);
  assert.equal(deleteSampleMessageHistory(storage), false);
});
