import Link from "next/link";

export default function PublicDemoCard({ className = "" }: { className?: string }) {
  return (
    <section className={`rounded-[14px] border border-accent/40 bg-accent-light p-5 sm:p-7 ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
        Publiczne demo portfolio
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold italic text-ink">
        Zobacz pełne działanie Metisa
      </h2>
      <ul className="mt-5 space-y-2 text-sm leading-relaxed text-ink-body">
        <li>✓ Metis pamięta kontekst sprawy na tym urządzeniu</li>
        <li>✓ Prowadzisz historię osobnych wątków i kontynuujesz rozmowę</li>
        <li>✓ Kolejna analiza uwzględnia ostatnie wymiany z wybranego wątku</li>
        <li>✓ Sprawdzasz własne wersje odpowiedzi zdanie po zdaniu</li>
      </ul>
      <p className="mt-5 text-sm leading-relaxed text-ink-body">
        Wszystkie funkcje demonstracyjne są dostępne bez konta i bez kodu. Dane
        sprawy pozostają w pamięci tej przeglądarki.
      </p>
      <Link
        href="/setup"
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-accent px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-hover sm:w-auto"
      >
        Otwórz pełne demo →
      </Link>
    </section>
  );
}
