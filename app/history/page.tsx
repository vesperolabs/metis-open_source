"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader, LegalFooter } from "@/app/components/AppChrome";
import { track } from "@/lib/analytics";
import {
  REPLY_GOAL_LABELS,
  deleteHistoryThread,
  loadMessageHistory,
  type HistoryThread,
} from "@/lib/message-history";
import {
  deleteSampleMessageHistory,
  isSampleMessageHistoryThreadId,
  sampleMessageHistoryThreadCount,
  seedSampleMessageHistory,
} from "@/lib/sample-message-history";

const RISK_LABELS = {
  HIGH: "Wysokie ryzyko",
  MEDIUM: "Średnie ryzyko",
  LOW: "Niskie ryzyko",
} as const;

function displayDate(value: string) {
  if (!value) return "Bez daty";
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<HistoryThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [ready, setReady] = useState(false);
  const [sampleInfo, setSampleInfo] = useState("");
  const [sampleError, setSampleError] = useState("");

  useEffect(() => {
    const history = loadMessageHistory();
    const requested = new URLSearchParams(window.location.search).get("thread");
    const selected =
      (requested && history.threads.find((thread) => thread.id === requested)?.id) ||
      history.threads[0]?.id ||
      "";
    setThreads(history.threads);
    setSelectedThreadId(selected);
    setReady(true);
  }, []);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) || null,
    [selectedThreadId, threads]
  );
  const hasSampleThreads = threads.some((thread) =>
    isSampleMessageHistoryThreadId(thread.id)
  );
  const selectedIsSample = Boolean(
    selectedThread && isSampleMessageHistoryThreadId(selectedThread.id)
  );

  function loadSampleThreads() {
    setSampleInfo("");
    setSampleError("");
    const seeded = seedSampleMessageHistory();
    if (!seeded.ok) {
      setSampleError(seeded.error);
      return;
    }

    const firstSample = seeded.threads.find((thread) =>
      isSampleMessageHistoryThreadId(thread.id)
    );
    setThreads(seeded.threads);
    setSelectedThreadId(firstSample?.id || seeded.threads[0]?.id || "");
    setSampleInfo(
      `Dodaliśmy ${sampleMessageHistoryThreadCount} przykładowe wątki. To wyłącznie syntetyczne dane zapisane w tej przeglądarce.`
    );
    track("sample_history_loaded", { entries: seeded.addedEntries });
  }

  function removeSampleThreads() {
    setSampleInfo("");
    setSampleError("");
    if (!deleteSampleMessageHistory()) {
      setSampleError("Nie udało się usunąć przykładowych wątków.");
      return;
    }

    const next = loadMessageHistory().threads;
    setThreads(next);
    setSelectedThreadId(next[0]?.id || "");
    setSampleInfo("Przykładowe wątki zostały usunięte. Twoja pozostała historia nie zmieniła się.");
    track("sample_history_removed");
  }

  function continueThread(threadId: string) {
    track("history_thread_continued");
    router.push(`/analyze?thread=${encodeURIComponent(threadId)}`);
  }

  function removeThread(thread: HistoryThread) {
    const confirmed = window.confirm(
      `Usunąć wątek „${thread.title}” wraz ze wszystkimi zapisanymi wiadomościami i analizami?`
    );
    if (!confirmed || !deleteHistoryThread(thread.id)) return;

    const next = loadMessageHistory().threads;
    setThreads(next);
    setSelectedThreadId(next[0]?.id || "");
    track("history_thread_deleted", { entries: thread.entries.length });
  }

  if (!ready) return null;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <AppHeader actionHref="/analyze" actionLabel="Nowa analiza →" />

        <div className="mt-10">
          <h1 className="font-display text-4xl font-bold italic leading-tight text-ink sm:text-5xl">
            Historia wiadomości
          </h1>
          <p className="mt-4 max-w-2xl leading-[1.7] text-ink-body">
            Wiadomości, analizy i odpowiedzi są zapisane tylko w tej przeglądarce.
            Wybierz wątek, aby wrócić do jego przebiegu albo przeanalizować kolejną wiadomość.
          </p>
        </div>

        {threads.length > 0 && (
          <section className="mt-6 flex flex-col gap-4 rounded-[14px] border border-border bg-cream p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-semibold text-ink">
                {hasSampleThreads ? "Przykładowa historia jest włączona" : "Chcesz zobaczyć pełniejszą historię?"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {hasSampleThreads
                  ? "Syntetyczne wątki są oznaczone jako przykład i nie trafiają do prawdziwych analiz."
                  : "Dodaj trzy gotowe wątki demonstracyjne — bez wywołania AI i bez zmiany Twoich wiadomości."}
              </p>
            </div>
            <button
              type="button"
              onClick={hasSampleThreads ? removeSampleThreads : loadSampleThreads}
              className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-[10px] border border-accent/35 bg-paper px-5 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent-light"
            >
              {hasSampleThreads ? "Usuń przykładowe wątki" : "Dodaj przykładowe wątki"}
            </button>
          </section>
        )}

        {sampleInfo && (
          <div className="mt-4 rounded-[10px] border border-accent/30 bg-accent-light px-4 py-3 text-sm leading-relaxed text-accent">
            {sampleInfo}
          </div>
        )}

        {sampleError && (
          <div className="mt-4 rounded-[10px] border border-error/25 bg-error-light px-4 py-3 text-sm leading-relaxed text-error">
            {sampleError}
          </div>
        )}

        {threads.length === 0 ? (
          <section className="mt-8 rounded-[14px] border border-border bg-cream p-6 sm:p-8">
            <h2 className="font-semibold text-ink">Historia jest jeszcze pusta</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-body">
              Pierwszy wątek powstanie automatycznie po przeanalizowaniu wiadomości
              w publicznym demo Metisa.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={loadSampleThreads}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-hover sm:w-auto"
              >
                Wczytaj przykładową historię
              </button>
              <button
                type="button"
                onClick={() => router.push("/analyze")}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] border border-border bg-paper px-5 py-3 text-sm font-semibold text-ink-body hover:bg-cream sm:w-auto"
              >
                Przeanalizuj własną wiadomość →
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              Przykład tworzy trzy syntetyczne wątki lokalnie i nie zużywa analizy AI.
            </p>
          </section>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="self-start rounded-[14px] border border-border bg-cream p-3 lg:sticky lg:top-6">
              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                Wątki
              </p>
              <div className="space-y-1">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`w-full rounded-[10px] px-3 py-3 text-left transition-colors ${
                      selectedThreadId === thread.id
                        ? "bg-paper text-ink"
                        : "text-ink-body hover:bg-paper/70"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold leading-snug">
                      <span className="min-w-0 truncate">{thread.title}</span>
                      {isSampleMessageHistoryThreadId(thread.id) && (
                        <span className="shrink-0 rounded-full border border-accent/30 bg-accent-light px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-accent">
                          Przykład
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs text-ink-muted">
                      {thread.entries.length} {thread.entries.length === 1 ? "wiadomość" : "wiadomości"}
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {selectedThread && (
              <section>
                <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-paper p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                        Wybrany wątek
                      </p>
                      {selectedIsSample && (
                        <span className="rounded-full border border-accent/30 bg-accent-light px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-accent">
                          Dane przykładowe
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 text-xl font-semibold leading-snug text-ink">
                      {selectedThread.title}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                      {selectedIsSample
                        ? "Ten syntetyczny wątek służy tylko do obejrzenia historii i nie jest używany w prawdziwych analizach."
                        : "Przy kolejnej analizie Metis uwzględni maksymalnie trzy ostatnie wymiany."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      selectedIsSample
                        ? router.push("/analyze")
                        : continueThread(selectedThread.id)
                    }
                    className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-[10px] bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-hover"
                  >
                    {selectedIsSample ? "Przeanalizuj własną wiadomość →" : "Kontynuuj wątek →"}
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {selectedThread.entries.map((entry, index) => (
                    <details
                      key={entry.id}
                      open={index === selectedThread.entries.length - 1}
                      className="overflow-hidden rounded-[14px] border border-border bg-paper"
                    >
                      <summary className="cursor-pointer list-none px-5 py-4 sm:px-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {displayDate(entry.receivedAt)} · {entry.channel}
                            </p>
                            <p className="mt-1 line-clamp-1 text-xs text-ink-muted">
                              {entry.message}
                            </p>
                          </div>
                          <span className="rounded-full border border-border bg-cream px-3 py-1 text-xs font-semibold text-ink-body">
                            {RISK_LABELS[entry.result.risk_level]}
                          </span>
                        </div>
                      </summary>

                      <div className="space-y-5 border-t border-border px-5 py-5 sm:px-6">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                            Wiadomość od drugiej strony
                          </p>
                          <p className="mt-2 whitespace-pre-wrap rounded-[10px] bg-cream px-4 py-3 text-sm leading-relaxed text-ink-body">
                            {entry.message}
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                              Cel odpowiedzi
                            </p>
                            <p className="mt-2 text-sm font-semibold text-ink-body">
                              {REPLY_GOAL_LABELS[entry.goal]}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                              Co wynikało z wiadomości
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-ink-body">
                              {entry.result.message_summary}
                            </p>
                          </div>
                        </div>

                        {entry.proposedReply && (
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">
                              Proponowana odpowiedź
                            </p>
                            <p className="mt-2 whitespace-pre-wrap rounded-[10px] border border-accent/30 bg-accent-light px-4 py-3 text-sm leading-relaxed text-ink-body">
                              {entry.proposedReply}
                            </p>
                          </div>
                        )}

                        {entry.sentReply && (
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-muted">
                              Zapisana wysłana odpowiedź
                            </p>
                            <p className="mt-2 whitespace-pre-wrap rounded-[10px] border border-border px-4 py-3 text-sm leading-relaxed text-ink-body">
                              {entry.sentReply}
                            </p>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>

                {selectedIsSample ? (
                  <button
                    type="button"
                    onClick={removeSampleThreads}
                    className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-error underline decoration-error/30 underline-offset-4 hover:decoration-error"
                  >
                    Usuń wszystkie przykładowe wątki
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeThread(selectedThread)}
                    className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-error underline decoration-error/30 underline-offset-4 hover:decoration-error"
                  >
                    Usuń ten wątek z urządzenia
                  </button>
                )}
              </section>
            )}
          </div>
        )}

        <LegalFooter className="mt-10" />
      </div>
    </main>
  );
}
