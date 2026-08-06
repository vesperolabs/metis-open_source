import Link from "next/link";

const DATA_FLOW = [
  {
    number: "01",
    title: "Twoje urządzenie",
    description: "Kontekst sprawy i historia publicznego demo są zapisane lokalnie w tej przeglądarce.",
  },
  {
    number: "02",
    title: "Bezpieczne połączenie",
    description: "Do analizy wysyłasz tylko treść, którą samodzielnie wpiszesz lub wkleisz.",
  },
  {
    number: "03",
    title: "Model AI",
    description: "Groq przetwarza wiadomość, kontekst i ostatnie wymiany potrzebne do odpowiedzi.",
  },
  {
    number: "04",
    title: "Wynik u Ciebie",
    description: "Metis pokazuje analizę i nie tworzy własnej centralnej bazy Twojej sprawy.",
  },
];

export default function TrustSection() {
  return (
    <section
      className="border-b border-border py-16 sm:py-20"
      aria-labelledby="data-trust-heading"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
          Prywatność bez niedomówień
        </p>
        <h2
          id="data-trust-heading"
          className="mt-4 text-balance font-display text-3xl font-bold italic leading-tight text-ink sm:text-5xl"
        >
          Twoja sprawa nie trafia do naszej bazy.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl leading-[1.7] text-ink-body">
          Dane publicznego demo zostają w Twojej przeglądarce. Podczas analizy wybrana
          treść przechodzi przez serwer Metis do modelu AI — pokazujemy ten przepływ
          wprost.
        </p>
      </div>

      <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DATA_FLOW.map((step) => (
          <li
            key={step.number}
            className="relative rounded-[14px] border border-border bg-paper p-5"
          >
            <span className="text-xs font-bold tracking-[0.14em] text-accent">
              {step.number}
            </span>
            <h3 className="mt-5 font-semibold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {step.description}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid overflow-hidden rounded-[14px] border border-border bg-cream md:grid-cols-2">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Metis zawsze
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-body">
            <li>✓ pozwala zmienić imiona i ograniczyć szczegóły,</li>
            <li>✓ pokazuje granice analizy i kieruje do prawnika,</li>
            <li>✓ pozwala usunąć lokalny kontekst i historię.</li>
          </ul>
        </div>
        <div className="border-t border-border bg-paper p-6 sm:p-8 md:border-l md:border-t-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
            Metis nigdy
          </p>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink-body">
            <li>× nie sprzedaje treści Twoich wiadomości,</li>
            <li>× nie używa nagrywania sesji ani automatycznego śledzenia kliknięć,</li>
            <li>× nie przedstawia analizy jako profesjonalnej porady prawnej.</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold">
        <Link
          href="/bezpieczenstwo"
          className="inline-flex min-h-11 items-center text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
        >
          Zobacz, jak chronimy dane →
        </Link>
        <Link
          href="/prywatnosc"
          className="inline-flex min-h-11 items-center text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
        >
          Przeczytaj politykę prywatności →
        </Link>
      </div>
    </section>
  );
}
