import type { AnalysisResult } from "./analysis.ts";
import {
  loadMessageHistory,
  messageHistoryLimit,
  messageHistoryStorageKey,
  type HistoryEntry,
  type HistoryThread,
  type ReplyGoal,
} from "./message-history.ts";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const SAMPLE_THREAD_PREFIX = "sample_thread_";

function browserStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function analysis(overrides: Partial<AnalysisResult>): AnalysisResult {
  return {
    risk_level: "LOW",
    risk_explanation: "To rutynowa wiadomość, na którą można odpowiedzieć krótko i rzeczowo.",
    should_reply: "yes",
    decision_explanation: "Odpowiedź porządkuje ustalenia bez rozwijania konfliktu.",
    message_summary: "Druga strona przekazuje informację dotyczącą organizacji opieki.",
    recommended_stance: "neutral",
    stance_explanation: "Wystarczy potwierdzić konkretne ustalenie.",
    options: ["Potwierdzić ustalenie."],
    attention_points: [],
    what_not_to_write: [],
    lawyer_questions: [],
    draft_reply: "Dziękuję za informację. Potwierdzam.",
    ...overrides,
  };
}

function entry(input: {
  id: string;
  createdAt: string;
  receivedAt: string;
  channel: string;
  message: string;
  goal: ReplyGoal;
  result: AnalysisResult;
  sentReply?: string;
}): HistoryEntry {
  return {
    ...input,
    proposedReply: input.result.draft_reply,
    sentReply: input.sentReply || "",
  };
}

