import assert from "node:assert/strict";
import test from "node:test";
import { caseProfileStorageKey, clearCaseData, loadCaseProfile, saveCaseProfile } from "../lib/case-profile.ts";
import { loadStoredAnalysis, resultStorageKeys, storeAppAnalysis, storeTransientAnalysis } from "../lib/result-storage.ts";
import { messageHistoryStorageKey } from "../lib/message-history.ts";
import type { AnalysisResult } from "../lib/analysis.ts";

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
  decision_explanation: "Wystarczy potwierdzenie.",
  message_summary: "Druga strona podaje godzinę.",
  recommended_stance: "neutral",
  stance_explanation: "Nie potrzeba stawiać granicy.",
  options: ["Potwierdzić."],
  attention_points: [],
  what_not_to_write: [],
  lawyer_questions: [],
  draft_reply: "Potwierdzam.",
};

test("full app persists one versioned case profile and can clear it", () => {
  const local = new MemoryStorage();
  saveCaseProfile({ context: "  Stały harmonogram. ", userName: " Ala ", otherPartyName: "Olek", toneSamples: "Krótko." }, local);
  assert.equal(loadCaseProfile(local).context, "Stały harmonogram.");
  assert.equal(local.data.has(caseProfileStorageKey), true);

  storeAppAnalysis({ result, message: "Godzina 17." }, local, new MemoryStorage());
  local.setItem(messageHistoryStorageKey, JSON.stringify({ version: 1, threads: [] }));
  clearCaseData(local);
  assert.equal(loadCaseProfile(local).context, "");
  assert.equal(local.data.has(resultStorageKeys.app), false);
  assert.equal(local.data.has(messageHistoryStorageKey), false);
});

test("demo analysis lives in session storage and full analysis replaces it", () => {
  const session = new MemoryStorage();
  const local = new MemoryStorage();
  storeTransientAnalysis({ result, message: "Demo", source: "demo" }, session);

  assert.equal(local.data.size, 0);
  assert.equal(loadStoredAnalysis(session, local)?.source, "demo");

  storeAppAnalysis({ result, message: "Publiczne demo" }, local, session);
  assert.equal(session.data.has(resultStorageKeys.transient), false);
  assert.equal(loadStoredAnalysis(session, local)?.source, "app");
});

test("legacy separate context keys migrate to the versioned profile", () => {
  const local = new MemoryStorage();
  local.setItem("metis_context", "Stary kontekst");
  local.setItem("metis_user_name", "Jan");
  const migrated = loadCaseProfile(local);
  assert.equal(migrated.context, "Stary kontekst");
  assert.equal(migrated.userName, "Jan");
  assert.equal(local.data.has(caseProfileStorageKey), true);
});
