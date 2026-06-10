// Konfiguracja zasobów CMS — wspólna dla panelu (klient) i API (serwer).
// Definiuje pola formularzy oraz kolumny list. Brak importów serwerowych!

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "image"
  | "video"
  | "gallery"
  | "zones";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  default?: string | number | boolean;
};

export type ResourceConfig = {
  label: string; // nazwa w menu (l. mnoga)
  singular: string; // dopełnienie "Dodaj ..."
  icon: string;
  fields: Field[];
  listColumns: string[]; // pola pokazywane w tabeli
  readOnly?: boolean; // tylko podgląd + usuwanie (np. wiadomości)
};

export const resources: Record<string, ResourceConfig> = {
  rooms: {
    label: "Pokoje",
    singular: "pokój",
    icon: "🚪",
    listColumns: ["namePl", "badgePl", "status"],
    fields: [
      { name: "namePl", label: "Nazwa (PL)", type: "text", required: true },
      { name: "nameEn", label: "Nazwa (EN)", type: "text", required: true },
      { name: "slug", label: "Slug (adres URL)", type: "text", required: true, placeholder: "pokoj-nr-1" },
      { name: "taglinePl", label: "Krótki opis (PL)", type: "text" },
      { name: "taglineEn", label: "Krótki opis (EN)", type: "text" },
      { name: "descriptionPl", label: "Pełny opis (PL)", type: "textarea" },
      { name: "descriptionEn", label: "Pełny opis (EN)", type: "textarea" },
      { name: "image", label: "Zdjęcie główne", type: "image" },
      { name: "imagesJson", label: "Galeria pokoju (zdjęcia)", type: "gallery", help: "Zdjęcia widoczne na podstronie tego pokoju." },
      { name: "reviewsEmbed", label: "Opinie z Lockme (kod widgetu / iframe)", type: "textarea", help: "Wklej kod widgetu opinii z panelu Lockme (iframe lub skrypt). Pojawi się na podstronie pokoju." },
      { name: "tour360", label: "Wirtualny spacer / 360° (iframe lub link)", type: "textarea", help: "Wklej kod osadzenia panoramy 360°/wideo (iframe) albo sam adres URL. Pojawi się na podstronie pokoju." },
      { name: "faqJson", label: "FAQ pokoju", type: "textarea", help: "Każde pytanie w osobnej linii w formacie: Pytanie | Odpowiedź" },
      { name: "featured", label: "Polecany (wyróżnij na stronie)", type: "boolean", default: false },
      { name: "pricingJson", label: "Cennik (wg liczby osób)", type: "zones", help: "Np. „2 osoby” — 199 zł, „3–4 osoby” — 249 zł. Widoczny na podstronie pokoju." },
      { name: "durationMin", label: "Czas gry (min)", type: "number", default: 60 },
      { name: "minPlayers", label: "Min. osób", type: "number", default: 2 },
      { name: "maxPlayers", label: "Maks. osób", type: "number", default: 8 },
      { name: "difficultyPl", label: "Trudność (PL)", type: "text", default: "Średni" },
      { name: "difficultyEn", label: "Trudność (EN)", type: "text", default: "Medium" },
      { name: "badgePl", label: "Etykieta (PL)", type: "text", default: "Stacjonarny" },
      { name: "badgeEn", label: "Etykieta (EN)", type: "text", default: "On-site" },
      {
        name: "status",
        label: "Status",
        type: "select",
        default: "ACTIVE",
        options: [
          { value: "ACTIVE", label: "Aktywny" },
          { value: "SOON", label: "Wkrótce" },
        ],
      },
      {
        name: "theme",
        label: "Motyw podstrony",
        type: "select",
        default: "default",
        help: "Klimat i animacje podstrony pokoju (spójne ze stylem strony).",
        options: [
          { value: "default", label: "Domyślny (granat + złoto)" },
          { value: "loch", label: "Loch / Piwnica (cegła + kinkiet)" },
          { value: "pirate", label: "Piracki (drewno + latarnia)" },
          { value: "horror", label: "Horror / Mroczny (mgła + miganie)" },
          { value: "occult", label: "Tajemniczy / Okultyzm (runy + sigil)" },
          { value: "noir", label: "Detektyw / Noir (żaluzje + dym)" },
          { value: "tomb", label: "Grobowiec / Egipt (kurz + pochodnia)" },
          { value: "steampunk", label: "Steampunk / Laboratorium (zębatki)" },
          { value: "bunker", label: "Zimowy bunkier (szron + alarm)" },
        ],
      },
      { name: "heroImage", label: "Tło nagłówka — zdjęcie / GIF (opcjonalnie)", type: "image", help: "Tło na górze podstrony. Puste = zdjęcie główne pokoju. Można wgrać GIF." },
      { name: "heroVideo", label: "Tło nagłówka — wideo (mp4/webm, w pętli)", type: "video", help: "Jeśli ustawione, w tle nagłówka odtwarza się wideo w pętli (bez dźwięku). Ma pierwszeństwo przed zdjęciem." },
      { name: "bookingUrl", label: "Link rezerwacji (opcjonalnie)", type: "text", placeholder: "https://lock.me/..." },
      { name: "order", label: "Kolejność", type: "number", default: 0 },
      { name: "published", label: "Widoczny na stronie", type: "boolean", default: true },
    ],
  },

  mobile: {
    label: "Oferty mobilne",
    singular: "ofertę",
    icon: "📦",
    listColumns: ["namePl", "badgePl", "status"],
    fields: [
      { name: "namePl", label: "Nazwa (PL)", type: "text", required: true },
      { name: "nameEn", label: "Nazwa (EN)", type: "text", required: true },
      { name: "slug", label: "Slug (adres URL)", type: "text", required: true, placeholder: "mobilna-skrzynia" },
      { name: "taglinePl", label: "Krótki opis (PL)", type: "text" },
      { name: "taglineEn", label: "Krótki opis (EN)", type: "text" },
      { name: "descriptionPl", label: "Pełny opis (PL)", type: "textarea" },
      { name: "descriptionEn", label: "Pełny opis (EN)", type: "textarea" },
      { name: "image", label: "Zdjęcie główne", type: "image" },
      { name: "imagesJson", label: "Galeria oferty", type: "gallery" },
      { name: "durationMin", label: "Czas gry (min)", type: "number", default: 60 },
      { name: "minPlayers", label: "Min. osób", type: "number", default: 2 },
      { name: "maxPlayers", label: "Maks. osób", type: "number", default: 8 },
      { name: "priceInfoPl", label: "Cena od (PL)", type: "text", placeholder: "np. od 299 zł" },
      { name: "priceInfoEn", label: "Cena od (EN)", type: "text", placeholder: "e.g. from 299 zł" },
      { name: "pricingJson", label: "Cennik (wg liczby osób)", type: "zones", help: "Np. „2–4 osoby” — 299 zł. Widoczny na podstronie oferty." },
      { name: "travelZonesJson", label: "Cennik dojazdu (strefy)", type: "zones", help: "Np. Nowy Dwór Maz. — 0 zł, Warszawa — 100 zł." },
      { name: "areaPl", label: "Obszar działania (PL)", type: "textarea", placeholder: "np. Warszawa i okolice do 50 km" },
      { name: "areaEn", label: "Obszar działania (EN)", type: "textarea" },
      { name: "requirementsPl", label: "Wymagania na miejscu (PL)", type: "textarea", placeholder: "np. ok. 9 m², gniazdko 230V, stół" },
      { name: "requirementsEn", label: "Wymagania na miejscu (EN)", type: "textarea" },
      { name: "occasionsPl", label: "Dla kogo / okazje (PL)", type: "textarea", help: "Każda pozycja w osobnej linii." },
      { name: "occasionsEn", label: "Dla kogo / okazje (EN)", type: "textarea" },
      { name: "badgePl", label: "Etykieta (PL)", type: "text", default: "Wyjazdowy" },
      { name: "badgeEn", label: "Etykieta (EN)", type: "text", default: "Mobile" },
      { name: "status", label: "Status", type: "select", default: "ACTIVE", options: [{ value: "ACTIVE", label: "Aktywny" }, { value: "SOON", label: "Wkrótce" }] },
      { name: "order", label: "Kolejność", type: "number", default: 0 },
      { name: "published", label: "Widoczna na stronie", type: "boolean", default: true },
    ],
  },

  pages: {
    label: "Strony (info / prawne)",
    singular: "stronę",
    icon: "📄",
    listColumns: ["titlePl", "slug", "published"],
    fields: [
      { name: "titlePl", label: "Tytuł (PL)", type: "text", required: true },
      { name: "titleEn", label: "Tytuł (EN)", type: "text" },
      { name: "slug", label: "Slug (adres URL: /info/...)", type: "text", required: true, placeholder: "regulamin" },
      { name: "contentPl", label: "Treść (PL)", type: "textarea", help: "Akapity oddzielaj pustą linią. Nagłówek: linia od „## ”. Lista: linie od „- ”." },
      { name: "contentEn", label: "Treść (EN)", type: "textarea" },
      { name: "order", label: "Kolejność w stopce", type: "number", default: 0 },
      { name: "showInFooter", label: "Pokaż w stopce", type: "boolean", default: true },
      { name: "published", label: "Opublikowana", type: "boolean", default: true },
    ],
  },

  posts: {
    label: "Blog / Aktualności",
    singular: "wpis",
    icon: "📝",
    listColumns: ["titlePl", "published"],
    fields: [
      { name: "titlePl", label: "Tytuł (PL)", type: "text", required: true },
      { name: "titleEn", label: "Tytuł (EN)", type: "text", required: true },
      { name: "slug", label: "Slug (adres URL)", type: "text", required: true, placeholder: "np. otwarcie-nowego-pokoju" },
      { name: "excerptPl", label: "Zajawka (PL)", type: "textarea", help: "Krótki opis na liście wpisów i w SEO." },
      { name: "excerptEn", label: "Zajawka (EN)", type: "textarea" },
      { name: "contentPl", label: "Treść (PL)", type: "textarea", help: "Akapity oddzielaj pustą linią." },
      { name: "contentEn", label: "Treść (EN)", type: "textarea" },
      { name: "coverImage", label: "Zdjęcie główne", type: "image" },
      { name: "order", label: "Przypięcie (większe = wyżej, 0 = wg daty)", type: "number", default: 0 },
      { name: "published", label: "Opublikowany", type: "boolean", default: true },
    ],
  },

  albums: {
    label: "Galeria realizacji",
    singular: "album",
    icon: "📸",
    listColumns: ["titlePl", "dateLabel", "published"],
    fields: [
      { name: "titlePl", label: "Tytuł (PL)", type: "text", required: true },
      { name: "titleEn", label: "Tytuł (EN)", type: "text", required: true },
      { name: "slug", label: "Slug (adres URL)", type: "text", required: true, placeholder: "np. urodziny-marzec-2026" },
      { name: "dateLabel", label: "Data (etykieta)", type: "text", placeholder: "np. Marzec 2026" },
      { name: "roomName", label: "Czego dotyczy (gra / event)", type: "text" },
      { name: "descPl", label: "Opis (PL)", type: "textarea" },
      { name: "descEn", label: "Opis (EN)", type: "textarea" },
      { name: "coverImage", label: "Zdjęcie okładki", type: "image" },
      { name: "imagesJson", label: "Zdjęcia z realizacji", type: "gallery" },
      { name: "order", label: "Kolejność (większe = wyżej)", type: "number", default: 0 },
      { name: "published", label: "Widoczny na stronie", type: "boolean", default: true },
    ],
  },

  leaderboard: {
    label: "Hall of Fame (ranking)",
    singular: "wynik",
    icon: "🏆",
    listColumns: ["teamName", "roomName", "published"],
    fields: [
      { name: "teamName", label: "Nazwa drużyny", type: "text", required: true },
      { name: "roomName", label: "Gra / pokój", type: "text", required: true, placeholder: "np. Pułapka" },
      { name: "timeMin", label: "Czas — minuty", type: "number", default: 0 },
      { name: "timeSec", label: "Czas — sekundy", type: "number", default: 0 },
      { name: "players", label: "Liczba graczy", type: "number", default: 0 },
      { name: "dateLabel", label: "Data (etykieta)", type: "text", placeholder: "np. 12.03.2026" },
      { name: "order", label: "Kolejność (0 = wg czasu)", type: "number", default: 0 },
      { name: "published", label: "Widoczny w rankingu", type: "boolean", default: true },
    ],
  },

  gallery: {
    label: "Galeria zdjęć",
    singular: "zdjęcie",
    icon: "🖼️",
    listColumns: ["url", "captionPl"],
    fields: [
      { name: "url", label: "Zdjęcie", type: "image", required: true },
      { name: "captionPl", label: "Podpis (PL)", type: "text" },
      { name: "captionEn", label: "Podpis (EN)", type: "text" },
      { name: "order", label: "Kolejność", type: "number", default: 0 },
      { name: "published", label: "Widoczne na stronie", type: "boolean", default: true },
    ],
  },

  videos: {
    label: "Galeria filmów",
    singular: "film",
    icon: "🎬",
    listColumns: ["titlePl", "type"],
    fields: [
      { name: "titlePl", label: "Tytuł (PL)", type: "text", required: true },
      { name: "titleEn", label: "Tytuł (EN)", type: "text", required: true },
      {
        name: "type",
        label: "Rodzaj",
        type: "select",
        default: "YOUTUBE",
        options: [
          { value: "YOUTUBE", label: "YouTube" },
          { value: "FILE", label: "Plik wideo (mp4)" },
        ],
      },
      { name: "youtubeId", label: "ID filmu YouTube", type: "text", placeholder: "np. dQw4w9WgXcQ", help: "Z linku youtube.com/watch?v=XXXX — wklej tylko część XXXX." },
      { name: "fileUrl", label: "Plik wideo (mp4)", type: "video", help: "Użyj gdy rodzaj = Plik wideo." },
      { name: "thumbnail", label: "Miniatura (opcjonalnie)", type: "image" },
      { name: "order", label: "Kolejność", type: "number", default: 0 },
      { name: "published", label: "Widoczny na stronie", type: "boolean", default: true },
    ],
  },

  reviews: {
    label: "Opinie",
    singular: "opinię",
    icon: "⭐",
    listColumns: ["authorName", "rating", "eventPl"],
    fields: [
      { name: "authorName", label: "Autor", type: "text", required: true },
      { name: "rating", label: "Ocena (1–5)", type: "number", default: 5 },
      { name: "source", label: "Źródło", type: "select", default: "MANUAL", options: [{ value: "MANUAL", label: "Własna" }, { value: "GOOGLE", label: "Google" }] },
      { name: "textPl", label: "Treść (PL)", type: "textarea", required: true },
      { name: "textEn", label: "Treść (EN)", type: "textarea", required: true },
      { name: "eventPl", label: "Okazja (PL)", type: "text", placeholder: "np. Urodziny" },
      { name: "eventEn", label: "Okazja (EN)", type: "text", placeholder: "e.g. Birthday" },
      { name: "order", label: "Kolejność", type: "number", default: 0 },
      { name: "published", label: "Widoczna na stronie", type: "boolean", default: true },
    ],
  },

  faq: {
    label: "FAQ",
    singular: "pytanie",
    icon: "❓",
    listColumns: ["questionPl"],
    fields: [
      { name: "questionPl", label: "Pytanie (PL)", type: "text", required: true },
      { name: "questionEn", label: "Pytanie (EN)", type: "text", required: true },
      { name: "answerPl", label: "Odpowiedź (PL)", type: "textarea", required: true },
      { name: "answerEn", label: "Odpowiedź (EN)", type: "textarea", required: true },
      { name: "order", label: "Kolejność", type: "number", default: 0 },
      { name: "published", label: "Widoczne na stronie", type: "boolean", default: true },
    ],
  },

  vouchers: {
    label: "Bony podarunkowe",
    singular: "bon",
    icon: "🎁",
    listColumns: ["code", "titlePl", "status"],
    fields: [
      { name: "code", label: "Kod bonu", type: "text", required: true, placeholder: "MYS-XXXX" },
      { name: "titlePl", label: "Na co (PL)", type: "text", required: true, placeholder: "Bon na grę dla 4 osób" },
      { name: "titleEn", label: "Na co (EN)", type: "text" },
      { name: "amount", label: "Wartość (zł, 0 = bon na grę)", type: "number", default: 0 },
      { name: "status", label: "Status", type: "select", default: "NEW", options: [{ value: "NEW", label: "Nowy" }, { value: "SOLD", label: "Sprzedany" }, { value: "REDEEMED", label: "Zrealizowany" }] },
      { name: "buyerName", label: "Kupujący", type: "text" },
      { name: "validUntil", label: "Ważny do (RRRR-MM-DD)", type: "text", placeholder: "2026-12-31" },
      { name: "note", label: "Notatka", type: "textarea" },
    ],
  },

  codes: {
    label: "Kody rabatowe",
    singular: "kod",
    icon: "🏷️",
    listColumns: ["code", "kind", "value", "active"],
    fields: [
      { name: "code", label: "Kod", type: "text", required: true, placeholder: "WELCOME10" },
      { name: "kind", label: "Rodzaj", type: "select", default: "PERCENT", options: [{ value: "PERCENT", label: "Procent (%)" }, { value: "AMOUNT", label: "Kwota (zł)" }] },
      { name: "value", label: "Wartość", type: "number", default: 10 },
      { name: "descriptionPl", label: "Opis (PL)", type: "text", placeholder: "np. -10% na pierwszą grę" },
      { name: "descriptionEn", label: "Opis (EN)", type: "text" },
      { name: "usageLimit", label: "Limit użyć (0 = bez limitu)", type: "number", default: 0 },
      { name: "active", label: "Aktywny", type: "boolean", default: true },
    ],
  },

  messages: {
    label: "Wiadomości",
    singular: "wiadomość",
    icon: "✉️",
    readOnly: true,
    listColumns: ["name", "email", "subject", "createdAt"],
    fields: [
      { name: "name", label: "Imię", type: "text" },
      { name: "email", label: "E-mail", type: "text" },
      { name: "phone", label: "Telefon", type: "text" },
      { name: "subject", label: "Temat", type: "text" },
      { name: "message", label: "Wiadomość", type: "textarea" },
      { name: "coupon", label: "Kupon", type: "text" },
    ],
  },
};

export const resourceKeys = Object.keys(resources);
