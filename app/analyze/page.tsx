"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  extractJsonFromModelResponse,
  normalizeModelResponseText,
  validateAnalysisResult,
} from "@/lib/analysis";
import { track } from "@/lib/analytics";
import { loadCaseProfile } from "@/lib/case-profile";
import { storeAppAnalysis } from "@/lib/result-storage";
import {
  REPLY_GOALS,
  addAnalysisToHistory,
  buildConversationHistory,
  loadMessageHistory,
  type HistoryThread,
  type ReplyGoal,
} from "@/lib/message-history";
import { isSampleMessageHistoryThreadId } from "@/lib/sample-message-history";
import { SAMPLE_RESULT, loadSampleAnalysis } from "@/lib/sample";
import { AppHeader, LegalFooter } from "@/app/components/AppChrome";

const CHANNELS = ["SMS", "Email", "WhatsApp", "Messenger", "Telefon — notatka", "Inne"];

const LOADING_STEPS = [
  "Czytam wiadomość…",
  "Sprawdzam, co z niej wynika…",
  "Dobieram właściwą postawę…",
  "Przygotowuję spokojną, stanowczą odpowiedź…",
];

const MANUAL_PARSE_ERROR =
  "Nie udało się odczytać odpowiedzi. Spróbuj wkleić całą odpowiedź modelu — aplikacja obsługuje też json w markdownzie i tekst dookoła. Jeśli odpowiedź wygląda jak JSON, sprawdź czy używa zwykłych cudzysłowów (\") zamiast typograficznych “ ”. Jeśli nadal nie działa, poproś model: ‘Zwróć wyłącznie poprawny JSON bez komentarza’.";

const MANUAL_CLEANUP_SUCCESS =
  "Odpowiedź została odczytana. Usunęliśmy dodatkowy tekst/markdown z odpowiedzi modelu.";

interface ManualAnalyzeResponse {
  manualMode: true;
  prompt: string;
  reason: string;
}

function isManualAnalyzeResponse(value: unknown): value is ManualAnalyzeResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "manualMode" in value &&
    (value as { manualMode?: unknown }).manualMode === true &&
    typeof (value as { prompt?: unknown }).prompt === "string"
  );
}

function logManualParseIssue(rawText: string, error: string) {
  if (process.env.NODE_ENV === "production") {
    console.warn("Metis manual parse issue", {
      error,
      responseLength: rawText.length,
    });
    return;
  }

  console.warn("Metis manual parse issue", {
    error,
    rawText,
  });
}


