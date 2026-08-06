"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  canShowHighDraftOverride,
  hasDraftReply,
  shouldShowDraftEditor,
  validateAnalysisResult,
  type AnalysisResult,
} from "@/lib/analysis";
import { track } from "@/lib/analytics";
import FullAccessCard from "@/app/components/FullAccessCard";
import { AppHeader, LegalFooter } from "@/app/components/AppChrome";
import { loadStoredAnalysis, type AnalysisSource } from "@/lib/result-storage";
import { saveSentReply } from "@/lib/message-history";

const RISK_LABELS: Record<string, string> = {
  HIGH: "Wysokie ryzyko",
  MEDIUM: "Średnie ryzyko",
  LOW: "Niskie ryzyko",
};

const RISK_CLASSES: Record<string, string> = {
  HIGH: "bg-error-light text-error border border-error/25",
  MEDIUM: "bg-cream text-ink-body border border-border",
  LOW: "bg-accent-light text-accent border border-accent/30",
};

const DECISION_LABELS: Record<string, string> = {
  yes: "Odpowiedz",
  no: "Nie odpowiadaj",
  consult_lawyer: "Skonsultuj z prawnikiem",
};

const DECISION_CLASSES: Record<string, string> = {
  yes: "bg-accent-light text-accent border border-accent/30",
  no: "bg-cream text-ink-body border border-border",
  consult_lawyer: "bg-error-light text-error border border-error/25",
};

const STANCE_LABELS: Record<AnalysisResult["recommended_stance"], string> = {
  neutral: "Rzeczowo",
  firm: "Spokojnie i stanowczo",
  clarify: "Najpierw doprecyzuj",
  consult: "Skonsultuj",
};

function AnalysisSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border px-5 py-5 last:border-0 sm:px-8 sm:py-6">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function BulletList({
  items,
  variant = "plain",
}: {
  items: string[];
  variant?: "plain" | "risk" | "avoid";
}) {
  if (!items?.length) return <p className="text-sm italic text-ink-muted">Brak</p>;

  const icon = variant === "risk" ? "!" : variant === "avoid" ? "×" : "·";

  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-body sm:text-[15px]">
          <span
            className={
              variant === "risk"
                ? "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-error-light text-xs font-bold text-error"
                : variant === "avoid"
                  ? "shrink-0 font-bold text-error"
                  : "shrink-0 text-ink-muted"
            }
            aria-hidden="true"
          >
            {icon}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DraftEditor({
  copied,
  draft,
  isHigh,
  canEvaluate,
  onChange,
  onCopy,
}: {
  copied: boolean;
  draft: string;
  isHigh: boolean;
  canEvaluate: boolean;
  onChange: (value: string) => void;
  onCopy: () => void;
}) {
  return (
    <section className="mt-5 rounded-[14px] border border-accent/40 bg-accent-light p-5 sm:p-7">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
        Proponowana odpowiedź
      </p>
      {isHigh && (
        <div className="mt-4 rounded-[10px] border border-error/25 bg-error-light px-4 py-3 text-xs leading-relaxed text-error">
          Uwaga: ta wiadomość wymaga konsultacji z prawnikiem. Propozycja odpowiedzi poniżej
          jest dostępna na Twoją wyraźną prośbę.
        </div>
      )}
      <textarea
        value={draft}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        className="mt-4 w-full resize-none rounded-[10px] border border-border bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15 sm:text-[15px]"
      />
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
        Możesz edytować przed skopiowaniem — odpowiedź ma brzmieć jak Ty, nie jak automat.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCopy}
          disabled={!draft.trim()}
          className="inline-flex min-h-12 items-center justify-center rounded-[10px] bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
        >
          {copied ? "Skopiowano ✓" : "Kopiuj odpowiedź"}
        </button>
        {canEvaluate && (
          <Link
            href="/evaluate"
            className="inline-flex min-h-12 items-center justify-center rounded-[10px] border border-border bg-paper px-6 py-3 text-sm font-semibold text-ink-body transition-colors hover:bg-cream"
            onClick={() => {
              localStorage.setItem("metis_draft_to_evaluate", draft);
              track("evaluate_opened", { from: "result" });
            }}
          >
            Sprawdź moją wersję →
          </Link>
        )}
      </div>
    </section>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [draft, setDraft] = useState("");
  const [showHighOverride, setShowHighOverride] = useState(false);
  const [copied, setCopied] = useState(false);
  const [questionsCopied, setQuestionsCopied] = useState(false);
  const [source, setSource] = useState<AnalysisSource>("app");
  const [threadId, setThreadId] = useState("");
  const [historyEntryId, setHistoryEntryId] = useState("");
  const [historySaveError, setHistorySaveError] = useState("");
  const [sentReplySaved, setSentReplySaved] = useState(false);

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      track("draft_copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  async function copyLawyerQuestions() {
    if (!result?.lawyer_questions?.length) return;
    try {
      await navigator.clipboard.writeText(
        "Pytania na spotkanie z prawnikiem:\n" +
          result.lawyer_questions.map((q) => `• ${q}`).join("\n")
      );
      setQuestionsCopied(true);
      track("lawyer_questions_copied");
      window.setTimeout(() => setQuestionsCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  function saveCurrentReply() {
    if (!historyEntryId || !draft.trim()) return;
    if (!saveSentReply(historyEntryId, draft)) {
      setHistorySaveError("Nie udało się zapisać wysłanej odpowiedzi na tym urządzeniu.");
      return;
    }
    setSentReplySaved(true);
    track("sent_reply_saved");
  }

  useEffect(() => {
    const stored = loadStoredAnalysis();
    if (!stored) {
      router.replace("/demo");
      return;
    }

    const validation = validateAnalysisResult(stored.result);
    if (!validation.ok) {
      router.replace(stored.source === "app" ? "/analyze" : "/demo");
      return;
    }

    setResult(validation.data);
    setDraft(validation.data.draft_reply || "");
    setSource(stored.source);
    setThreadId(stored.threadId || "");
    setHistoryEntryId(stored.historyEntryId || "");
    setHistorySaveError(stored.historySaveError || "");
  }, [router]);

  if (!result) return null;

  const isHigh = result.risk_level === "HIGH";
  const hasDraft = hasDraftReply(result);
  const showDraft = shouldShowDraftEditor(result, showHighOverride);
  const showHighOverrideButton = canShowHighDraftOverride(result);
  const verdictTitle =
    isHigh || result.should_reply === "consult_lawyer"
      ? "Skonsultuj z prawnikiem, zanim odpowiesz."
      : result.should_reply === "no"
        ? "Nie odpowiadaj teraz."
        : result.recommended_stance === "firm"
          ? "Odpowiedz spokojnie i stanowczo."
          : result.recommended_stance === "clarify"
            ? "Dopytaj — krótko i rzeczowo."
            : "Odpowiedz — krótko i rzeczowo.";

  const isFullAppResult = source === "app";

  return (
    <main className={`min-h-screen px-4 py-6 sm:px-6 sm:py-8 ${showDraft && hasDraft ? "pb-28 md:pb-8" : ""}`}>
      <div className="mx-auto max-w-3xl">
        <AppHeader
          actionHref={isFullAppResult ? "/analyze" : "/demo"}
          actionLabel={isFullAppResult ? "Analizuj kolejną wiadomość →" : "Wróć do demo →"}
        />

        <p className="mt-8 text-sm leading-relaxed text-ink-muted">
          Przeczytaliśmy wiadomość. Oto co warto wiedzieć, zanim cokolwiek napiszesz.
        </p>

        <section className="mt-4 rounded-[14px] bg-cream p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
              Zalecenie
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${RISK_CLASSES[result.risk_level]}`}>
                {RISK_LABELS[result.risk_level]}
              </span>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${DECISION_CLASSES[result.should_reply]}`}>
                {DECISION_LABELS[result.should_reply]}
              </span>
              <span className="inline-flex rounded-full border border-accent/30 bg-paper px-3 py-1 text-xs font-semibold text-accent">
                {STANCE_LABELS[result.recommended_stance]}
              </span>
            </div>
          </div>
          <h1 className="mt-3 text-balance font-display text-3xl font-bold italic leading-tight text-ink sm:text-4xl">
            {verdictTitle}
          </h1>
          <p className="mt-4 text-sm leading-[1.7] text-ink-body sm:text-[15px]">
            {result.risk_explanation}
          </p>
          <p className="mt-3 text-sm leading-[1.65] text-ink-muted">
            {result.decision_explanation}
          </p>
        </section>

        {isHigh && !showDraft ? (
          <section className="mt-5 rounded-[14px] border border-error/30 bg-error-light p-5 sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-error">
              Następny krok: pytania do prawnika
            </p>
            <div className="mt-4">
              <BulletList items={result.lawyer_questions} />
            </div>
            {result.lawyer_questions?.length > 0 && (
              <button
                type="button"
                onClick={copyLawyerQuestions}
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover sm:w-auto"
              >
                {questionsCopied ? "Skopiowano ✓" : "Kopiuj pytania do prawnika"}
              </button>
            )}
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              To jest właściwy następny krok w tej sprawie — masz gotową listę na
              spotkanie, zaoszczędzi Ci płatnych minut u pełnomocnika.
            </p>
            {showHighOverrideButton ? (
              <button
                type="button"
                onClick={() => setShowHighOverride(true)}
                className="mt-3 inline-flex min-h-11 items-center text-left text-sm font-semibold text-ink-muted underline underline-offset-4 hover:text-ink-body"
              >
                Rozumiem ryzyko — pokaż propozycję odpowiedzi mimo to
              </button>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                Propozycja odpowiedzi nie została przygotowana ze względu na wysokie ryzyko. To
                poprawne zachowanie dla tej klasy wiadomości.
              </p>
            )}
          </section>
        ) : (
          <DraftEditor
            copied={copied}
            draft={draft}
            isHigh={isHigh}
            canEvaluate={isFullAppResult}
            onChange={(value) => {
              setDraft(value);
              setSentReplySaved(false);
            }}
            onCopy={copyDraft}
          />
        )}

        {isFullAppResult && historySaveError && (
          <div className="mt-5 rounded-[10px] border border-error/25 bg-error-light px-4 py-3 text-sm leading-relaxed text-error">
            {historySaveError}
          </div>
        )}

        {isFullAppResult && threadId && (
          <section className="mt-5 rounded-[14px] border border-border bg-paper p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                  Zapisano w historii
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-body">
                  Ta wiadomość i analiza są częścią wątku na tym urządzeniu.
                </p>
              </div>
              <Link
                href={`/history?thread=${encodeURIComponent(threadId)}`}
                className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
              >
                Otwórz wątek →
              </Link>
            </div>
            {historyEntryId && draft.trim() && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm leading-relaxed text-ink-body">
                  Jeśli wyślesz tę odpowiedź po własnych zmianach, zapisz jej ostateczną
                  wersję. Metis uwzględni ją przy kolejnej wiadomości w tym wątku.
                </p>
                <button
                  type="button"
                  onClick={saveCurrentReply}
                  disabled={sentReplySaved}
                  className={`mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[10px] border px-6 py-3 text-center text-sm font-semibold transition-colors sm:w-auto ${
                    sentReplySaved
                      ? "border-accent/30 bg-accent-light text-accent"
                      : "border-accent bg-accent text-white hover:bg-accent-hover"
                  }`}
                >
                  {sentReplySaved ? "Zapisano jako wysłaną ✓" : "Zapisz tę wersję jako wysłaną"}
                </button>
              </div>
            )}
          </section>
        )}

        <div className="mt-5 overflow-hidden rounded-[14px] border border-border bg-paper">
          <AnalysisSection title="Co wynika z wiadomości">
            <p className="text-sm leading-[1.7] text-ink-body sm:text-[15px]">
              {result.message_summary}
            </p>
          </AnalysisSection>

          <AnalysisSection title="Rekomendowana postawa">
            <p className="text-sm font-semibold text-ink-body sm:text-[15px]">
              {STANCE_LABELS[result.recommended_stance]}
            </p>
            {result.stance_explanation && (
              <p className="mt-2 text-sm leading-[1.7] text-ink-muted sm:text-[15px]">
                {result.stance_explanation}
              </p>
            )}
          </AnalysisSection>

          {result.options?.length > 0 && (
            <AnalysisSection title="Twoje opcje">
              <BulletList items={result.options} />
            </AnalysisSection>
          )}

          {result.attention_points?.length > 0 && (
            <AnalysisSection title="Na co zwrócić uwagę">
              <BulletList items={result.attention_points} variant="risk" />
            </AnalysisSection>
          )}

          {result.what_not_to_write?.length > 0 && (
            <AnalysisSection title="Czego nie pisać">
              <BulletList items={result.what_not_to_write} variant="avoid" />
            </AnalysisSection>
          )}
        </div>

        {!isHigh && result.lawyer_questions?.length > 0 && (
          <section className="mt-5 rounded-[14px] border border-border bg-paper p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                Na później: pytania do prawnika
              </h2>
              <button
                type="button"
                onClick={copyLawyerQuestions}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
              >
                {questionsCopied ? "Skopiowano ✓" : "Kopiuj pytania do prawnika"}
              </button>
            </div>
            <div className="mt-4">
              <BulletList items={result.lawyer_questions} />
            </div>
          </section>
        )}

        {source === "sample" && (
          <section className="mt-5 rounded-[14px] border border-accent/40 bg-accent-light p-5 sm:p-7">
            <p className="font-semibold text-ink">
              To był przykład. Twoja sytuacja jest inna — sprawdź ją.
            </p>
            <Link
              href="/demo"
              onClick={() => track("sample_result_demo_clicked")}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-accent px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-hover sm:w-auto"
            >
              Przetestuj jedną własną wiadomość w demo →
            </Link>
            <p className="mt-3 text-xs text-ink-muted">
              Jednorazowe demo · kontekst tej próby nie jest zapamiętywany
            </p>
          </section>
        )}

        {source === "demo" && <FullAccessCard className="mt-5" />}

        <LegalFooter className="mt-7" />
      </div>

      {showDraft && hasDraft && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-paper/95 p-3 backdrop-blur-sm md:hidden">
          <button
            type="button"
            onClick={copyDraft}
            className="flex min-h-14 w-full items-center justify-center rounded-[10px] bg-accent px-5 py-3 font-semibold text-white"
          >
            {copied ? "Skopiowano ✓" : "Kopiuj odpowiedź"}
          </button>
        </div>
      )}
    </main>
  );
}
