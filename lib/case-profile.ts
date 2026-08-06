export interface CaseProfile {
  version: 1;
  context: string;
  userName: string;
  otherPartyName: string;
  toneSamples: string;
  updatedAt: string;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const CASE_PROFILE_KEY = "metis_case_profile_v1";

const LEGACY_KEYS = {
  context: "metis_context",
  userName: "metis_user_name",
  otherPartyName: "metis_other_party_name",
  toneSamples: "metis_tone_samples",
} as const;

const CASE_DATA_KEYS = [
  "metis_app_analysis_v1",
  "metis_message_history_v1",
  "metis_last_result",
  "metis_last_message",
  "metis_last_is_sample",
  "metis_result_source",
  "metis_draft_to_evaluate",
];

function emptyProfile(): CaseProfile {
  return {
    version: 1,
    context: "",
    userName: "",
    otherPartyName: "",
    toneSamples: "",
    updatedAt: "",
  };
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeCaseProfile(value: unknown): CaseProfile {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return emptyProfile();
  }

  const source = value as Record<string, unknown>;

  return {
    version: 1,
    context: normalizeString(source.context),
    userName: normalizeString(source.userName),
    otherPartyName: normalizeString(source.otherPartyName),
    toneSamples: normalizeString(source.toneSamples),
    updatedAt: normalizeString(source.updatedAt),
  };
}

function browserStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function saveCaseProfile(
  profile: Omit<CaseProfile, "version" | "updatedAt">,
  storage: StorageLike | null = browserStorage()
) {
  const normalized: CaseProfile = {
    version: 1,
    context: profile.context.trim(),
    userName: profile.userName.trim(),
    otherPartyName: profile.otherPartyName.trim(),
    toneSamples: profile.toneSamples.trim(),
    updatedAt: new Date().toISOString(),
  };

  if (!storage) return normalized;

  try {
    storage.setItem(CASE_PROFILE_KEY, JSON.stringify(normalized));
  } catch {
    // Private browsing and storage policies can make localStorage unavailable.
  }

  return normalized;
}

export function loadCaseProfile(storage: StorageLike | null = browserStorage()) {
  if (!storage) return emptyProfile();

  try {
    const stored = storage.getItem(CASE_PROFILE_KEY);
    if (stored) {
      const parsed = normalizeCaseProfile(JSON.parse(stored));
      if (parsed.context) return parsed;
    }

    const legacy = normalizeCaseProfile({
      context: storage.getItem(LEGACY_KEYS.context),
      userName: storage.getItem(LEGACY_KEYS.userName),
      otherPartyName: storage.getItem(LEGACY_KEYS.otherPartyName),
      toneSamples: storage.getItem(LEGACY_KEYS.toneSamples),
    });

    if (legacy.context) {
      return saveCaseProfile(legacy, storage);
    }
  } catch {
    return emptyProfile();
  }

  return emptyProfile();
}

export function clearCaseData(storage: StorageLike | null = browserStorage()) {
  if (!storage) return;

  try {
    storage.removeItem(CASE_PROFILE_KEY);
    Object.values(LEGACY_KEYS).forEach((key) => storage.removeItem(key));
    CASE_DATA_KEYS.forEach((key) => storage.removeItem(key));
  } catch {
    // Nothing else to do if browser storage is unavailable.
  }
}

export const caseProfileStorageKey = CASE_PROFILE_KEY;
