import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout, LegalSection } from "@/app/components/LegalPageLayout";

export const metadata: Metadata = {
  title: "Regulamin | Metis",
  description: "Zasady korzystania z wersji beta Metis.",
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Regulamin"
      title="Zasady korzystania z Metis"
      intro="Ten regulamin opisuje bezpłatne demo i pełną wersję beta udostępnianą kodem. Metis wspiera organizację informacji i redagowanie komunikacji — nie zastępuje prawnika."
      updated="5 sierpnia 2026"
      notice={
        <p>
          <strong>Metis działa obecnie jako wersja beta.</strong> Jedną wiadomość możesz
          sprawdzić w publicznym demo. Dostęp do pełnej wersji jest przyznawany
          indywidualnie kodem po kontakcie z operatorem.
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
          <li><strong>Jednorazowe demo:</strong> jedna analiza własnej wiadomości bez konta; kontekst próby i historia nie są zapamiętywane jako profil sprawy.</li>
          <li><strong>Pełna wersja beta:</strong> analiza wiadomości, lokalny profil sprawy, wątki, historia i ocena własnej odpowiedzi, dostępne po wpisaniu kodu.</li>
        </ul>
        <p>
          Kod może być obecnie przyznawany indywidualnie do testów. Nie tworzy konta,
          nie gwarantuje synchronizacji między urządzeniami i nie jest dowodem zakupu.
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
          <li>próbować omijać limitów, bramki dostępu lub zabezpieczeń technicznych;</li>
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

      <LegalSection title="6. Dostęp do bety">
        <p>
          Dostęp może być czasowo niedostępny z powodu prac, awarii lub zmian produktu.
          Operator może zablokować kod w razie nadużycia, zagrożenia bezpieczeństwa albo
          naruszenia regulaminu. W miarę możliwości użytkownik otrzyma krótkie wyjaśnienie.
        </p>
        <p>
          Beta nie ma gwarantowanego poziomu dostępności, pomocy technicznej ani kopii
          zapasowej danych lokalnych. Zakończenie testów zostanie zakomunikowane z
          rozsądnym wyprzedzeniem, jeśli będzie to możliwe.
        </p>
      </LegalSection>

      <LegalSection title="7. Jak otrzymać kod">
        <p>
          Po wykorzystaniu demo możesz poprosić o kod do pełnej wersji beta przez
          e-mail lub WhatsApp. Nie wysyłaj w tej wiadomości treści swojej sprawy.
        </p>
        <ul>
          <li>Kody są obecnie przyznawane ręcznie osobom testującym produkt.</li>
          <li>Wysłanie prośby nie gwarantuje otrzymania kodu ani terminu odpowiedzi.</li>
          <li>Kod służy jednej osobie i nie powinien być publicznie udostępniany.</li>
          <li>Operator może zmienić lub wyłączyć kod w razie nadużycia albo zagrożenia bezpieczeństwa.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Problemy i zgłoszenia">
        <p>
          Zgłoszenie wyślij na{" "}
          <a href="mailto:kacper.staroszczyk@gmail.com">kacper.staroszczyk@gmail.com</a>,
          podając opis problemu i datę jego wystąpienia. Nie dołączaj treści sprawy,
          jeśli nie jest konieczna. Odpowiedź otrzymasz w ciągu 14 dni kalendarzowych.
        </p>
      </LegalSection>

      <LegalSection title="9. Prywatność, własność i zmiany">
        <p>
          Użytkownik zachowuje prawa do treści, które wprowadza. Udziela jedynie zgody
          na ich techniczne przetworzenie w zakresie potrzebnym do wykonania wybranej
          funkcji. Szczegóły opisuje <Link href="/prywatnosc">polityka prywatności</Link>.
        </p>
        <p>
          Regulamin może zostać zmieniony wraz z rozwojem bety albo wymogami prawa.
          Aktualna wersja i data zmiany są publikowane na tej stronie. O istotnych
          zmianach dotyczących aktualnych testerów operator poinformuje w rozsądny sposób.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
