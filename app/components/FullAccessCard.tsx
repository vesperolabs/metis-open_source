import AccessCodeLinks from "./AccessCodeLinks";

export default function FullAccessCard({ className = "" }: { className?: string }) {
  return (
    <section className={`rounded-[14px] border border-accent/40 bg-accent-light p-5 sm:p-7 ${className}`}>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
        Pełna wersja beta
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold italic text-ink">
        Chcesz korzystać dalej?
      </h2>
      <ul className="mt-5 space-y-2 text-sm leading-relaxed text-ink-body">
        <li>✓ Metis pamięta kontekst sprawy na tym urządzeniu</li>
        <li>✓ Prowadzisz historię osobnych wątków i kontynuujesz rozmowę</li>
        <li>✓ Kolejna analiza uwzględnia ostatnie wymiany z wybranego wątku</li>
        <li>✓ Sprawdzasz własne wersje odpowiedzi zdanie po zdaniu</li>
      </ul>
      <p className="mt-5 text-sm leading-relaxed text-ink-body">
        Po jednorazowym demo napisz po kod. Pełną wersję beta uruchamiam obecnie
        osobiście.
      </p>
      <div className="mt-4">
        <AccessCodeLinks />
      </div>
    </section>
  );
}
