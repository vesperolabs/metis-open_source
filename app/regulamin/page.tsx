import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/app/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Regulamin | Metis",
  description: "Zasady korzystania z publicznego demo Metis.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Regulamin"
      title="Zasady korzystania z Metis"
      intro="Ten regulamin opisuje bezpłatne, publiczne demo portfolio Metis. Metis wspiera organizację informacji i redagowanie komunikacji — nie zastępuje prawnika."
      updated="6 sierpnia 2026"
      notice={
        <p>
          <strong>Metis jest publicznym demem portfolio, a nie aktywną usługą
          komercyjną.</strong> Wszystkie funkcje demonstracyjne są dostępne bez konta,
          kodu i opłat.
        </p>
      }
    >
      <LegalSection title="1. Operator i kontakt">
        <p>
          Operatorem Metis jest <strong>Kacper Staroszczyk</strong>. Kontakt:{" "}
          <a href="mailto:kacper.staroszczyk@gmail.com">kacper.staroszczyk@gmail.com</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Co oferuje Metis">
        <ul>
          <li><strong>Publiczny przykład:</strong> gotowy, syntetyczny wynik pokazujący sposób działania produktu.</li>
          <li><strong>Szybka próba:</strong> jedna analiza własnej wiadomości bez zapisywania kontekstu jako profilu sprawy.</li>
          <li><strong>Publiczne demo:</strong> analiza wiadomości, lokalny profil sprawy, wątki, historia i ocena własnej odpowiedzi.</li>
        </ul>
        <p>
          Demo nie tworzy konta i nie synchronizuje danych między urządzeniami. Nie
          jest ofertą odpłatnej usługi ani obietnicą dalszego rozwijania produktu.
        </p>
      </LegalSection>

      <LegalSection title="3. Warunki techniczne">
        <p>
          Potrzebujesz aktualnej przeglądarki z włączonym JavaScriptem i pamięcią
          lokalną, dostępu do internetu oraz urządzenia, nad którym masz kontrolę.
          Wyczyszczenie danych witryny, zmiana przeglądarki lub urządzenia może usunąć
          profil i historię bez możliwości odzyskania.
        </p>
      </LegalSection>

      <LegalSection title="4. Odpowiedzialne korzystanie">
        <p>Użytkownik Metis musi być osobą pełnoletnią. Nie wolno:</p>
        <ul>
          <li>wprowadzać treści, do których nie masz prawa dostępu lub użycia;</li>
          <li>używać Metis do nękania, gróźb, manipulacji, omijania prawa albo wyrządzenia szkody;</li>
          <li>próbować omijać ograniczenia bezpieczeństwa lub zakłócać działania aplikacji;</li>
          <li>wprowadzać danych w szerszym zakresie, niż jest potrzebny do analizy komunikacji.</li>
        </ul>
        <p>
          W szczególności ogranicz dane dzieci i innych osób: zmieniaj imiona, pomijaj
          numery dokumentów, adresy i dane medyczne, jeśli analiza ich nie wymaga.
        </p>
      </LegalSection>

      <LegalSection title="5. AI i granice usługi">
        <p>
          Metis może się mylić, pominąć kontekst albo przygotować odpowiedź, która nie
          pasuje do Twojej sytuacji. Wynik jest materiałem pomocniczym. To Ty decydujesz,
          czy i w jakiej formie wysłać wiadomość.
        </p>
        <p>
          Metis nie świadczy pomocy prawnej, nie reprezentuje użytkownika i nie daje
          gwarancji wyniku postępowania. Terminy, ugody, pisma procesowe, poważne zarzuty
          oraz decyzje o skutkach prawnych skonsultuj z prawnikiem.
        </p>
      </LegalSection>

      <LegalSection title="6. Dostępność demo">
        <p>
          Demo może być czasowo niedostępne z powodu prac, awarii, limitów dostawcy AI
          lub zmian projektu. Operator może ograniczyć dostęp w razie nadużycia,
          zagrożenia bezpieczeństwa albo naruszenia regulaminu.
        </p>
        <p>
          Demo nie ma gwarantowanego poziomu dostępności, pomocy technicznej ani kopii
          zapasowej danych lokalnych. Może zostać zmienione lub wyłączone bez wcześniejszego
          powiadomienia.
        </p>
      </LegalSection>

      <LegalSection title="7. Opłaty i dostęp">
        <p>
          Korzystanie z publicznego demo jest bezpłatne i nie wymaga kodu. Metis nie
          prowadzi sprzedaży, subskrypcji ani programu płatnego dostępu.
        </p>
      </LegalSection>

      <LegalSection title="8. Problemy i zgłoszenia">
        <p>
          Zgłoszenie wyślij na{" "}
          <a href="mailto:kacper.staroszczyk@gmail.com">kacper.staroszczyk@gmail.com</a>,
          podając opis problemu i datę jego wystąpienia. Nie dołączaj treści sprawy,
          jeśli nie jest konieczna. Projekt nie zapewnia gwarantowanego czasu odpowiedzi
          ani indywidualnej pomocy technicznej.
        </p>
      </LegalSection>

      <LegalSection title="9. Prywatność, własność i zmiany">
        <p>
          Użytkownik zachowuje prawa do treści, które wprowadza. Udziela jedynie zgody
          na ich techniczne przetworzenie w zakresie potrzebnym do wykonania wybranej
          funkcji. Szczegóły opisuje <Link href="/prywatnosc">polityka prywatności</Link>.
        </p>
        <p>
          Regulamin może zostać zmieniony wraz z rozwojem publicznego demo albo wymogami
          prawa. Aktualna wersja i data zmiany są publikowane na tej stronie.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
