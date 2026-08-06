import Link from "next/link";

type AppHeaderProps = {
  actionHref?: string;
  actionLabel?: string;
  backHref?: string;
  backLabel?: string;
};

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center font-display text-2xl font-bold italic tracking-[-0.01em] text-ink"
    >
      Metis
    </Link>
  );
}

export function AppHeader({
  actionHref,
  actionLabel,
  backHref = "/",
  backLabel,
}: AppHeaderProps) {
  return (
    <header className="flex min-h-14 items-center justify-between gap-4 border-b border-border pb-4">
      {backLabel ? (
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:text-accent-hover"
        >
          {backLabel}
        </Link>
      ) : (
        <Wordmark href={backHref} />
      )}
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex min-h-11 items-center text-right text-sm font-semibold text-accent hover:text-accent-hover"
        >
          {actionLabel}
        </Link>
      ) : null}
    </header>
  );
}

export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label="Informacje prawne i bezpieczeństwo"
      className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 ${className}`}
    >
      <Link href="/bezpieczenstwo" className="hover:text-accent">
        Bezpieczeństwo
      </Link>
      <Link href="/prywatnosc" className="hover:text-accent">
        Prywatność
      </Link>
      <Link href="/regulamin" className="hover:text-accent">
        Regulamin
      </Link>
    </nav>
  );
}

export function LegalFooter({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`border-t border-border pt-5 text-center text-xs leading-relaxed text-ink-muted ${className}`}
    >
      <p>
        Metis zapewnia pomoc organizacyjną, nie porady prawne. Ważne decyzje
        skonsultuj z prawnikiem.
      </p>
      <LegalLinks className="mt-4" />
    </footer>
  );
}
