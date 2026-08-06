"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { AppHeader, LegalFooter } from "@/app/components/AppChrome";
import BetaBanner from "@/app/components/BetaBanner";
import FullAccessCard from "@/app/components/FullAccessCard";
import {
  SAMPLE_CONTEXT,
  SAMPLE_MESSAGE,
  loadSampleAnalysis,
} from "@/lib/sample";
import { storeTransientAnalysis } from "@/lib/result-storage";

// New key gives visitors one clean attempt after the demo/full-version split.
// The previous key was also set by the earlier beta flow and caused false paywalls.
const FREE_USED_KEY = "metis_demo_free_used_v2";

const LOADING_STEPS = [
  "Czytam wiadomość…",
  "Sprawdzam, co z niej wynika…",
  "Dobieram właściwą postawę…",
  "Przygotowuję spokojną, stanowczą odpowiedź…",
];

export default function DemoPage() {
  const router = useRouter();
  const [context, setContext] = useState(SAMPLE_CONTEXT);
  const [message, setMessage] = useState(SAMPLE_MESSAGE);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [freeUsed, setFreeUsed] = useState(false);
  const [showCodeContact, setShowCodeContact] = useState(false);
  const [sampleSeen, setSampleSeen] = useState(false);
  const [loopHint, setLoopHint] = useState(false);
  const [ctxHintShown, setCtxHintShown] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setFreeUsed(localStorage.getItem(FREE_USED_KEY) === "true");
    setSampleSeen(localStorage.getItem("metis_sample_seen") === "true");
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

  const isUnchanged =
    message.trim() === SAMPLE_MESSAGE.trim() &&
    context.trim() === SAMPLE_CONTEXT.trim();

  const messageEdited = message.trim() !== SAMPLE_MESSAGE.trim();
  const contextUntouched = context.trim() === SAMPLE_CONTEXT.trim();

  async function handleAnalyze() {
    setError("");
    setShowCodeContact(false);
    setLoopHint(false);

    // Unchanged sample → instant pre-baked analysis, no API call.
    if (isUnchanged) {
      // User already saw the sample → don't loop them back to the same result.
      if (sampleSeen) {
        setLoopHint(true);
        messageRef.current?.focus();
        return;
      }
      loadSampleAnalysis();
      setSampleSeen(true);
      track("sample_analysis_viewed", { mode: "demo" });
      router.push("/result");
      return;
    }

    // Edited message but sample context left in place → analysis would be off.
    if (messageEdited && contextUntouched && !ctxHintShown) {
      setCtxHintShown(true);
      return;
    }

    // Edited → one real analysis without access code.
    if (freeUsed) {
      setShowCodeContact(true);
      return;
    }

    if (!message.trim() || !context.trim()) return;
    setLoading(true);
    track("analysis_started", {
      channel: "Demo",
      chars: message.trim().length,
      mode: "demo",
    });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context,
          userName: "",
          otherPartyName: "",
          message,
          channel: "Demo",
          date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Błąd serwera (${res.status})`);
      }

      const result = await res.json();

      if (result && result.manualMode) {
        throw new Error("Analiza chwilowo niedostępna. Spróbuj ponownie za chwilę.");
      }

      storeTransientAnalysis({ result, message, source: "demo" });
      localStorage.setItem(FREE_USED_KEY, "true");
      track("analysis_completed", { channel: "Demo", mode: "demo" });
      router.push("/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd. Spróbuj ponownie.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <AppHeader />

        <h1 className="mt-10 font-display text-4xl font-bold italic leading-tight text-ink sm:text-5xl">
          Jednorazowe demo Metisa
        </h1>
        <div className="mt-5 max-w-xl">
          <BetaBanner />
        </div>
        <p className="mt-6 leading-relaxed text-ink-body">
          Zobacz gotowy przykład albo podmień treść i sprawdź jedną własną
          wiadomość.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Kontekst tej próby jest tymczasowy i nie zostanie zapamiętany. Pełna
          wersja zachowuje kontekst na Twoim urządzeniu i używa go przy kolejnych
          analizach.
        </p>

        <div className="mt-8 space-y-5 rounded-[14px] border border-border bg-paper p-5 sm:p-7">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-body">
              Kontekst sprawy
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-[10px] border border-border bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Tylko na potrzeby tej jednej próby — demo nie zapisze tego kontekstu.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-body">
              Wiadomość od drugiej strony
            </label>
            <textarea
              ref={messageRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-[10px] border border-border bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Podczas analizy treść trafia do modelu AI. Metis nie zapisuje jej w bazie.
            </p>
          </div>

          {loopHint && (
            <div className="rounded-[10px] border border-border bg-cream px-4 py-3 text-sm leading-relaxed text-ink-body">
              To ten sam przykład, który właśnie widziałeś 🙂 Podmień wiadomość
              (i kontekst) na swoją sytuację — masz jedną analizę demo, bez
              kodu i bez podawania danych.
            </div>
          )}

          {ctxHintShown && messageEdited && contextUntouched && (
            <div className="rounded-[10px] border border-accent/30 bg-accent-light px-4 py-3 text-sm leading-relaxed text-ink-body">
              Podmień też <strong>kontekst sprawy</strong> na swój (wystarczą 2-3
              zdania: kto, jaki układ opieki, o co spór) — bez tego analiza
              będzie liczona na tle przykładowej sprawy i wyjdzie nietrafna.
              Jeśli chcesz kontynuować mimo to, kliknij "Analizuj" ponownie.
            </div>
          )}

          {showCodeContact && (
            <FullAccessCard />
          )}

          {error && (
            <div className="rounded-[10px] border border-error/25 bg-error-light px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || !message.trim()}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[10px] bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40 sm:w-auto"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {LOADING_STEPS[loadingStep]}
              </>
            ) : isUnchanged ? (
              "Zobacz przykładową analizę →"
            ) : (
              "Analizuj moją wiadomość →"
            )}
          </button>

          {loading && (
            <p className="text-xs text-ink-muted">
              Pełna analiza trwa zwykle 15–20 sekund.
            </p>
          )}

          <LegalFooter className="mt-2" />
          <p className="text-center text-xs text-ink-muted">
            Jedna własna analiza · kontekst tej próby nie jest zapamiętywany
          </p>
        </div>
      </div>
    </main>
  );
}
