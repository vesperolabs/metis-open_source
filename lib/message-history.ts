import { validateAnalysisResult, type AnalysisResult } from "./analysis.ts";

export type ReplyGoal = "unsure" | "maintain" | "decline" | "clarify" | "alternative";

export const REPLY_GOALS: Array<{
  value: ReplyGoal;
  label: string;
  description: string;
}> = [
  {
    value: "unsure",
    label: "Nie wiem — pomóż mi wybrać",
    description: "Metis oceni sytuację i zaproponuje właściwy kierunek.",
  },
  {
    value: "maintain",
    label: "Podtrzymaj ustalenia",
    description: "Spokojnie zaznacz, że obowiązujące ustalenia pozostają bez zmian.",
  },
  {
    value: "decline",
    label: "Odmów",
    description: "Przygotuj krótką, jasną odmowę bez zbędnego tłumaczenia się.",
  },
  {
    value: "clarify",
    label: "Poproś o konkret",
    description: "Najpierw uzyskaj brakujące informacje, zamiast zgadywać.",
  },
  {
    value: "alternative",
    label: "Zaproponuj alternatywę",
    description: "Podtrzymaj swoją granicę i wskaż rozwiązanie, które Ci odpowiada.",
  },
];

export const REPLY_GOAL_LABELS: Record<ReplyGoal, string> = Object.fromEntries(
  REPLY_GOALS.map((goal) => [goal.value, goal.label])
) as Record<ReplyGoal, string>;

export interface HistoryEntry {
  id: string;
  createdAt: string;
  receivedAt: string;
  channel: string;
  message: string;
  goal: ReplyGoal;
  result: AnalysisResult;
  proposedReply: string;
  sentReply: string;
}

export interface HistoryThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  entries: HistoryEntry[];
}

interface HistoryState {
  version: 1;
  threads: HistoryThread[];
}

export interface ConversationExchange {
  receivedAt: string;
  channel: string;
  incomingMessage: string;
  userReply: string;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const HISTORY_STORAGE_KEY = "metis_message_history_v1";
const MAX_HISTORY_ENTRIES = 300;

function emptyState(): HistoryState {
  return { version: 1, threads: [] };
}

function browserStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function text(value: unknown, maxLength = 10000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isReplyGoal(value: unknown): value is ReplyGoal {
  return REPLY_GOALS.some((goal) => goal.value === value);
}

function normalizeEntry(value: unknown): HistoryEntry | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const result = validateAnalysisResult(source.result);
  const id = text(source.id, 100);
  const message = text(source.message);

  if (!result.ok || !id || !message) return null;

  return {
    id,
    createdAt: text(source.createdAt, 100),
    receivedAt: text(source.receivedAt, 100),
    channel: text(source.channel, 100) || "Inne",
    message,
    goal: isReplyGoal(source.goal) ? source.goal : "unsure",
    result: result.data,
    proposedReply: text(source.proposedReply, 5000) || result.data.draft_reply,
    sentReply: text(source.sentReply, 5000),
  };
}

function normalizeThread(value: unknown): HistoryThread | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const source = value as Record<string, unknown>;
  const id = text(source.id, 100);
  if (!id) return null;

  const entries = Array.isArray(source.entries)
    ? source.entries.flatMap((entry) => {
        const normalized = normalizeEntry(entry);
        return normalized ? [normalized] : [];
      })
    : [];

  return {
    id,
    title: text(source.title, 120) || "Wątek bez nazwy",
    createdAt: text(source.createdAt, 100),
    updatedAt: text(source.updatedAt, 100),
    entries,
  };
}

function normalizeState(value: unknown): HistoryState {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return emptyState();
  }

  const source = value as Record<string, unknown>;
  const threads = Array.isArray(source.threads)
    ? source.threads.flatMap((thread) => {
        const normalized = normalizeThread(thread);
        return normalized ? [normalized] : [];
      })
    : [];

  return {
    version: 1,
    threads: threads.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  };
}

