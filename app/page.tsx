"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicDemoCard from "@/app/components/PublicDemoCard";
import HeroPhone from "@/app/components/HeroPhone";
import CommunicationHubPreview from "@/app/components/CommunicationHubPreview";
import TrustSection from "@/app/components/TrustSection";
import { LegalLinks, Wordmark } from "@/app/components/AppChrome";
import DemoBanner from "@/app/components/DemoBanner";
import { track } from "@/lib/analytics";
import {
  loadSampleAnalysis,
} from "@/lib/sample";

const STEPS = [
  {
    number: "1",
    title: "Opisujesz sprawę i wklejasz wiadomość",
    description: "Podajesz najważniejsze ustalenia, a potem wklejasz SMS, e-mail lub wiadomość z komunikatora. Imiona możesz zmienić.",
  },
  {
    number: "2",
    title: "Metis analizuje",
    description:
      "Co wynika z treści, Twoje opcje, właściwa postawa i punkty wymagające uwagi.",
  },
  {
    number: "3",
    title: "Odpowiadasz bezpiecznie",
    description:
      "Dostajesz gotową wersję odpowiedzi: spokojną, konkretną i stanowczą tam, gdzie sytuacja tego wymaga.",
  },
];

const FAQS = [
  {
    question: "Czym to się różni od zwykłego ChatGPT?",
    answer:
      "Metis pamięta w Twojej przeglądarce kontekst sprawy — harmonogram, ustalenia i tematy wrażliwe — więc nie tłumaczysz go przy każdej wiadomości. Stosuje stałe zasady bezpieczeństwa, oddziela fakty od interpretacji i proponuje odpowiedzi spokojne, ale nie automatycznie uległe. Nie musisz też układać prompta, kiedy jesteś w emocjach.",
  },
  {
    question: "Czy to porada prawna?",
    answer:
      "Nie — i to jest świadoma granica. Metis pomaga zrozumieć komunikację, uporządkować opcje i przygotować odpowiedź. Gdy wiadomość dotyczy terminu formalnego, roszczenia albo poważnego zarzutu wymagającego profesjonalnej oceny, Metis kieruje do prawnika i przygotowuje pytania na spotkanie.",
  },
  {
    question: "Co się dzieje z moimi wiadomościami?",
    answer:
      "Treść trafia przez serwer Metis do modelu AI — Metis nie zapisuje jej we własnej bazie. W publicznym demo kontekst sprawy i historia wiadomości są przechowywane w Twojej przeglądarce; możesz je usunąć. Według standardowej polityki API dostawcy modelu dane wejściowe i wyniki są zwykle usuwane w ciągu 30 dni, z wyjątkami bezpieczeństwa i prawa. Szybka próba nie tworzy profilu sprawy ani historii.",
  },
  {
    question: "Czy wszystkie funkcje są dostępne?",
    answer:
      "Tak. Metis jest publicznym demem portfolio: bez konta i bez kodu możesz zapisać kontekst sprawy w swojej przeglądarce, analizować wiadomości, prowadzić osobne wątki, wracać do historii i sprawdzać własne odpowiedzi.",
  },
  {
    question: "Skąd mam wiedzieć, że analiza jest trafna?",
    answer:
      "Nie musisz wierzyć na słowo — jedną własną wiadomość możesz sprawdzić w demo i skonfrontować wynik z własną oceną albo z prawnikiem. Metis pokazuje podstawę rekomendacji, niewiadome i możliwe opcje. To narzędzie wspierające decyzję, nie zastępujące Twojej oceny ani profesjonalnej pomocy.",
  },
  {
    question: "Dla kogo jest Metis?",
    answer:
      "Dla rodziców w sprawach o opiekę i kontakty, którzy piszą z drugą stroną wiadomości — i wiedzą, że każda z nich może kiedyś trafić do akt. Jeśli nie macie bezpośredniego kontaktu, a wszystko idzie przez pełnomocników, Metis niewiele Ci pomoże — i mówimy to wprost.",
  },
];