const SAMPLE_THREADS: HistoryThread[] = [
  {
    id: "sample_thread_weekend",
    title: "Weekend 1–3 sierpnia",
    createdAt: "2026-07-30T17:10:00.000Z",
    updatedAt: "2026-08-02T16:45:00.000Z",
    entries: [
      entry({
        id: "sample_entry_weekend_1",
        createdAt: "2026-07-30T17:10:00.000Z",
        receivedAt: "2026-07-30",
        channel: "WhatsApp",
        message:
          "W ten weekend Zosia zostaje u mnie. Możesz zabrać ją w środę na dwie godziny. Nie chcę znowu słuchać, że robię ci problemy.",
        goal: "maintain",
        result: analysis({
          risk_level: "MEDIUM",
          risk_explanation:
            "Wiadomość jednostronnie zmienia ustalony weekend i łączy sprzeciw z osobistym zarzutem.",
          decision_explanation:
            "Warto jasno podtrzymać ustalony termin, bez odpowiadania na zarzut o tworzenie problemów.",
          message_summary:
            "Druga strona informuje, że Zosia ma zostać u niej w ustalony weekend, i proponuje krótszy termin zastępczy.",
          recommended_stance: "firm",
          stance_explanation:
            "Spokojne podtrzymanie ustaleń chroni granicę bez eskalowania rozmowy.",
          options: [
            "Podtrzymać ustalony weekend.",
            "Poprosić o konkretny powód zmiany i równoważny termin.",
          ],
          attention_points: ["Nie wdawać się w dyskusję o tym, kto powoduje konflikt."],
          what_not_to_write: ["Nie przepraszać za podtrzymanie wcześniejszych ustaleń."],
          draft_reply:
            "Nie zgadzam się na zmianę. Trzymajmy się ustalonego weekendu od piątku o 17:00 do niedzieli o 18:00.",
        }),
        sentReply:
          "Nie zgadzam się na zmianę. Trzymajmy się ustalonego weekendu od piątku o 17:00 do niedzieli o 18:00.",
      }),
      entry({
        id: "sample_entry_weekend_2",
        createdAt: "2026-08-01T08:25:00.000Z",
        receivedAt: "2026-08-01",
        channel: "WhatsApp",
        message:
          "Chodzi o urodziny koleżanki, które kończą się w sobotę około 13. Jeśli już musisz ją zabrać, możesz przyjechać później.",
        goal: "alternative",
        result: analysis({
          risk_level: "MEDIUM",
          risk_explanation:
            "Pojawił się konkretny powód zmiany, ale nadal dotyczy ona istotnej części ustalonego weekendu.",
          decision_explanation:
            "Można zaproponować równoważne rozwiązanie, zamiast zgadzać się na skrócenie kontaktu bez rekompensaty.",
          message_summary:
            "Druga strona wyjaśnia powód zmiany i proponuje odbiór Zosi w sobotę po 13:00.",
          recommended_stance: "firm",
          stance_explanation:
            "Konkretna alternatywa uwzględnia wydarzenie Zosi i jednocześnie zachowuje równowagę ustaleń.",
          options: [
            "Odebrać Zosię w sobotę i przedłużyć pobyt do poniedziałku.",
            "Pozostać przy odbiorze w piątek.",
          ],
          attention_points: ["Wyraźnie zapisać godzinę odbioru i termin odwozu."],
          draft_reply:
            "Mogę odebrać Zosię w sobotę o 14:00. W zamian proponuję, żeby została u mnie do poniedziałku rano.",
        }),
        sentReply:
          "Mogę odebrać Zosię w sobotę o 14:00. W zamian proponuję, żeby została u mnie do poniedziałku rano.",
      }),
      entry({
        id: "sample_entry_weekend_3",
        createdAt: "2026-08-02T16:45:00.000Z",
        receivedAt: "2026-08-02",
        channel: "WhatsApp",
        message:
          "Dobrze. Odbierzesz ją w sobotę o 14:00, a ja odbiorę ją od ciebie w poniedziałek przed szkołą.",
        goal: "unsure",
        result: analysis({
          risk_level: "LOW",
          risk_explanation:
            "Wiadomość potwierdza uzgodnioną alternatywę i nie zawiera nowego sporu.",
          decision_explanation:
            "Krótkie potwierdzenie zamyka ustalenie i pozostawia czytelny zapis godzin.",
          message_summary:
            "Druga strona akceptuje odbiór w sobotę o 14:00 i powrót Zosi w poniedziałek rano.",
          recommended_stance: "neutral",
          stance_explanation: "Nie potrzeba dodatkowych wyjaśnień ani stawiania granicy.",
          options: ["Potwierdzić daty i godziny."],
          draft_reply:
            "Potwierdzam: odbieram Zosię w sobotę o 14:00, a w poniedziałek odbierzesz ją ode mnie przed szkołą.",
        }),
        sentReply:
          "Potwierdzam: odbieram Zosię w sobotę o 14:00, a w poniedziałek odbierzesz ją ode mnie przed szkołą.",
      }),
    ],
  },
  {
    id: "sample_thread_school",
    title: "Zebranie w szkole",
    createdAt: "2026-07-28T11:15:00.000Z",
    updatedAt: "2026-07-30T14:05:00.000Z",
    entries: [
      entry({
        id: "sample_entry_school_1",
        createdAt: "2026-07-28T11:15:00.000Z",
        receivedAt: "2026-07-28",
        channel: "SMS",
        message:
          "Wychowawczyni zaprosiła nas na rozmowę w czwartek o 16:30. Daj znać, czy będziesz, żebym mogła jej odpowiedzieć.",
        goal: "unsure",
        result: analysis({
          message_summary:
            "Druga strona pyta o obecność na spotkaniu z wychowawczynią w czwartek o 16:30.",
          decision_explanation:
            "Wystarczy jednoznacznie potwierdzić obecność, żeby szkoła otrzymała odpowiedź.",
          stance_explanation: "To neutralna kwestia organizacyjna dotycząca Zosi.",
          options: ["Potwierdzić obecność.", "Podać inny termin, jeśli ten nie pasuje."],
          draft_reply:
            "Tak, będę w czwartek o 16:30. Możesz potwierdzić termin wychowawczyni.",
        }),
        sentReply:
          "Tak, będę w czwartek o 16:30. Możesz potwierdzić termin wychowawczyni.",
      }),
      entry({
        id: "sample_entry_school_2",
        createdAt: "2026-07-30T14:05:00.000Z",
        receivedAt: "2026-07-30",
        channel: "SMS",
        message:
          "Spotkanie jest jednak w sali 12, nie w świetlicy. Wychowawczyni prosi, żebyśmy przyszli pięć minut wcześniej.",
        goal: "clarify",
        result: analysis({
          message_summary:
            "Druga strona przekazuje zmianę miejsca spotkania i prośbę o wcześniejsze przyjście.",
          decision_explanation:
            "Krótkie potwierdzenie pokaże, że informacja została odebrana.",
          stance_explanation: "Nie ma tu sporu ani brakującego ustalenia wymagającego dyskusji.",
          options: ["Potwierdzić nowe miejsce i godzinę przyjścia."],
          draft_reply: "Dzięki za informację. Będę pod salą 12 pięć minut wcześniej.",
        }),
        sentReply: "Dzięki za informację. Będę pod salą 12 pięć minut wcześniej.",
      }),
    ],
  },
  {
    id: "sample_thread_holidays",
    title: "Ustalenia na wakacje",
    createdAt: "2026-07-24T09:30:00.000Z",
    updatedAt: "2026-07-27T18:20:00.000Z",
    entries: [
      entry({
        id: "sample_entry_holidays_1",
        createdAt: "2026-07-24T09:30:00.000Z",
        receivedAt: "2026-07-24",
        channel: "Email",
        message:
          "Chcę zabrać Zosię nad morze od 10 do 18 sierpnia. Zarezerwowałam już nocleg, więc proszę tego nie komplikować.",
        goal: "alternative",
        result: analysis({
          risk_level: "MEDIUM",
          risk_explanation:
            "Proponowany wyjazd obejmuje część wcześniejszych ustaleń i jest przedstawiony jako już przesądzony.",
          decision_explanation:
            "Warto odnieść się do konkretnych dat i zaproponować rozwiązanie, które nie usuwa Twojego czasu z Zosią.",
          message_summary:
            "Druga strona informuje o planowanym wyjeździe od 10 do 18 sierpnia i wskazuje, że nocleg został już zarezerwowany.",
          recommended_stance: "firm",
          stance_explanation:
            "Rzeczowa alternatywa pozwala uwzględnić wyjazd bez automatycznej zgody na pełen zakres dat.",
          options: [
            "Zaproponować powrót przed Twoim weekendem.",
            "Zaproponować równoważny dodatkowy termin po wyjeździe.",
          ],
          attention_points: ["Nie traktować dokonanej rezerwacji jako wspólnego uzgodnienia."],
          what_not_to_write: ["Nie odpowiadać na presję osobistym zarzutem."],
          draft_reply:
            "Wyjazd od 10 do 18 sierpnia obejmuje mój weekend z Zosią. Mogę zgodzić się na termin do 15 sierpnia albo ustalmy równoważny dodatkowy czas po powrocie.",
        }),
        sentReply:
          "Wyjazd od 10 do 18 sierpnia obejmuje mój weekend z Zosią. Mogę zgodzić się na termin do 15 sierpnia albo ustalmy równoważny dodatkowy czas po powrocie.",
      }),
      entry({
        id: "sample_entry_holidays_2",
        createdAt: "2026-07-27T18:20:00.000Z",
        receivedAt: "2026-07-27",
        channel: "Email",
        message:
          "Mogę wrócić z Zosią 16 sierpnia rano. W takim razie odbierzesz ją tego samego dnia i zostanie u ciebie do wtorku.",
        goal: "alternative",
        result: analysis({
          risk_level: "LOW",
          risk_explanation:
            "Wiadomość zawiera konkretną propozycję uwzględniającą czas obojga rodziców.",
          decision_explanation:
            "Warto doprecyzować godzinę i miejsce przekazania Zosi, zanim propozycja zostanie uznana za zamknięte ustalenie.",
          message_summary:
            "Druga strona proponuje powrót 16 sierpnia rano oraz pobyt Zosi u Ciebie do wtorku.",
          recommended_stance: "clarify",
          stance_explanation: "Brakuje jedynie dokładnej godziny i miejsca przekazania.",
          options: ["Poprosić o godzinę powrotu.", "Od razu zaproponować konkretną godzinę odbioru."],
          attention_points: ["Zapisać dokładne daty i godziny w potwierdzeniu."],
          draft_reply:
            "Ten układ mi odpowiada. Napisz proszę, o której dokładnie wracacie 16 sierpnia i gdzie mam odebrać Zosię.",
        }),
      }),
    ],
  },
];