function generateId(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID?.();
  return `${prefix}_${uuid || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
}

function generatedThreadTitle(message: string, receivedAt: string) {
  const compact = message.replace(/\s+/g, " ").trim();
  const excerpt = compact.length > 58 ? `${compact.slice(0, 55)}…` : compact;
  if (!receivedAt) return excerpt || "Nowy wątek";

  const parsed = new Date(`${receivedAt}T12:00:00`);
  const date = Number.isNaN(parsed.getTime())
    ? receivedAt
    : parsed.toLocaleDateString("pl-PL", { day: "numeric", month: "short" });
  return `${date} · ${excerpt || "Nowy wątek"}`;
}

function persistHistory(state: HistoryState, storage: StorageLike | null) {
  if (!storage) return false;
  try {
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function loadMessageHistory(storage: StorageLike | null = browserStorage()) {
  if (!storage) return emptyState();
  try {
    return normalizeState(JSON.parse(storage.getItem(HISTORY_STORAGE_KEY) || "{}"));
  } catch {
    return emptyState();
  }
}

export function getHistoryThread(
  threadId: string,
  storage: StorageLike | null = browserStorage()
) {
  return loadMessageHistory(storage).threads.find((thread) => thread.id === threadId) || null;
}

export function buildConversationHistory(
  threadId: string,
  limit = 3,
  storage: StorageLike | null = browserStorage()
): ConversationExchange[] {
  const thread = getHistoryThread(threadId, storage);
  if (!thread) return [];

  return thread.entries.slice(-Math.max(0, Math.min(limit, 3))).map((entry) => ({
    receivedAt: entry.receivedAt,
    channel: entry.channel,
    incomingMessage: entry.message.slice(0, 2000),
    // A proposed reply may never have been sent. Only a reply explicitly marked
    // as sent is reliable conversation context for a later analysis.
    userReply: entry.sentReply.slice(0, 2000),
  }));
}

export function addAnalysisToHistory(
  input: {
    threadId?: string;
    threadTitle?: string;
    receivedAt: string;
    channel: string;
    message: string;
    goal: ReplyGoal;
    result: AnalysisResult;
  },
  storage: StorageLike | null = browserStorage()
):
  | { ok: true; thread: HistoryThread; entry: HistoryEntry }
  | { ok: false; error: string } {
  const state = loadMessageHistory(storage);
  const entryCount = state.threads.reduce((sum, thread) => sum + thread.entries.length, 0);
  if (entryCount >= MAX_HISTORY_ENTRIES) {
    return {
      ok: false,
      error: "Historia osiągnęła limit 300 analiz. Usuń niepotrzebny wątek i spróbuj ponownie.",
    };
  }

  const now = new Date().toISOString();
  let thread = input.threadId
    ? state.threads.find((candidate) => candidate.id === input.threadId)
    : undefined;

  if (!thread) {
    thread = {
      id: generateId("thread"),
      title: text(input.threadTitle, 120) || generatedThreadTitle(input.message, input.receivedAt),
      createdAt: now,
      updatedAt: now,
      entries: [],
    };
    state.threads.unshift(thread);
  }

  const entry: HistoryEntry = {
    id: generateId("entry"),
    createdAt: now,
    receivedAt: text(input.receivedAt, 100),
    channel: text(input.channel, 100) || "Inne",
    message: text(input.message),
    goal: input.goal,
    result: input.result,
    proposedReply: input.result.draft_reply,
    sentReply: "",
  };

  thread.entries.push(entry);
  thread.updatedAt = now;
  state.threads.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (!persistHistory(state, storage)) {
    return {
      ok: false,
      error: "Nie udało się zapisać historii na tym urządzeniu. Analiza nadal jest dostępna.",
    };
  }

  return { ok: true, thread, entry };
}

export function saveSentReply(
  entryId: string,
  sentReply: string,
  storage: StorageLike | null = browserStorage()
) {
  const state = loadMessageHistory(storage);
  for (const thread of state.threads) {
    const entry = thread.entries.find((candidate) => candidate.id === entryId);
    if (!entry) continue;
    entry.sentReply = text(sentReply, 5000);
    thread.updatedAt = new Date().toISOString();
    state.threads.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return persistHistory(state, storage);
  }
  return false;
}

export function deleteHistoryThread(
  threadId: string,
  storage: StorageLike | null = browserStorage()
) {
  const state = loadMessageHistory(storage);
  const next = state.threads.filter((thread) => thread.id !== threadId);
  if (next.length === state.threads.length) return false;
  return persistHistory({ version: 1, threads: next }, storage);
}

export const messageHistoryStorageKey = HISTORY_STORAGE_KEY;
export const messageHistoryLimit = MAX_HISTORY_ENTRIES;
