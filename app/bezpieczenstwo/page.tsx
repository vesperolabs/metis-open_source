import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/app/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Bezpieczeństwo | Metis",
  description: "Jak Metis przetwarza wiadomości i chroni dane sprawy.",
};

const FLOW = [
  ["1", "Twoja przeglądarka", "Kontekst sprawy i historia publicznego demo są zapisywane lokalnie na używanym urządzeniu."],
  ["2", "Serwer Metis", "Po kliknięciu „Analizuj” wybrana treść jest przesyłana szyfrowanym połączeniem do serwera aplikacji na Vercel."],
  ["3", "Groq", "Serwer przekazuje modelowi AI wiadomość, potrzebny kontekst i maksymalnie trzy ostatnie wymiany z wybranego wątku."],
  ["4", "Wynik", "Analiza wraca do przeglądarki. Metis nie zapisuje treści sprawy we własnej centralnej bazie."],
];

export default function SecurityPage() {
  return (
    <LegalPageLayout
      eyebrow="Bezpieczeństwo"
      title="Pokazujemy drogę Twoich danych, krok po kroku."
      intro="Metis pracuje na bardzo wrażliwej komunikacji. Dlatego opisujemy nie tylko zabezpieczenia, ale też ograniczenia publicznego demo."
      updated="6 sierpnia 2026"
    >
      <LegalSection title="Co dzieje się podczas analizy">
        <ol className="grid gap-3 sm:grid-cols-2">
          {FLOW.map(([number, title, description]) => (
            <li key={number} className="rounded-[14px] border border-border bg-cream p-5">
              <span className="text-xs font-bold tracking-[0.14em] text-accent">{number.padStart(2, "0")}</span>
              <h3 className="mt-3 font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-body">{description}</p>
            </li>
          ))}
        </ol>
        <p>
          Zgodnie z publiczną informacją Groq dane wejściowe i wyjściowe zwykłych
          zapytań nie są domyślnie przechowywane. Dostawca może je tymczasowo zapisać
          na potrzeby niezawodności lub przeciwdziałania nadużyciom, maksymalnie przez
          30 dni. Szczegóły i dostępne ustawienia znajdziesz w{" "}
          <a href="https://console.groq.com/docs/your-data" target="_blank" rel="noreferrer">
            dokumentacji danych Groq
          </a>.
        </p>
      </LegalSection>

      <LegalSection title="Co Metis przechowuje">
        <ul>
          <li><strong>Publiczne demo:</strong> profil sprawy, historia wątków i zapisane odpowiedzi w pamięci tej przeglądarki.</li>
          <li><strong>Szybka próba:</strong> tymczasowy wynik w bieżącej sesji oraz lokalna informacja, że jedna analiza została wykorzystana.</li>
          <li><strong>Analityka:</strong> wyłącznie nazwane zdarzenia produktowe i ich metadane, bez treści wiadomości, kontekstu sprawy i odpowiedzi AI.</li>
          <li><strong>Hosting:</strong> Vercel może przetwarzać dane techniczne połączenia, takie jak adres IP, czas żądania i diagnostyka serwera.</li>
        </ul>
        <p>
          Metis nie ma obecnie kont użytkowników ani centralnej bazy spraw. Dane lokalne
          nie synchronizują się między urządzeniami i znikną po wyczyszczeniu danych
          przeglądarki. To świadomy kompromis publicznego demo, nie kopia zapasowa.
        </p>
      </LegalSection>

      <LegalSection title="Ograniczona analityka">
        <p>
          Używamy PostHog w regionie UE. Automatyczne śledzenie kliknięć, nagrywanie
          sesji, pomiary wydajności, ankiety i automatyczne odsłony są wyłączone.
          Biblioteka analityczna korzysta tylko z pamięci bieżącej karty. Jeśli adres
          wejścia zawiera parametr <code>?u=</code>, jego wartość może zostać zapisana
          lokalnie jako identyfikator źródła wejścia.
        </p>
        <p>
          Lista zdarzeń jest kontrolowana w kodzie. Treść wiadomości, kontekst sprawy,
          proponowane odpowiedzi i odpowiedzi wysłane nie są właściwościami zdarzeń.
        </p>
      </LegalSection>

      <LegalSection title="Co możesz zrobić po swojej stronie">
        <ul>
          <li>Zastąp imiona inicjałami albo neutralnymi nazwami.</li>
          <li>Nie wklejaj numerów PESEL, adresów, danych medycznych ani treści dokumentów, jeśli nie są potrzebne do analizy wiadomości.</li>
          <li>Korzystaj z własnego, zabezpieczonego urządzenia i aktualnej przeglądarki.</li>
          <li>Usuń profil sprawy i historię z poziomu aplikacji, gdy nie są już potrzebne.</li>
          <li>W sprawach o wysokim ryzyku potraktuj wynik jako materiał do rozmowy z prawnikiem, nie jako profesjonalną opinię.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Znane ograniczenia demo">
        <p>
          Demo nie ma kont użytkowników ani systemu uwierzytelniania. Nie oferujemy
          synchronizacji, gwarantowanej dostępności ani odzyskiwania historii. Nie
          deklarujemy certyfikacji, których Metis samodzielnie nie przeszedł.
        </p>
        <p>
          Znalazłeś problem związany z prywatnością lub bezpieczeństwem? Napisz na{" "}
          <a href="mailto:kacper.staroszczyk@gmail.com">kacper.staroszczyk@gmail.com</a>
          {" "}bez dołączania danych swojej sprawy.
        </p>
      </LegalSection>

      <p className="rounded-[14px] border border-border bg-paper p-5 text-sm leading-relaxed text-ink-body">
        Więcej o kategoriach danych, celach przetwarzania i prawach użytkownika opisuje{" "}
        <Link href="/prywatnosc">polityka prywatności</Link>.
      </p>
    </LegalPageLayout>
  );
}
