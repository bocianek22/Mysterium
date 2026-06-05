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
      { name: "priceInfoPl", label: "Cena gry (PL)", type: "text", placeholder: "np. od 299 zł" },
      { name: "priceInfoEn", label: "Cena gry (EN)", type: "text", placeholder: "e.g. from 299 zł" },
      { name: "travelZonesJson", label: "Cennik dojazdu (strefy)", type: "zones", help: "Np. Warszawa — 0 zł, do 30 km — 100 zł." },
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
      { name: "textPl", label: "Treść (PL)", type: "textarea", required: true },
      { name: "textEn", label: "Treść (EN)", type: "textarea", required: true },
      { name: "eventPl", label: "Okazja (PL)", type: "text", placeholder: "np. Urodziny" },
      { name: "eventEn", label: "Okazja (EN)", type: "text", placeholder: "e.g. Birthday" },
      { name: "order", label: "Kolejność", type: "number", default: 0 },
      { name: "published", label: "Widoczna na stronie", type: "boolean", default: true },
    ],
  },

  pricing: {
    label: "Cennik",
    singular: "pakiet",
    icon: "💰",
    listColumns: ["namePl", "price", "featured"],
    fields: [
      { name: "namePl", label: "Nazwa (PL)", type: "text", required: true },
      { name: "nameEn", label: "Nazwa (EN)", type: "text", required: true },
      { name: "price", label: "Cena", type: "text", required: true, placeholder: "199 zł lub Wycena" },
      { name: "descPl", label: "Opis (PL)", type: "text", placeholder: "Do 4 osób • 60 min" },
      { name: "descEn", label: "Opis (EN)", type: "text", placeholder: "Up to 4 people • 60 min" },
      { name: "featured", label: "Wyróżniony (najpopularniejszy)", type: "boolean", default: false },
      { name: "ctaUrl", label: "Link przycisku (opcjonalnie)", type: "text" },
      { name: "order", label: "Kolejność", type: "number", default: 0 },
      { name: "published", label: "Widoczny na stronie", type: "boolean", default: true },
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
