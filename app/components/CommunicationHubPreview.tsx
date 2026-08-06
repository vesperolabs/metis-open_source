const THREADS = [
  {
    title: "Weekend 15–17 sierpnia",
    meta: "4 wiadomości",
    active: true,
  },
  {
    title: "Zebranie w szkole",
    meta: "2 wiadomości",
    active: false,
  },
  {
    title: "Ustalenia na wakacje",
    meta: "3 wiadomości",
    active: false,
  },
];

export default function CommunicationHubPreview() {
  return (
    <div
      role="img"
      aria-label="Podgląd centrum komunikacji Metisa z listą wątków, historią rozmowy i celem odpowiedzi"
      className="overflow-hidden rounded-[14px] border border-border bg-cream p-3 sm:p-5"
    >
      <div aria-hidden="true" className="overflow-hidden rounded-[12px] border border-border bg-paper">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
            Centrum komunikacji
          </span>
        </div>

        <div className="grid lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="border-b border-border bg-cream/65 p-3 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between px-2 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted">
                Twoje wątki
              </p>
              <span className="rounded-full border border-border bg-paper px-2 py-0.5 text-[10px] font-semibold text-ink-muted">
                3
              </span>
            </div>

            <div className="mt-1 flex gap-2 overflow-hidden lg:grid lg:grid-cols-1">
              {THREADS.map((thread) => (
                <div
                  key={thread.title}
                  className={`min-w-[185px] rounded-[10px] border px-3 py-3 lg:min-w-0 ${
                    thread.active
                      ? "border-accent/35 bg-accent-light"
                      : "border-transparent bg-paper/70"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        thread.active ? "bg-accent" : "bg-border"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink">
                        {thread.title}
                      </p>
                      <p className="mt-1 text-[10px] text-ink-muted">{thread.meta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex min-h-10 items-center justify-center rounded-[10px] border border-dashed border-accent/40 text-xs font-semibold text-accent">
              + Nowy wątek
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-sm font-semibold text-ink">Weekend 15–17 sierpnia</p>
                <p className="mt-1 text-[10px] text-ink-muted">
                  Metis uwzględnia ostatnie wymiany z tego wątku
                </p>
              </div>
              <span className="self-start rounded-full border border-accent/30 bg-accent-light px-3 py-1 text-[10px] font-semibold text-accent sm:self-auto">
                Kontekst wątku aktywny
              </span>
            </div>

            <div className="space-y-3 px-4 py-5 sm:px-6">
              <div className="max-w-[88%] rounded-[10px] rounded-tl-[4px] bg-cream px-4 py-3 text-xs leading-relaxed text-ink-body sm:max-w-[78%]">
                W ten weekend Zosia zostaje u mnie. Możesz zabrać ją w środę.
                Nie rób z tego znowu problemu.
              </div>

              <div className="ml-auto max-w-[88%] rounded-[10px] rounded-tr-[4px] border border-accent/25 bg-accent-light px-4 py-3 sm:max-w-[78%]">
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-accent">
                  Wysłana odpowiedź ✓
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-body">
                  Nie zgadzam się na zmianę. Trzymajmy się ustalonego weekendu od
                  piątku o 17:00.
                </p>
              </div>

              <div className="max-w-[88%] rounded-[10px] rounded-tl-[4px] bg-cream px-4 py-3 text-xs leading-relaxed text-ink-body sm:max-w-[78%]">
                Chodzi o urodziny koleżanki, które kończą się w sobotę około 13.
              </div>
            </div>

            <div className="border-t border-border bg-cream/45 p-4 sm:p-5">
              <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-ink-muted">
                    Cel kolejnej odpowiedzi
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-ink">
                    Zaproponuj alternatywę
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-ink-muted">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white">
                    3
                  </span>
                  ostatnie wymiany w analizie
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