export default function AnalyzePage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("SMS");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasContext, setHasContext] = useState(false);
  const [manualPrompt, setManualPrompt] = useState("");
  const [manualAnswer, setManualAnswer] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualSuccess, setManualSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [threads, setThreads] = useState<HistoryThread[]>([]);
  const [threadId, setThreadId] = useState("");
  const [threadTitle, setThreadTitle] = useState("");
  const [goal, setGoal] = useState<ReplyGoal>("unsure");

  useEffect(() => {
    setHasContext(Boolean(loadCaseProfile().context));
    const history = loadMessageHistory();
    const realThreads = history.threads.filter(
      (thread) => !isSampleMessageHistoryThreadId(thread.id)
    );
    setThreads(realThreads);
    const requestedThread = new URLSearchParams(window.location.search).get("thread");
    if (requestedThread && realThreads.some((thread) => thread.id === requestedThread)) {
      setThreadId(requestedThread);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const id = window.setInterval(
      () => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)),
      5000
    );
    return () => window.clearInterval(id);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError("");
    setManualError("");
    setManualSuccess("");
    setManualPrompt("");

    const { context, userName, otherPartyName, toneSamples } = loadCaseProfile();
    const conversationHistory = threadId ? buildConversationHistory(threadId, 3) : [];

    // Analytics: metadata only — never message contents.
    track("analysis_started", {
      channel,
      chars: message.trim().length,
      goal,
      previous_exchanges: conversationHistory.length,
    });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          userName,
          otherPartyName,
          toneSamples,
          message,
          channel,
          date,
          goal,
          conversationHistory,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Błąd serwera (${res.status})`);
      }

      const result = await res.json();

      if (isManualAnalyzeResponse(result)) {
        setManualPrompt(result.prompt);
        setLoading(false);
        return;
      }

      saveAndShowAnalysis(result, "api");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd. Spróbuj ponownie.");
      setLoading(false);
    }
  }

  function saveAndShowAnalysis(result: unknown, mode: "api" | "manual") {
    const validation = validateAnalysisResult(result);
    if (!validation.ok) {
      setError("Nie udało się odczytać wyniku analizy. Spróbuj ponownie.");
      setLoading(false);
      return;
    }

    const history = addAnalysisToHistory({
      threadId: threadId || undefined,
      threadTitle,
      receivedAt: date,
      channel,
      message,
      goal,
      result: validation.data,
    });

    storeAppAnalysis({
      result: validation.data,
      message,
      threadId: history.ok ? history.thread.id : undefined,
      historyEntryId: history.ok ? history.entry.id : undefined,
      historySaveError: history.ok ? undefined : history.error,
    });
    track("analysis_completed", {
      channel,
      mode,
      goal,
      history_saved: history.ok,
      continued_thread: Boolean(threadId),
    });
    router.push("/result");
  }

  function showSampleAnalysis() {
    loadSampleAnalysis();
    track("sample_analysis_viewed");
    router.push("/result");
  }

  async function copyManualPrompt() {
    await navigator.clipboard.writeText(manualPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function showManualAnalysis() {
    setManualError("");
    setManualSuccess("");

    const extracted = extractJsonFromModelResponse(manualAnswer);
    if (!extracted.ok) {
      logManualParseIssue(manualAnswer, extracted.error);
      setManualError(MANUAL_PARSE_ERROR);
      return;
    }

    const validation = validateAnalysisResult(extracted.data);
    if (!validation.ok) {
      logManualParseIssue(extracted.extractedJson, validation.error);
      setManualError(`${MANUAL_PARSE_ERROR} Szczegóły: ${validation.error}`);
      return;
    }

    const history = addAnalysisToHistory({
      threadId: threadId || undefined,
      threadTitle,
      receivedAt: date,
      channel,
      message,
      goal,
      result: validation.data,
    });

    storeAppAnalysis({
      result: validation.data,
      message,
      threadId: history.ok ? history.thread.id : undefined,
      historyEntryId: history.ok ? history.entry.id : undefined,
      historySaveError: history.ok ? undefined : history.error,
    });
    track("analysis_completed", {
      channel,
      mode: "manual",
      goal,
      history_saved: history.ok,
      continued_thread: Boolean(threadId),
    });

    if (extracted.extractedJson.trim() !== manualAnswer.trim()) {
      setManualSuccess(MANUAL_CLEANUP_SUCCESS);
      window.setTimeout(() => router.push("/result"), 900);
      return;
    }

    router.push("/result");
  }

  if (!hasContext) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-3xl">
          <AppHeader />
          <div className="mt-10 rounded-[14px] border border-border bg-cream p-5 sm:p-7">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">Brak kontekstu sprawy</p>
            <p className="mb-5 text-sm leading-relaxed text-ink-body">
              Najpierw uzupełnij kontekst sprawy, żeby Metis mógł dobrze przeanalizować
              wiadomości.
            </p>
            <Link
              href="/setup"
              className="inline-flex min-h-12 items-center rounded-[10px] bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Uzupełnij kontekst →
            </Link>
            <button
              type="button"
              onClick={showSampleAnalysis}
              className="mt-3 block min-h-11 text-left text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
            >
              Albo najpierw zobacz przykładową analizę (bez podawania czegokolwiek) →
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <AppHeader actionHref="/setup" actionLabel="Zmień kontekst sprawy" />

        <h1 className="mt-10 font-display text-4xl font-bold italic leading-tight text-ink sm:text-5xl">
          Analiza wiadomości
        </h1>
        <p className="mt-5 leading-relaxed text-ink-body">
          Wklej wiadomość, którą otrzymałeś/aś od drugiej strony.
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Napisałeś/aś już swoją odpowiedź?{" "}
          <Link
            href="/evaluate"
            onClick={() => track("evaluate_opened", { from: "analyze" })}
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
          >
            Sprawdź ją, zanim wyślesz →
          </Link>
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Chcesz wrócić do poprzedniej rozmowy?{" "}
          <Link
            href="/history"
            className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
          >
            Otwórz historię wiadomości →
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-[14px] border border-border bg-paper p-5 sm:p-7">
          <div className="rounded-[10px] border border-border bg-cream p-4 sm:p-5">
            <label className="mb-2 block text-sm font-semibold text-ink-body">
              Wątek rozmowy
            </label>
            <select
              value={threadId}
              onChange={(e) => setThreadId(e.target.value)}
              className="min-h-12 w-full rounded-[10px] border border-border bg-paper px-4 py-3 text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
            >
              <option value="">Nowy wątek</option>
              {threads.map((thread) => (
                <option key={thread.id} value={thread.id}>
                  {thread.title}
                </option>
              ))}
            </select>
            {threadId ? (
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Metis uwzględni maksymalnie trzy ostatnie wymiany z tego wątku.
              </p>
            ) : (
              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold text-ink-muted">
                  Nazwa wątku <span className="font-normal">(opcjonalna)</span>
                </label>
                <input
                  type="text"
                  value={threadTitle}
                  onChange={(e) => setThreadTitle(e.target.value)}
                  maxLength={120}
                  placeholder="np. Weekend 8–10 sierpnia"
                  className="min-h-12 w-full rounded-[10px] border border-border bg-paper px-4 py-3 text-ink placeholder-ink-muted outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
                />
              </div>
            )}
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-ink-body">
              Co chcesz osiągnąć w odpowiedzi?
            </legend>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              To wskazówka dla Metisa, nie sztywne polecenie. Jeśli cel byłby ryzykowny,
              analiza zaproponuje bezpieczniejszy kierunek.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {REPLY_GOALS.map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-[10px] border p-4 transition-colors ${
                    goal === option.value
                      ? "border-accent bg-accent-light"
                      : "border-border bg-paper hover:bg-cream"
                  }`}
                >
                  <span className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="reply-goal"
                      value={option.value}
                      checked={goal === option.value}
                      onChange={() => setGoal(option.value)}
                      className="mt-1 accent-accent"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                        {option.description}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink-body">
                Data otrzymania
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-12 w-full rounded-[10px] border border-border bg-paper px-4 py-3 text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink-body">
                Kanał
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="min-h-12 w-full rounded-[10px] border border-border bg-paper px-4 py-3 text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-body">
              Treść wiadomości <span className="text-error">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={8}
              placeholder="Wklej tutaj wiadomość od drugiej strony..."
              className="w-full resize-none rounded-[10px] border border-border bg-paper px-4 py-3 text-sm leading-relaxed text-ink placeholder-ink-muted outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs leading-relaxed text-ink-muted">
                Podczas analizy treść trafia do modelu AI. Wiadomość i wynik zostaną
                zapisane tylko w historii na tym urządzeniu.
              </p>
              <button
                type="button"
                onClick={showSampleAnalysis}
                className="inline-flex min-h-11 items-center text-xs font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
              >
                Zobacz przykładową analizę →
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-[10px] border border-error/25 bg-error-light px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {LOADING_STEPS[loadingStep]}
              </>
            ) : (
              "Analizuj wiadomość →"
            )}
          </button>
          {loading && (
            <p className="text-xs text-ink-muted">
              Pełna analiza trwa zwykle 15–20 sekund.
            </p>
          )}
        </form>

        {manualPrompt && (
          <section className="mt-8 space-y-5 rounded-[14px] border border-border bg-cream p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent-light px-3 py-1 text-sm font-semibold text-accent">
                Tryb manualny
              </span>
            </div>

            <p className="text-sm leading-relaxed text-ink-body">
              Skopiuj prompt do Claude/ChatGPT, a potem wklej odpowiedź AI poniżej. To
              tymczasowy tryb demo bez API.
            </p>

            <div className="rounded-[10px] border border-border bg-paper px-4 py-3 text-sm text-ink-body">
              Nie wklejaj danych, których nie chcesz przekazywać do wybranego modelu AI.
            </div>

            <button
              type="button"
              onClick={copyManualPrompt}
              className="min-h-12 w-full rounded-[10px] bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover sm:w-auto"
            >
              {copied ? "Skopiowano" : "Kopiuj prompt do Claude/ChatGPT"}
            </button>
            <p className="text-xs leading-relaxed text-ink-muted">
              Najlepiej wklej prompt do Claude/ChatGPT i skopiuj całą odpowiedź z
              powrotem tutaj.
            </p>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink-body">
                Wklej odpowiedź AI tutaj
              </label>
              <textarea
                value={manualAnswer}
                onChange={(e) => setManualAnswer(e.target.value)}
                rows={14}
                className="w-full resize-y rounded-[10px] border border-border bg-paper px-4 py-3 font-mono text-sm leading-relaxed text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => {
                  setManualAnswer(normalizeModelResponseText(manualAnswer));
                  setManualError("");
                  setManualSuccess("");
                }}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
              >
                Napraw cudzysłowy
              </button>

              <button
                type="button"
                onClick={() => {
                  setManualAnswer(JSON.stringify(SAMPLE_RESULT, null, 2));
                  setManualError("");
                  setManualSuccess("");
                }}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
              >
                Wklej przykładową odpowiedź testową
              </button>
            </div>

            {manualSuccess && (
              <div className="rounded-[10px] border border-accent/30 bg-accent-light px-4 py-3 text-sm text-accent">
                {manualSuccess}
              </div>
            )}

            {manualError && (
              <div className="rounded-[10px] border border-error/25 bg-error-light px-4 py-3 text-sm text-error">
                {manualError}
              </div>
            )}

            <button
              type="button"
              onClick={showManualAnalysis}
              disabled={!manualAnswer.trim()}
              className="min-h-12 w-full rounded-[10px] bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              Pokaż analizę
            </button>
          </section>
        )}
        <LegalFooter className="mt-8" />
      </div>
    </main>
  );
}
