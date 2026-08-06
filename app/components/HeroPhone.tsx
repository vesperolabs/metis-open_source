export default function HeroPhone() {
  return (
    <div className="mx-auto w-full max-w-[390px] rounded-[32px] border border-ink/15 bg-ink p-2.5 shadow-[0_24px_70px_rgba(30,42,34,0.18)]" aria-label="Przykład działania Metisa">
      <div className="overflow-hidden rounded-[24px] bg-[#f7f4ed]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-[11px] font-bold tracking-[0.12em] text-ink-muted">WIADOMOŚĆ</span>
          <span className="h-1.5 w-14 rounded-full bg-ink/15" aria-hidden="true" />
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <div className="ml-7 rounded-2xl rounded-br-sm bg-paper px-4 py-3 text-[13px] leading-relaxed text-ink-body shadow-sm">
            W ten weekend nie dam rady przekazać Ci Kuby. Możesz zobaczyć się z nim
            w czwartek przez dwie godziny. Nie rób z tego znowu problemu.
          </div>

          <div className="rounded-[14px] border border-accent/25 bg-accent-light p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-paper px-2.5 py-1 text-[10px] font-bold text-ink-body">
                WYMAGA UWAGI
              </span>
              <span className="rounded-full border border-accent/30 bg-paper px-2.5 py-1 text-[10px] font-bold text-accent">
                SPOKOJNIE I STANOWCZO
              </span>
            </div>
            <p className="mt-3 text-[13px] font-semibold leading-relaxed text-ink">
              Wiadomość jednostronnie zmienia ustalony termin i łączy sprzeciw z
              zarzutem tworzenia konfliktu.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Możesz podtrzymać harmonogram bez tłumaczenia się z zarzutu.
            </p>
          </div>

          <div className="mr-7 rounded-2xl rounded-bl-sm bg-accent px-4 py-3 text-[13px] leading-relaxed text-white">
            Trzymajmy się ustalonego harmonogramu — weekend zgodnie z planem. Jeśli
            pojawiła się konkretna przeszkoda, napisz proszę jaka.
          </div>
        </div>
      </div>
    </div>
  );
}
