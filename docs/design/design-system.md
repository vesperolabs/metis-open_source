# Design System — Metis

## Product Context
- **What this is:** Polski asystent komunikacji dla rodziców w spornych sprawach o opiekę — analizuje wiadomości od drugiej strony i pomaga napisać bezpieczną odpowiedź.
- **Who it's for:** Tomasz-archetype: niesamodzielny technicznie, aktywna sprawa sądowa, bezpośredni kontakt z byłą/byłym, próbował ChatGPT i poniósł porażkę.
- **Space/industry:** Legal-tech / AI writing assistant, Polska
- **Project type:** Web app z landing page / bramką dostępu

## Aesthetic Direction
- **Direction:** Organiczna / Literacka
- **Decoration level:** Intentional — brak stockfotos, gradientów, blob-ów. Subtelne ciepłe tło jak papier.
- **Mood:** Zaufany doradca który siada obok i mówi "spokojnie, sprawdzam to." Nie kancelaria prawna (zimna), nie startup (agresywny). Ktoś kto rozumie.
- **Reference sites:** Harvey.ai (dobra powaga, zły odbiorca), DoNotPay (dobry target, zły ton)
- **Deliberate departures:** Zieleń leśna zamiast corporate blue/black. Fraunces italic zamiast system grotesku.

## Typography
- **Display/Hero:** Fraunces (waga 700, italic) — literacka, ludzka. Mówi "napisał to ktoś kto rozumie", nie "zbudował to startup". Optical size: `opsz` 72+ dla dużych headlineów.
- **Body:** Plus Jakarta Sans — czytelna, humanistyczna, nie generyczna jak Inter/Roboto.
- **UI/Labels:** Plus Jakarta Sans (waga 400–600)
- **Data/Tables:** Plus Jakarta Sans z `font-variant-numeric: tabular-nums`
- **Code:** JetBrains Mono (tylko jeśli potrzebny)
- **Loading:** Google Fonts CDN
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  ```
- **Scale:**
  | Level | Size | Weight | Font | Usage |
  |-------|------|--------|------|-------|
  | hero | 2.5rem / 40px | 700 | Fraunces italic | Główny headline |
  | h1 | 2rem / 32px | 700 | Fraunces italic | Tytuły sekcji |
  | h2 | 1.5rem / 24px | 600 | Plus Jakarta Sans | Podtytuły |
  | h3 | 1.125rem / 18px | 600 | Plus Jakarta Sans | Nagłówki kart |
  | body | 1rem / 16px | 400 | Plus Jakarta Sans | Treść |
  | small | 0.875rem / 14px | 400 | Plus Jakarta Sans | Pomocniczy tekst |
  | xs | 0.75rem / 12px | 500 | Plus Jakarta Sans | Etykiety, disclaimery |

## Color
- **Approach:** Restrained — jeden akcent + ciepłe neutralne. Kolor jest rzadki i znaczący.

| Rola | Hex | Użycie |
|------|-----|--------|
| Background | `#FAFAF8` | Główne tło strony — ciepła biel jak papier |
| Surface | `#F0EDE6` | Karty, formularze, panele |
| Border | `#E0DBD2` | Obramowania inputów, separatory |
| Text primary | `#1C1A17` | Nagłówki, ważny tekst |
| Text body | `#3D3830` | Główna treść |
| Text muted | `#6B6155` | Pomocniczy tekst, placeholdery, disclaimery |
| Accent | `#2C5F2E` | Przyciski CTA, linki, focus ring — zieleń leśna |
| Accent hover | `#245026` | Hover state przycisku |
| Accent light | `#EBF3EB` | Tła badge'y, subtelne highlights |
| Error | `#C1440E` | Błędy walidacji |
| Error light | `#FEF2EE` | Tło błędu |
| Success | `#2C5F2E` | (użyj accent) |

- **Dark mode:** Brak na beta. Po walidacji: odwróć surface/background, zachowaj akcent, zmniejsz насыщенность neutralnych o ~15%.

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — nie za ciaśnie jak enterprise, nie za luźnie jak luxury brand
- **Scale:**
  | Token | Value |
  |-------|-------|
  | 2xs | 4px |
  | xs | 8px |
  | sm | 12px |
  | md | 16px |
  | lg | 24px |
  | xl | 32px |
  | 2xl | 48px |
  | 3xl | 64px |
  | 4xl | 96px |

## Layout
- **Approach:** Hybrid — restrained editorial dla landing page, grid-disciplined dla wnętrza aplikacji
- **Grid:** 12 kolumn, 24px gutter
- **Max content width:** 672px (lg) dla formularzy i treści; 1024px (xl) dla dashboardu
- **Wąskie formularze wejściowe:** max-w-lg (512px) wycentrowany — sprawdza się na mobile i desktop
- **Border radius:**
  | Token | Value | Użycie |
  |-------|-------|--------|
  | sm | 6px | Inputy, badge'e |
  | md | 10px | Karty, panele |
  | lg | 14px | Modaly, duże kontenery |
  | full | 9999px | Przyciski pill (opcjonalnie) |

## Motion
- **Approach:** Minimal-functional — tylko przejścia które pomagają rozumieć. Tomasz jest zestresowany, nic nie powinno skakać.
- **Easing:** `enter: ease-out` | `exit: ease-in` | `move: ease-in-out`
- **Duration:**
  | Level | Range | Użycie |
  |-------|-------|--------|
  | micro | 50–100ms | Hover states, focus rings |
  | short | 150–200ms | Przyciski, toggle |
  | medium | 250ms | Fade in treści, slide panel |

## Component Notes

### Przycisk CTA (primary)
```
bg: #2C5F2E | text: white | hover: #245026
padding: 10px 20px | border-radius: 8px | font: Plus Jakarta Sans 500 15px
transition: background 150ms ease-out
```

### Input
```
bg: white | border: 1px solid #E0DBD2 | focus-ring: 2px solid #2C5F2E
border-radius: 6px | padding: 10px 12px | font: Plus Jakarta Sans 400 16px
placeholder-color: #6B6155
```

### Karta / Surface
```
bg: #F0EDE6 | border-radius: 10px | padding: 24px
no box-shadow (flat design — cień to dekoracja, nie tu)
```

## Decisions Log
| Data | Decyzja | Uzasadnienie |
|------|---------|--------------|
| 2026-06-14 | Zieleń leśna (#2C5F2E) jako akcent | Żaden legal-tech nie używa zielonego. Buduje własną twarz w kategorii. Czyta się jako "spokój" i "bezpieczeństwo", nie "walka". |
| 2026-06-14 | Fraunces italic dla headline | Literacka, ludzka. Mówi "ktoś to napisał" nie "wygenerował algorytm." Ryzyko: za miękkie — akceptowalne dla tego targetu. |
| 2026-06-14 | Warm off-white #FAFAF8 zamiast czystej bieli | Efekt papieru — produkt czyta się jak notatnik, nie jak SaaS dashboard. |
| 2026-06-14 | Plus Jakarta Sans zamiast Inter | Inter = overused. Plus Jakarta Sans = humanistyczna, nie generyczna. |
| 2026-06-14 | Max-w-lg (512px) dla wąskich formularzy | Skalowanie bloku tekstu i formy działa na mobile i desktop. |