export default function Home() {
  const router = useRouter();

  function showSampleAnalysis(placement: "hero" | "sample") {
    loadSampleAnalysis();
    track("landing_sample_clicked", { placement });
    router.push("/result");
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-20 w-full max-w-6xl items-center justify-between gap-5 px-4 sm:px-6">
          <Wordmark />
          <Link
            href="/setup"
            onClick={() => track("landing_full_demo_clicked", { placement: "header" })}
            className="inline-flex min-h-11 items-center text-right text-sm font-semibold text-accent hover:text-accent-hover"
          >
            Otwórz publiczne demo →
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
        <section className="grid items-center gap-10 py-12 sm:py-14 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-12 lg:py-14">
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
              Asystent komunikacji w sprawach o opiekę
            </p>
            <h1 className="text-balance font-display text-4xl font-bold italic leading-[1.1] tracking-[-0.015em] text-ink sm:text-6xl lg:text-[56px]">
              Zanim odpiszesz — sprawdź, czy ta wiadomość nie zaszkodzi Ci w sprawie.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-[1.65] text-ink-body sm:text-lg">
              Metis analizuje ją w kontekście Twojej sprawy i pomaga przygotować
              spokojną, stanowczą odpowiedź.
            </p>
            <div className="mt-6 max-w-xl">
              <DemoBanner />
            </div>
            <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link
                href="/setup"
                onClick={() => track("landing_full_demo_clicked", { placement: "hero" })}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-[10px] bg-accent px-8 py-4 font-semibold text-white transition-colors hover:bg-accent-hover sm:w-auto"
              >
                Otwórz aplikację →
              </Link>
              <button
                type="button"
                onClick={() => showSampleAnalysis("hero")}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
              >
                Zobacz pełny przykład
              </button>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-ink-muted sm:text-sm">
              Bez konta · dane zapisują się tylko w tej przeglądarce · imiona możesz zmienić
            </p>
          </div>
          <HeroPhone />
        </section>

        <section className="pb-16 pt-4 sm:pb-18" aria-labelledby="value-heading">
          <h2
            id="value-heading"
            className="mx-auto mb-9 max-w-3xl text-balance text-center font-display text-3xl font-bold italic leading-tight text-ink sm:text-4xl"
          >
            W jednej analizie dostajesz to, czego potrzebujesz przed wysłaniem odpowiedzi.
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              ["Co wynika z treści", "Metis oddziela fakty od interpretacji i pokazuje, czego jeszcze nie wiadomo."],
              ["Jaką przyjąć postawę", "Rzeczowo, stanowczo, z prośbą o konkret albo po konsultacji — zależnie od sytuacji."],
              ["Co możesz odpisać", "Dostajesz krótką propozycję odpowiedzi bez zbędnych ustępstw, oskarżeń i urzędowego tonu."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-[14px] border border-border bg-paper p-5 sm:p-6">
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="border-y border-border py-16 sm:py-20"
          aria-labelledby="communication-hub-heading"
        >
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
              W publicznym demo
            </p>
            <h2
              id="communication-hub-heading"
              className="mt-4 text-balance font-display text-3xl font-bold italic leading-tight text-ink sm:text-5xl"
            >
              Cała komunikacja z drugą stroną w jednym miejscu.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl leading-[1.7] text-ink-body">
              Zamiast analizować każdą wiadomość od zera, prowadzisz osobne wątki,
              wracasz do wcześniejszych ustaleń i kontynuujesz rozmowę z właściwym
              kontekstem.
            </p>
          </div>

          <div className="mt-10">
            <CommunicationHubPreview />
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              [
                "Osobne wątki",
                "Weekend, szkoła i wakacje nie mieszają się w jedną długą historię.",
              ],
              [
                "Powrót bez szukania",
                "Widzisz wiadomość, analizę, propozycję i odpowiedź, którą faktycznie wysłałeś/aś.",
              ],
              [
                "Lepsza kolejna odpowiedź",
                "Metis uwzględnia ostatnie wymiany oraz cel, który chcesz osiągnąć.",
              ],
            ].map(([title, description], index) => (
              <article
                key={title}
                className="rounded-[14px] border border-border bg-paper p-5 sm:p-6"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-sm font-bold text-accent">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <TrustSection />

        <section className="-mx-4 bg-cream px-6 py-14 text-center sm:mx-0 sm:rounded-[14px] sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Z rozmów z rodzicami
          </p>
          <blockquote className="mx-auto mt-4 max-w-3xl font-display text-2xl font-bold italic leading-relaxed text-ink sm:text-3xl">
            „To był taktyczny błąd. Nie powinienem był tego pisać, ale emocje robią swoje...”
          </blockquote>
          <p className="mt-3 text-xs text-ink-muted">Anonimowy użytkownik</p>
        </section>

        <section className="border-b border-border py-16 sm:py-18" aria-labelledby="steps-heading">
          <h2
            id="steps-heading"
            className="mb-10 text-center font-display text-3xl font-bold italic text-ink"
          >
            Jak to działa
          </h2>
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3 sm:gap-10">
            {STEPS.map((step) => (
              <div key={step.number}>
                <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-sm font-bold text-accent">
                  {step.number}
                </span>
                <h3 className="font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="trust-heading">
          <h2
            id="trust-heading"
            className="font-display text-3xl font-bold italic text-ink"
          >
            Dla kogo jest Metis
          </h2>
          <p className="mt-4 leading-relaxed text-ink-body">
            Dla rodziców w sprawach o opiekę i kontakty, którzy regularnie piszą
            z drugą stroną i chcą odpowiadać spokojnie, ale bez niepotrzebnych
            ustępstw. Metis jest najbardziej pomocny wtedy, gdy trzeba szybko
            ochłonąć, uwzględnić wcześniejsze ustalenia i przygotować rzeczową odpowiedź.
          </p>
          <ul className="mt-6 space-y-3 rounded-[14px] border border-border bg-cream p-5 text-sm leading-relaxed text-ink-body sm:p-6">
            <li>
              🔒 Podczas analizy treść trafia do modelu AI. Metis nie zapisuje jej w bazie.
            </li>
            <li>👤 Imiona i szczegóły możesz zastąpić dowolnymi.</li>
            <li>⚖️ To pomoc organizacyjna, nie porada prawna.</li>
          </ul>
        </section>

        <div className="mx-auto mt-16 max-w-3xl">
          <PublicDemoCard />
        </div>

        <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="font-display text-3xl font-bold italic text-ink"
          >
            Najczęstsze pytania
          </h2>
          <dl className="mt-7">
            {FAQS.map((item) => (
              <div key={item.question} className="border-b border-border py-7 first:pt-0 last:border-0">
                <dt className="font-semibold text-ink">{item.question}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-ink-body">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto mt-16 max-w-3xl rounded-[14px] border border-accent/40 bg-accent-light px-6 py-10 text-center sm:px-12 sm:py-12">
          <h2 className="font-display text-3xl font-bold italic text-ink">
            Zanim wyślesz — sprawdź.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-body">
            Wklej jedną wiadomość i zobacz, co z niej wynika, jaką przyjąć postawę
            oraz jak napisać spokojną, stanowczą odpowiedź.
          </p>
          <Link
            href="/setup"
            onClick={() => track("landing_full_demo_clicked", { placement: "final" })}
            className="mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-[10px] bg-accent px-7 py-3.5 font-semibold text-white transition-colors hover:bg-accent-hover sm:w-auto"
          >
            Otwórz publiczne demo →
          </Link>
          <p className="mt-3 text-xs text-ink-muted">
            Bez konta · pełne funkcje · dane przechowywane lokalnie
          </p>
        </section>

        <footer className="mt-16 border-t border-border pt-9 text-center text-xs leading-relaxed text-ink-muted">
          <Wordmark />
          <p className="mt-6">Metis · publiczne demo portfolio · open source · bez konta</p>
          <p className="mt-2">
            Metis zapewnia pomoc organizacyjną, nie porady prawne. Ważne decyzje
            skonsultuj z prawnikiem.
          </p>
          <a
            href="https://github.com/vesperolabs/metis-open_source"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-11 items-center font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
          >
            Zobacz kod na GitHubie →
          </a>
          <LegalLinks className="mt-5" />
        </footer>
      </div>
    </main>
  );
}
