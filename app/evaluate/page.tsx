"use client";

import { useState, useEffect } from "react";
import { AppHeader, LegalFooter } from "@/app/components/AppChrome";
import VoiceTranscribeButton from "@/app/components/VoiceTranscribeButton";
import { loadCaseProfile } from "@/lib/case-profile";
import { loadStoredAnalysis } from "@/lib/result-storage";
import { validateEvaluationResult, type EvaluationResult } from "@/lib/evaluation";

const OVERALL_LABELS: Record<string, string> = {
  safe: "Bezpieczna",
  caution: "Wymaga uwagi",
  risky: "Ryzykowna",
};

const OVERALL_CLASSES: Record<string, string> = {
  safe: "bg-accent-light text-accent border border-accent/30",
  caution: "bg-cream text-ink-body border border-border",
  risky: "bg-error-light text-error border border-error/25",
};

const SENTENCE_CLASSES: Record<string, string> = {
  safe: "bg-accent-light border-l-2 border-accent",
  caution: "bg-cream border-l-2 border-ink-muted",
  risky: "bg-error-light border-l-2 border-error",
};

export default function EvaluatePage() {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("metis_draft_to_evaluate");
    if (stored) setDraft(stored);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const { context, userName, otherPartyName, toneSamples } = loadCaseProfile();
    const originalMessage = loadStoredAnalysis()?.message || "";

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          userName,
          otherPartyName,
          toneSamples,
          originalMessage,
          draft,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Błąd serwera (${res.status})`);
      }

      const data = validateEvaluationResult(await res.json());
      if (!data) throw new Error("Nie udało się odczytać oceny. Spróbuj ponownie.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <AppHeader backHref="/result" backLabel="← Wróć do analizy" />

        <div className="mt-10">
          <h1 className="font-display text-4xl font-bold italic leading-tight text-ink sm:text-5xl">
            Sprawdź swoją wersję
          </h1>
          <p className="mt-5 leading-[1.7] text-ink-body">
            Wklej swoją wersję odpowiedzi — Metis oceni ją zdanie po zdaniu
            i zaproponuje spokojniejszą, stanowczą wersję tam, gdzie jest potrzebna.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-[14px] border border-border bg-paper p-5 sm:p-7">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-body">
              Twoja wersja odpowiedzi
            </label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              required
              rows={6}
              placeholder="Wklej tutaj swoją wersję odpowiedzi..."
              className="w-full resize-none rounded-[10px] border border-border bg-paper px-4 py-3 text-sm leading-relaxed text-ink placeholder-ink-muted outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
            <VoiceTranscribeButton
              field="own_draft"
              onTranscript={(transcript) => setDraft((current) => current ? `${current}\n\n${transcript}` : transcript)}
            />
          </div>

          {error && (
            <div className="rounded-[10px] border border-error/25 bg-error-light px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!draft.trim() || loading}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Oceniam...
              </>
            ) : (
              "Oceń moją wersję →"
            )}
          </button>
        </form>

        {result && (
          <div className="mt-8 space-y-6 border-t border-border pt-8">
            {/* Overall */}
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${OVERALL_CLASSES[result.overall_assessment]}`}>
                {OVERALL_LABELS[result.overall_assessment]}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-ink-body">{result.overall_explanation}</p>

            {/* Sentence by sentence */}
            {result.sentences?.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">Analiza zdanie po zdaniu</h3>
                <div className="space-y-3">
                  {result.sentences.map((s, i) => (
                    <div key={i} className={`rounded-[10px] px-4 py-3 ${SENTENCE_CLASSES[s.risk]}`}>
                      <p className="mb-1 text-sm font-semibold text-ink">{s.text}</p>
                      {s.risk !== "safe" && (
                        <>
                          {s.issue && <p className="mb-1 text-xs text-ink-muted">⚠ {s.issue}</p>}
                          {s.suggestion && (
                            <p className="mt-1 rounded bg-paper px-2 py-1 text-xs text-ink-body">
                              <span className="font-medium">Sugestia:</span> {s.suggestion}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revised draft */}
            {result.revised_draft && (
              <div className="overflow-hidden rounded-[14px] border border-accent/40 bg-accent-light">
                <div className="border-b border-accent/20 px-5 py-4">
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Poprawiona wersja</h3>
                </div>
                <div className="px-5 py-5">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-body">
                    {result.revised_draft}
                  </p>
                  {result.key_changes?.length > 0 && (
                    <div className="mt-4 border-t border-accent/20 pt-4">
                      <p className="mb-2 text-xs font-semibold text-ink-muted">Co zmieniono:</p>
                      <ul className="space-y-1">
                        {result.key_changes.map((c, i) => (
                          <li key={i} className="flex gap-2 text-xs leading-relaxed text-ink-muted">
                            <span className="shrink-0">•</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <LegalFooter />
          </div>
        )}
        {!result && <LegalFooter className="mt-8" />}
      </div>
    </main>
  );
}
