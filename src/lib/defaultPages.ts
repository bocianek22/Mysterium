// Domyślna treść stron informacyjnych/prawnych. Właściciel może je nadpisać
// w panelu (Strony) — wtedy z bazy. Tu fallback, by linki zawsze działały.
// UWAGA: treści prawne to szablon — przejrzyj i dostosuj do swojej działalności.

export type DefaultPage = {
  slug: string;
  titlePl: string;
  titleEn: string;
  order: number;
  contentPl: string;
  contentEn?: string;
};

export const DEFAULT_PAGES: DefaultPage[] = [
  {
    slug: "jak-grac",
    titlePl: "Jak grać — pierwsza wizyta",
    titleEn: "How to play — first visit",
    order: 0,
    contentPl: `Pierwszy raz w escape roomie? Spokojnie — to prostsze niż myślisz i nie trzeba żadnego doświadczenia.

## Na czym to polega
Zostajecie zamknięci w klimatycznym pomieszczeniu pełnym zagadek. Waszym zadaniem jest współpraca, szukanie wskazówek i rozwiązywanie łamigłówek, aby wydostać się przed upływem czasu (zwykle 60 minut).

## Jak się przygotować
- Przyjdźcie 10–15 minut wcześniej — przywita Was nasz Mistrz Gry i wprowadzi w fabułę.
- Ubierzcie się wygodnie. Nie potrzebujecie żadnego sprzętu.
- Zostawcie kurtki i torby w wyznaczonym miejscu.

## Zasady i bezpieczeństwo
- Nie trzeba używać siły — zagadki rozwiązuje się głową, nie rękami.
- W razie potrzeby Mistrz Gry podpowie Wam przez ekran lub krótkofalówkę.
- W pokoju jest wyjście awaryjne — w każdej chwili możecie wyjść.

## Dla kogo
- Dla znajomych, par, rodzin i grup firmowych.
- Świetne na urodziny, integracje i wieczory tematyczne.

Gotowi na wyzwanie? Zarezerwujcie termin i sprawdźcie się w Mysterium!`,
  },
  {
    slug: "dla-firm",
    titlePl: "Dla firm i grup",
    titleEn: "For companies & groups",
    order: 2,
    contentPl: `Szukasz pomysłu na integrację, event firmowy lub team-building? Escape room to świetny sposób na zbudowanie współpracy, komunikacji i dobrej energii w zespole.

## Co oferujemy firmom
- Gry dla grup różnej wielkości (także kilka zespołów równolegle)
- Wersję wyjazdową — przyjeżdżamy z grą do Was, do biura lub na event
- Elastyczne terminy, faktury VAT, indywidualne wyceny
- Możliwość połączenia z cateringiem i dodatkowymi atrakcjami

## Idealne na
- Integracje i team-building
- Eventy firmowe, jubileusze, kick-offy
- Wieczory kawalerskie i panieńskie
- Urodziny i spotkania ze znajomymi

Napisz do nas przez formularz kontaktowy lub zadzwoń — przygotujemy ofertę dopasowaną do Waszych potrzeb.`,
  },
  {
    slug: "regulamin",
    titlePl: "Regulamin",
    titleEn: "Terms & rules",
    order: 3,
    contentPl: `Niniejszy regulamin określa zasady korzystania z usług oraz rezerwacji w Mysterium. Dokonanie rezerwacji oznacza akceptację regulaminu.

## 1. Rezerwacje
- Rezerwacji można dokonać online, telefonicznie lub mailowo.
- Prosimy o przybycie 10–15 minut przed zaplanowaną grą.
- Spóźnienie może skrócić czas gry lub uniemożliwić jej rozpoczęcie.

## 2. Zasady gry
- W grze jednocześnie bierze udział zarezerwowana grupa.
- Zabrania się wnoszenia ostrych przedmiotów, jedzenia i napojów do pokoi.
- Obowiązuje zakaz gry pod wpływem alkoholu lub innych używek.
- Prosimy o poszanowanie scenografii i wyposażenia.

## 3. Bezpieczeństwo
- W pokoju znajduje się monitoring oraz przycisk/wyjście awaryjne.
- Obsługa może przerwać grę w razie zagrożenia bezpieczeństwa.
- Za szkody wyrządzone umyślnie odpowiada uczestnik / opiekun grupy.

## 4. Bony podarunkowe
- Bon jest ważny przez okres wskazany na bonie.
- Bon należy wykorzystać dokonując wcześniej rezerwacji terminu.
- Bon nie podlega wymianie na gotówkę.

## 5. Odwołania i zmiany
- Termin można zmienić lub odwołać z odpowiednim wyprzedzeniem (skontaktuj się z nami).

## 6. Reklamacje
- Reklamacje prosimy zgłaszać mailowo; rozpatrujemy je niezwłocznie.

Regulamin jest szablonem — dostosuj zapisy do swojej działalności i przepisów.`,
  },
  {
    slug: "dostepnosc",
    titlePl: "Deklaracja dostępności",
    titleEn: "Accessibility statement",
    order: 4,
    contentPl: `Zależy nam, aby strona Mysterium była dostępna dla jak najszerszego grona odbiorców.

## Nasze działania
- Czytelna typografia i kontrast kolorów.
- Nawigacja z klawiatury i opisy alternatywne dla elementów graficznych.
- Poszanowanie ustawienia „ogranicz ruch" (reduce motion) w animacjach.

## Dostępność lokalu
Jeśli masz szczególne potrzeby związane z dostępnością wizyty (np. dojazd, poruszanie się), skontaktuj się z nami przed rezerwacją — postaramy się pomóc i dobrać odpowiedni pokój.

## Zgłoszenia
Problemy z dostępnością strony lub lokalu prosimy zgłaszać przez formularz kontaktowy — reagujemy najszybciej, jak to możliwe.`,
  },
];

export const DEFAULT_PAGE_MAP = Object.fromEntries(DEFAULT_PAGES.map((p) => [p.slug, p]));
