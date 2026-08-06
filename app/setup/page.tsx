"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { clearCaseData, loadCaseProfile, saveCaseProfile } from "@/lib/case-profile";
import { loadSampleAnalysis } from "@/lib/sample";
import { AppHeader, LegalFooter } from "@/app/components/AppChrome";

export default function SetupPage() {
  const router = useRouter();
  const [context, setContext] = useState("");
  const [userName, setUserName] = useState("");
  const [otherPartyName, setOtherPartyName] = useState("");
  const [toneSamples, setToneSamples] = useState("");
  const [importInfo, setImportInfo] = useState("");
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  useEffect(() => {
    const profile = loadCaseProfile();
    setContext(profile.context);
    setUserName(profile.userName);
    setOtherPartyName(profile.otherPartyName);
    setToneSamples(profile.toneSamples);
    setHasSavedProfile(Boolean(profile.context));
  }, []);

  function persist() {
    saveCaseProfile({ context, userName, otherPartyName, toneSamples });
    setHasSavedProfile(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!context.trim()) return;
    persist();
    router.push("/analyze");
  }

  function exportContext() {
    const data = {
      metis_context_export: 1,
      context: context.trim(),
      userName: userName.trim(),
      otherPartyName: otherPartyName.trim(),
      toneSamples: toneSamples.trim(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "metis-kontekst.json";
    a.click();
    URL.revokeObjectURL(url);
    track("context_exported");
  }

  function importContext(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || data.metis_context_export !== 1) {
          setImportInfo("To nie wygląda na plik kontekstu Metisa.");
          return;
        }
        setContext(data.context || "");
        setUserName(data.userName || "");
        setOtherPartyName(data.otherPartyName || "");
        setToneSamples(data.toneSamples || "");
        setImportInfo("Kontekst wczytany — kliknij 'Zapisz', żeby go zachować na tym urządzeniu.");
        track("context_imported");
      } catch {
        setImportInfo("Nie udało się odczytać pliku.");
      }
    };
    reader.readAsText(file);
  }

  function removeCaseData() {
    const confirmed = window.confirm(
      "Usunąć zapisany kontekst, imiona, próbki stylu, wyniki i całą historię wiadomości z tego urządzenia?"
    );
    if (!confirmed) return;

    clearCaseData();
    setContext("");
    setUserName("");
    setOtherPartyName("");
    setToneSamples("");
    setHasSavedProfile(false);
    setImportInfo("Dane sprawy zostały usunięte z tego urządzenia.");
    track("case_data_cleared");
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <AppHeader />

        <h1 className="mt-10 font-display text-4xl font-bold italic leading-tight text-ink sm:text-5xl">
          Kontekst sprawy
        </h1>
        <p className="mt-5 leading-[1.7] text-ink-body">
          <strong>Wystarczą 2-3 zdania na start</strong> — kto, jaki układ opieki,
          o co toczy się spór. Szczegóły i fragmenty dokumentów możesz dodać
          później, w każdej chwili.
        </p>
        {hasSavedProfile && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-accent/30 bg-accent-light px-4 py-3 text-sm text-ink-body">
            <span>Kontekst jest zapisany na tym urządzeniu i będzie używany przy kolejnych analizach.</span>
            <button
              type="button"
              onClick={removeCaseData}
              className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
            >
              Usuń dane tej sprawy
            </button>
          </div>
        )}
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Wolisz najpierw zobaczyć, jak wygląda analiza?{" "}
          <button
            type="button"
            onClick={() => {
              loadSampleAnalysis();
              track("sample_analysis_viewed");
              router.push("/result");
            }}
            className="inline-flex min-h-11 items-center font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
          >
            Zobacz przykład — bez podawania czegokolwiek →
          </button>
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-7 rounded-[14px] border border-border bg-paper p-5 sm:p-7"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink-body">
                Twoje imię <span className="font-normal text-ink-muted">(opcjonalne)</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="np. Marcin"
                className="min-h-12 w-full rounded-[10px] border border-border bg-paper px-4 py-3 text-ink placeholder-ink-muted outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink-body">
                Imię drugiej strony <span className="font-normal text-ink-muted">(opcjonalne)</span>
              </label>
              <input
                type="text"
                value={otherPartyName}
                onChange={(e) => setOtherPartyName(e.target.value)}
                placeholder="np. Agnieszka"
                className="min-h-12 w-full rounded-[10px] border border-border bg-paper px-4 py-3 text-ink placeholder-ink-muted outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-body">
              Kontekst sprawy <span className="text-error">*</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              required
              rows={7}
              placeholder={`Np.: Marcin (ojciec) i Agnieszka (matka), córka 6 lat. Opieka naprzemienna tydzień/tydzień, w toku sprawa o alimenty. Nie chcę poruszać tematów finansowych w wiadomościach.

(Imiona możesz zastąpić dowolnymi. Więcej szczegółów = lepsza analiza, ale możesz je dodać później.)`}
              className="w-full resize-none rounded-[10px] border border-border bg-paper px-4 py-3 text-sm leading-relaxed text-ink placeholder-ink-muted outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Kontekst zostaje w Twojej przeglądarce i Metis nie zapisuje go w
              bazie. Podczas analizy trafia do modelu AI w celu przygotowania
              odpowiedzi. Imiona możesz zastąpić dowolnymi.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink-body">
              Twój styl pisania{" "}
              <span className="font-normal text-ink-muted">(opcjonalne)</span>
            </label>
            <textarea
              value={toneSamples}
              onChange={(e) => setToneSamples(e.target.value)}
              rows={4}
              placeholder={`Wklej 2-3 swoje typowe wiadomości (mogą być o czymkolwiek). Metis dopasuje ton proponowanych odpowiedzi do Ciebie — będą brzmiały jak Ty, nie jak urzędnik.`}
              className="w-full resize-none rounded-[10px] border border-border bg-paper px-4 py-3 text-sm leading-relaxed text-ink placeholder-ink-muted outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
            />
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Bez tego Metis użyje neutralnego, spokojnego stylu. Z próbkami —
              odpowiedzi będą naturalniejsze i trudniejsze do rozpoznania jako AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <button
              type="submit"
              disabled={!context.trim()}
              className="min-h-14 w-full rounded-[10px] bg-accent px-8 py-3 font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              {hasSavedProfile ? "Zapisz zmiany i przejdź do analizy →" : "Zapisz i przejdź do analizy →"}
            </button>
            <button
              type="button"
              onClick={exportContext}
              disabled={!context.trim()}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover disabled:opacity-40"
            >
              Pobierz kontekst (plik)
            </button>
            <label className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover">
              Wczytaj kontekst z pliku
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importContext(f);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          {importInfo && (
            <p className="rounded-[10px] border border-border bg-cream px-4 py-3 text-sm leading-relaxed text-ink-body">{importInfo}</p>
          )}
        </form>
        <LegalFooter className="mt-8" />
      </div>
    </main>
  );
}
