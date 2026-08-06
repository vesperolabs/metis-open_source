import type { ReactNode } from "react";
import { AppHeader, LegalFooter } from "./AppChrome";

export function LegalPageLayout({
  eyebrow,
  title,
  intro,
  updated,
  notice,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  notice?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-4xl">
        <AppHeader actionHref="/demo" actionLabel="Sprawdź demo →" />

        <article className="mx-auto max-w-3xl py-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-balance font-display text-4xl font-bold italic leading-tight text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl leading-[1.75] text-ink-body">{intro}</p>
          <p className="mt-4 text-xs text-ink-muted">Ostatnia aktualizacja: {updated}</p>

          {notice ? (
            <aside className="mt-8 rounded-[14px] border border-accent/30 bg-accent-light p-5 text-sm leading-relaxed text-ink-body sm:p-6">
              {notice}
            </aside>
          ) : null}

          <div className="legal-copy mt-10 space-y-10">{children}</div>
        </article>

        <LegalFooter />
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-[1.8] text-ink-body sm:text-base">
        {children}
      </div>
    </section>
  );
}
