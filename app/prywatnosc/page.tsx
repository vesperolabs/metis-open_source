import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/app/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Prywatność | Metis",
  description: "Polityka prywatności publicznego demo Metis.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Prywatność"
      title="Polityka prywatności Metis"
      intro="Ta polityka opisuje publiczne demo portfolio Metis: jakie dane przetwarzamy, po co, gdzie mogą trafić i jakie masz możliwości kontroli."
      updated="22 sierpnia 2026"
      notice={
        <p>
          Metis jest bezpłatnym, publicznym demem portfolio. Nie wymaga konta ani
          kodu dostępu i nie jest aktywną usługą komercyjną. Jeśli zakres
          przetwarzania danych się zmieni, ta polityka zostanie zaktualizowana.
        </p>
      }
    >
      <LegalSection title="1. Kto odpowiada za Metis">
        <p>
          Operatorem Metis i administratorem danych przetwarzanych na potrzeby działania
          usługi jest <strong>Kacper Staroszczyk</strong>. Kontakt w sprawach prywatności:{" "}
          <a href="mailto:kacper.staroszczyk@gmail.com">kacper.staroszczyk@gmail.com</a>.
        </p>
        <p>
          Metis jest bezpłatnym demem bez sklepu i kont użytkowników. Nie przekazuj
          danych swojej sprawy w wiadomości kontaktowej, jeśli nie jest to konieczne
          do rozwiązania problemu.
        </p>
      </LegalSection>

      <LegalSection title="2. Jakie dane mogą być przetwarzane">
        <ul>
          <li><strong>Dane wpisane do analizy:</strong> treść wiadomości, opis sytuacji, próbki stylu i ostatnie wymiany z wybranego wątku.</li>
          <li><strong>Nagrania do transkrypcji:</strong> plik audio lub nagranie z mikrofonu, wyłącznie gdy samodzielnie wybierzesz funkcję transkrypcji głosowej.</li>
          <li><strong>Dane zapisane lokalnie:</strong> profil sprawy, historia wątków, wyniki i odpowiedzi oznaczone jako wysłane.</li>
          <li><strong>Dane techniczne:</strong> adres IP, rodzaj urządzenia i przeglądarki, czas żądania, błędy oraz informacje potrzebne do bezpieczeństwa hostingu.</li>
          <li><strong>Dane analityczne:</strong> nazwane zdarzenia produktowe, np. rozpoczęcie demo lub ukończenie analizy, bez treści sprawy.</li>
          <li><strong>Dane kontaktowe:</strong> adres e-mail i treść wiadomości, gdy samodzielnie zgłaszasz problem.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Po co i na jakiej podstawie">
        <p>W zależności od sytuacji przetwarzamy dane, aby:</p>
        <ul>
          <li>wykonać analizę, o którą prosisz, i udostępnić funkcje publicznego demo — w celu realizacji Twojego żądania;</li>
          <li>zapewnić bezpieczeństwo, przeciwdziałać nadużyciom i diagnozować awarie — w uzasadnionym interesie operatora i użytkowników;</li>
          <li>zrozumieć użycie kluczowych funkcji na podstawie ograniczonej analityki — w uzasadnionym interesie rozwijania produktu, z poszanowaniem Twojego prawa do sprzeciwu;</li>
          <li>odpowiedzieć na kontakt i rozpatrzyć zgłoszenie — w celu podjęcia działań na Twoje żądanie albo wykonania obowiązku prawnego.</li>
        </ul>
        <p>
          Tam, gdzie zastosowanie ma RODO, odpowiada to w szczególności art. 6 ust. 1
          lit. b, f lub c — zależnie od konkretnego celu. Nie wykorzystujemy treści
          sprawy do reklamy ani nie sprzedajemy jej innym podmiotom.
        </p>
      </LegalSection>

      <LegalSection title="4. Gdzie trafiają dane">
        <ul>
          <li><strong>Groq:</strong> dostawca infrastruktury modelu AI analizującego treść; dane zwykłych zapytań nie są według dostawcy domyślnie przechowywane, z wyjątkami dotyczącymi niezawodności i przeciwdziałania nadużyciom.</li>
          <li><strong>ElevenLabs:</strong> dostawca transkrypcji mowy na tekst. Nagranie trafia tam tylko po kliknięciu funkcji głosowej; Metis nie zachowuje surowego audio. Standardowe zasady retencji ElevenLabs mają zastosowanie do przesłanego nagrania.</li>
          <li><strong>Vercel:</strong> hosting strony, serwera API i techniczna obsługa żądań.</li>
          <li><strong>Vercel Web Analytics:</strong> anonimowe pomiary odsłon stron potrzebne do zrozumienia użycia publicznego demo, bez treści sprawy.</li>
          <li><strong>PostHog EU:</strong> ograniczona analityka nazwanych zdarzeń bez treści wiadomości i bez nagrywania sesji.</li>
          <li><strong>Dostawca poczty:</strong> tylko jeśli samodzielnie wyślesz wiadomość dotyczącą prywatności, bezpieczeństwa lub błędu.</li>
        </ul>
        <p>
          Niektórzy dostawcy działają poza Polską lub Europejskim Obszarem Gospodarczym.
          W takich przypadkach transfer opiera się na mechanizmach stosowanych przez
          dostawcę, np. standardowych klauzulach umownych. Zobacz też{" "}
          <a href="https://console.groq.com/docs/your-data" target="_blank" rel="noreferrer">informacje Groq</a>,{" "}
          <a href="https://elevenlabs.io/privacy" target="_blank" rel="noreferrer">informacje ElevenLabs</a>,{" "}
          <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">informacje Vercel</a> i{" "}
          <a href="https://posthog.com/privacy" target="_blank" rel="noreferrer">informacje PostHog</a>.
        </p>
      </LegalSection>

      <LegalSection title="5. Jak długo">
        <ul>
          <li>Dane profilu i historii pozostają w Twojej przeglądarce, dopóki ich nie usuniesz albo nie wyczyścisz danych witryny.</li>
          <li>Wynik demo jest tymczasowy; lokalna informacja o wykorzystaniu próby może pozostać do wyczyszczenia danych witryny.</li>
          <li>Treść przekazana do API Groq podlega zasadom przechowywania dostawcy opisanym powyżej.</li>
          <li>Nagranie przekazane do ElevenLabs podlega zasadom przechowywania tego dostawcy. Metis nie tworzy własnej kopii audio.</li>
          <li>Metadane techniczne i analityczne są przechowywane zgodnie z ustawieniami oraz uzasadnionymi okresami retencji dostawców.</li>
          <li>Korespondencję przechowujemy do zakończenia sprawy, a dłużej tylko wtedy, gdy wymaga tego prawo lub obrona przed roszczeniami.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Dane dotyczące dzieci i innych osób">
        <p>
          Metis jest przeznaczony dla dorosłych, ale wiadomości mogą dotyczyć dzieci
          i drugiego rodzica. Wprowadzaj tylko dane potrzebne do analizy komunikacji.
          Używaj inicjałów lub zmienionych imion i pomijaj numery dokumentów, dokładne
          adresy, dane zdrowotne oraz inne szczegóły, jeśli nie są niezbędne.
        </p>
        <p>
          Korzystając z Metis, odpowiadasz za to, by mieć podstawę do użycia treści,
          którą wprowadzasz, i nie naruszać praw innych osób.
        </p>
      </LegalSection>

      <LegalSection title="7. Twoje prawa i wybory">
        <p>
          W zakresie przewidzianym przez właściwe prawo możesz poprosić o dostęp,
          sprostowanie, usunięcie lub ograniczenie przetwarzania, a także wnieść
          sprzeciw. Możesz też złożyć skargę do właściwego organu ochrony danych.
        </p>
        <p>
          Dane lokalne możesz usunąć samodzielnie w aplikacji albo przez ustawienia
          przeglądarki. W sprawach dotyczących danych po stronie operatora napisz na{" "}
          <a href="mailto:kacper.staroszczyk@gmail.com">kacper.staroszczyk@gmail.com</a>.
          Możemy poprosić o informacje potrzebne do potwierdzenia, że żądanie dotyczy
          właściwej osoby.
        </p>
      </LegalSection>

      <LegalSection title="8. Zmiany polityki">
        <p>
          Polityka może zmieniać się wraz z rozwojem publicznego demo, w szczególności
          przed uruchomieniem kont, synchronizacji albo innego sposobu dostępu. Nowa
          wersja będzie opublikowana na tej stronie z datą aktualizacji. Zasady korzystania
          znajdziesz w <Link href="/regulamin">regulaminie</Link>, a praktyczny opis
          przepływu danych na stronie <Link href="/bezpieczenstwo">Bezpieczeństwo</Link>.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