export function isSampleMessageHistoryThreadId(threadId: string) {
  return threadId.startsWith(SAMPLE_THREAD_PREFIX);
}

export function seedSampleMessageHistory(
  storage: StorageLike | null = browserStorage()
):
  | { ok: true; threads: HistoryThread[]; addedEntries: number }
  | { ok: false; error: string } {
  if (!storage) {
    return { ok: false, error: "Historia nie jest dostępna w tej przeglądarce." };
  }

  const current = loadMessageHistory(storage);
  const realThreads = current.threads.filter(
    (thread) => !isSampleMessageHistoryThreadId(thread.id)
  );
  const realEntryCount = realThreads.reduce((sum, thread) => sum + thread.entries.length, 0);
  const sampleEntryCount = SAMPLE_THREADS.reduce(
    (sum, thread) => sum + thread.entries.length,
    0
  );

  if (realEntryCount + sampleEntryCount > messageHistoryLimit) {
    return {
      ok: false,
      error: "Brakuje miejsca na przykładowe wątki. Usuń niepotrzebną historię i spróbuj ponownie.",
    };
  }

  try {
    storage.setItem(
      messageHistoryStorageKey,
      JSON.stringify({ version: 1, threads: [...SAMPLE_THREADS, ...realThreads] })
    );
    return {
      ok: true,
      threads: loadMessageHistory(storage).threads,
      addedEntries: sampleEntryCount,
    };
  } catch {
    return {
      ok: false,
      error: "Nie udało się zapisać przykładowej historii w tej przeglądarce.",
    };
  }
}

export function deleteSampleMessageHistory(
  storage: StorageLike | null = browserStorage()
) {
  if (!storage) return false;
  const current = loadMessageHistory(storage);
  const next = current.threads.filter(
    (thread) => !isSampleMessageHistoryThreadId(thread.id)
  );
  if (next.length === current.threads.length) return false;

  try {
    storage.setItem(
      messageHistoryStorageKey,
      JSON.stringify({ version: 1, threads: next })
    );
    return true;
  } catch {
    return false;
  }
}

export const sampleMessageHistoryThreadCount = SAMPLE_THREADS.length;
