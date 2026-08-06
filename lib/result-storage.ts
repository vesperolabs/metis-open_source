import type { AnalysisResult } from "./analysis";

export type AnalysisSource = "sample" | "demo" | "app";

export interface StoredAnalysis {
  result: AnalysisResult;
  message: string;
  source: AnalysisSource;
  threadId?: string;
  historyEntryId?: string;
  historySaveError?: string;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const TRANSIENT_RESULT_KEY = "metis_transient_analysis_v1";
const APP_RESULT_KEY = "metis_app_analysis_v1";

function safeParse(value: string | null): StoredAnalysis | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StoredAnalysis>;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.result !== "object" ||
      parsed.result === null ||
      typeof parsed.message !== "string" ||
      (parsed.source !== "sample" && parsed.source !== "demo" && parsed.source !== "app")
    ) {
      return null;
    }

    return parsed as StoredAnalysis;
  } catch {
    return null;
  }
}

export function storeTransientAnalysis(
  analysis: StoredAnalysis,
  storage: StorageLike = window.sessionStorage
) {
  storage.setItem(TRANSIENT_RESULT_KEY, JSON.stringify(analysis));
}

export function storeAppAnalysis(
  analysis: Omit<StoredAnalysis, "source">,
  storage: StorageLike = window.localStorage,
  session: StorageLike = window.sessionStorage
) {
  storage.setItem(APP_RESULT_KEY, JSON.stringify({ ...analysis, source: "app" }));
  session.removeItem(TRANSIENT_RESULT_KEY);
}

export function loadStoredAnalysis(
  session: StorageLike = window.sessionStorage,
  local: StorageLike = window.localStorage
): StoredAnalysis | null {
  const transient = safeParse(session.getItem(TRANSIENT_RESULT_KEY));
  if (transient) return transient;

  const app = safeParse(local.getItem(APP_RESULT_KEY));
  if (app?.source === "app") return app;

  // One-time migration from the original separate localStorage keys.
  const legacyResult = local.getItem("metis_last_result");
  const legacySource = local.getItem("metis_result_source");
  const source: AnalysisSource =
    legacySource === "sample" || legacySource === "demo" ? legacySource : "app";

  if (!legacyResult) return null;

  try {
    const migrated: StoredAnalysis = {
      result: JSON.parse(legacyResult) as AnalysisResult,
      message: local.getItem("metis_last_message") || "",
      source,
    };

    if (source === "app") {
      storeAppAnalysis(migrated, local, session);
    } else {
      storeTransientAnalysis(migrated, session);
    }

    ["metis_last_result", "metis_last_message", "metis_last_is_sample", "metis_result_source"].forEach(
      (key) => local.removeItem(key)
    );

    return migrated;
  } catch {
    return null;
  }
}

export function clearTransientAnalysis(storage: StorageLike = window.sessionStorage) {
  storage.removeItem(TRANSIENT_RESULT_KEY);
}

export const resultStorageKeys = {
  transient: TRANSIENT_RESULT_KEY,
  app: APP_RESULT_KEY,
};
