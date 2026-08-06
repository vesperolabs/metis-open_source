"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { track } from "@/lib/analytics";
import AccessCodeLinks from "./AccessCodeLinks";
import { LegalFooter, Wordmark } from "./AppChrome";

const UNLOCK_KEY = "metis_demo_unlocked";

// Routes accessible without the access code (public demo funnel).
const PUBLIC_PATHS = [
  "/",
  "/demo",
  "/result",
  "/bezpieczenstwo",
  "/prywatnosc",
  "/regulamin",
];

export default function DemoGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(UNLOCK_KEY) === "true") {
      setUnlocked(true);
      setChecked(true);
      return;
    }

    fetch("/api/demo-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "" }),
    })
      .then((res) => {
        if (res.ok) {
          localStorage.setItem(UNLOCK_KEY, "true");
          setUnlocked(true);
        }
      })
      .finally(() => setChecked(true));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/demo-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      localStorage.setItem(UNLOCK_KEY, "true");
      setUnlocked(true);
      track("demo_unlocked");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nieprawidłowe hasło.");
    }

    setLoading(false);
  }

  function lockDemo() {
    localStorage.removeItem(UNLOCK_KEY);
    setPassword("");
    setUnlocked(false);
  }

  if (PUBLIC_PATHS.includes(pathname)) return <>{children}</>;

  if (!checked) return null;

  if (!unlocked) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="border-b border-border pb-5">
            <Wordmark />
          </div>

          <div className="grid gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-18">
            <section>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                Asystent komunikacji w sprawach o opiekę
              </p>
              <h1 className="text-balance font-display text-4xl font-bold italic leading-[1.15] text-ink sm:text-5xl">
                Zanim odpiszesz — sprawdź czy ta wiadomość nie zaszkodzi Ci w sprawie.
              </h1>
              <p className="mt-6 leading-[1.7] text-ink-body">
                Wklejasz wiadomość od drugiej strony. Metis analizuje ją w kontekście
                Twojej sprawy i pomaga przygotować spokojną, stanowczą odpowiedź.
              </p>
              <p className="mt-3 leading-[1.7] text-ink-body">
                Możesz też sprawdzić własną wersję zdanie po zdaniu, zanim ją wyślesz.
              </p>
              <p className="mt-7 text-sm leading-relaxed text-ink-muted">
                Chcesz najpierw zobaczyć produkt?{" "}
                <Link
                  href="/demo"
                  className="font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:text-accent-hover"
                  onClick={() => track("demo_opened", { from: "gate" })}
                >
                  Zobacz, jak działa Metis — bez kodu i bez podawania czegokolwiek →
                </Link>
              </p>
            </section>

            <section className="self-start rounded-[14px] border border-border bg-cream p-5 sm:p-7">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
                Pełna wersja beta · dostęp na kod
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kod dostępu"
                  className="min-h-12 w-full rounded-[10px] border border-border bg-paper px-4 py-3 text-ink placeholder-ink-muted outline-none transition-shadow focus:border-accent focus:ring-2 focus:ring-accent/15"
                  autoFocus
                />
                {error && (
                  <div className="rounded-[10px] border border-error/25 bg-error-light px-4 py-3 text-sm text-error">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-12 w-full rounded-[10px] bg-accent px-5 py-3 font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
                >
                  {loading ? "Sprawdzam..." : "Uzyskaj dostęp →"}
                </button>
              </form>

              <div className="mt-7 border-t border-border pt-6">
                <p className="mb-3 text-sm leading-relaxed text-ink-body">
                  Nie masz kodu? Napisz — pełną wersję beta uruchamiam obecnie
                  osobiście:
                </p>
                <AccessCodeLinks />
              </div>
            </section>
          </div>

          <p className="text-xs leading-relaxed text-ink-muted">
            Prywatność: dane Twojej sprawy zostają na Twoim urządzeniu. Podczas
            analizy treść trafia do modelu AI, ale Metis nie zapisuje jej w bazie.
            Imiona możesz zastąpić dowolnymi.
          </p>
          <LegalFooter className="mt-4" />
        </div>
      </main>
    );
  }

  return (
    <>
      <div className="fixed bottom-3 right-3 z-50">
        <button
          type="button"
          onClick={lockDemo}
          className="rounded-[10px] border border-border bg-paper px-3 py-2 text-xs font-semibold text-ink-muted shadow-sm hover:bg-cream"
        >
          Zablokuj demo
        </button>
      </div>
      {children}
    </>
  );
}
