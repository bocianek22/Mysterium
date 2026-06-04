export const locales = ["pl", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pl";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Wybiera pole PL/EN z obiektu treści CMS, np. pick(room, "name", locale)
export function pick<T extends Record<string, any>>(
  obj: T,
  base: string,
  locale: Locale
): string {
  const key = `${base}${locale === "pl" ? "Pl" : "En"}`;
  return (obj?.[key] ?? obj?.[`${base}Pl`] ?? "") as string;
}

const dict = {
  pl: {
    nav: {
      rooms: "Pokoje",
      how: "Jak to działa",
      pricing: "Cennik",
      gallery: "Galeria",
      reviews: "Opinie",
      faq: "FAQ",
      contact: "Kontakt",
      book: "Zarezerwuj",
    },
    hero: {
      eyebrow: "Escape Room · Warszawa, ul. Ogrodowa",
      subtitle: "ESCAPE ROOM",
      bookNow: "🗝️ Zarezerwuj teraz",
      exploreRooms: "Poznaj pokoje",
      scroll: "ODKRYJ",
      tagOnsite: "Stacjonarny",
      tagMobile: "Mobilna Skrzynia",
      tagLocation: "ul. Ogrodowa · Warszawa",
    },
    rooms: {
      label: "Nasze pokoje",
      title: "Wybierz swoją misję",
      explore: "Odkryj →",
      min: "min",
      people: "os.",
      empty: "Wkrótce dodamy nasze pokoje.",
    },
    video: { label: "Zajrzyj do środka", title: "Poczuj atmosferę" },
    how: {
      label: "Jak to działa",
      title: "Prosta rezerwacja",
      text: "Rezerwacji pokoju dokonujesz bezpośrednio przez portal LockMe — szybko, wygodnie i online. W przypadku większych eventów, imprez firmowych lub dodatkowych pytań zapraszamy do kontaktu przez WhatsApp lub formularz kontaktowy. 🗝️",
      steps: [
        { icon: "🗝️", title: "Wybierz pokój", desc: "Przejrzyj nasze pokoje i wybierz misję dla swojej grupy." },
        { icon: "📅", title: "Zarezerwuj termin", desc: "Rezerwacja online przez LockMe — w kilka chwil." },
        { icon: "🧩", title: "Rozwiąż zagadki", desc: "60 minut emocji, współpracy i niezapomnianej zabawy." },
        { icon: "🏆", title: "Wygraj!", desc: "Uciekniesz przed czasem? Pamiątkowe zdjęcie czeka." },
      ],
    },
    pricing: { label: "Cennik", title: "Transparentne ceny", book: "Zarezerwuj →", ask: "Zapytaj →", coupon: "Masz kupon rabatowy? Wpisz go w formularzu kontaktowym poniżej." },
    gallery: { label: "Galeria", title: "Nasze wnętrza", empty: "Galeria wkrótce." },
    reviews: { label: "Opinie", title: "Co mówią gracze?" },
    faq: { label: "FAQ", title: "Najczęstsze pytania" },
    booking: { label: "Rezerwacja online", title: "Zarezerwuj swoje miejsce", cta: "🗝️ Przejdź do LockMe", powered: "Powered by LockMe" },
    contact: {
      label: "Kontakt",
      title: "Napisz do nas",
      address: "Adres",
      phone: "Telefon",
      email: "E-mail",
      hours: "Odpowiadamy",
      formTitle: "Skontaktuj się",
      formSub: "Napisz do nas — odpiszemy szybko.",
      name: "Imię",
      yourPhone: "Telefon",
      subject: "Temat",
      choose: "Wybierz...",
      couponLabel: "Kupon rabatowy",
      message: "Wiadomość",
      send: "Wyślij wiadomość",
      sending: "Wysyłanie...",
      ok: "✓ Wiadomość wysłana! Odpiszemy wkrótce.",
      err: "Wystąpił błąd. Spróbuj ponownie.",
      privacy: "Wysyłając formularz akceptujesz Politykę Prywatności.",
      subjects: [
        "Rezerwacja pokoju stacjonarnego",
        "Mobilna Skrzynia — event/urodziny",
        "Event firmowy",
        "Urodziny / impreza",
        "Wieczór panieński/kawalerski",
        "Pytanie ogólne",
      ],
    },
    footer: {
      tagline: "Stacjonarny Escape Room w Warszawie. ul. Ogrodowa · Mobilna Skrzynia na eventy.",
      nav: "Nawigacja",
      info: "Informacje",
      privacy: "Polityka prywatności",
      rights: "Wszelkie prawa zastrzeżone.",
    },
  },
  en: {
    nav: {
      rooms: "Rooms",
      how: "How it works",
      pricing: "Pricing",
      gallery: "Gallery",
      reviews: "Reviews",
      faq: "FAQ",
      contact: "Contact",
      book: "Book now",
    },
    hero: {
      eyebrow: "Escape Room · Warsaw, Ogrodowa St.",
      subtitle: "ESCAPE ROOM",
      bookNow: "🗝️ Book now",
      exploreRooms: "Explore rooms",
      scroll: "DISCOVER",
      tagOnsite: "On-site",
      tagMobile: "Mobile Box",
      tagLocation: "Ogrodowa St. · Warsaw",
    },
    rooms: {
      label: "Our rooms",
      title: "Choose your mission",
      explore: "Discover →",
      min: "min",
      people: "ppl",
      empty: "Our rooms are coming soon.",
    },
    video: { label: "Look inside", title: "Feel the atmosphere" },
    how: {
      label: "How it works",
      title: "Easy booking",
      text: "Book your room directly via the LockMe portal — fast, convenient and online. For larger events, corporate parties or extra questions, reach us on WhatsApp or the contact form. 🗝️",
      steps: [
        { icon: "🗝️", title: "Pick a room", desc: "Browse our rooms and choose a mission for your group." },
        { icon: "📅", title: "Book a slot", desc: "Online booking via LockMe — in just a few clicks." },
        { icon: "🧩", title: "Solve the puzzles", desc: "60 minutes of thrills, teamwork and unforgettable fun." },
        { icon: "🏆", title: "Win!", desc: "Escape before time runs out? A souvenir photo awaits." },
      ],
    },
    pricing: { label: "Pricing", title: "Transparent prices", book: "Book →", ask: "Ask →", coupon: "Got a discount code? Enter it in the contact form below." },
    gallery: { label: "Gallery", title: "Our interiors", empty: "Gallery coming soon." },
    reviews: { label: "Reviews", title: "What players say" },
    faq: { label: "FAQ", title: "Frequently asked questions" },
    booking: { label: "Online booking", title: "Book your spot", cta: "🗝️ Go to LockMe", powered: "Powered by LockMe" },
    contact: {
      label: "Contact",
      title: "Get in touch",
      address: "Address",
      phone: "Phone",
      email: "E-mail",
      hours: "We reply",
      formTitle: "Contact us",
      formSub: "Write to us — we'll reply quickly.",
      name: "Name",
      yourPhone: "Phone",
      subject: "Subject",
      choose: "Choose...",
      couponLabel: "Discount code",
      message: "Message",
      send: "Send message",
      sending: "Sending...",
      ok: "✓ Message sent! We'll reply soon.",
      err: "Something went wrong. Please try again.",
      privacy: "By submitting the form you accept the Privacy Policy.",
      subjects: [
        "On-site room booking",
        "Mobile Box — event/birthday",
        "Corporate event",
        "Birthday / party",
        "Stag/hen party",
        "General question",
      ],
    },
    footer: {
      tagline: "On-site Escape Room in Warsaw. Ogrodowa St. · Mobile Box for events.",
      nav: "Navigation",
      info: "Information",
      privacy: "Privacy policy",
      rights: "All rights reserved.",
    },
  },
};

export type Dict = (typeof dict)["pl"];

export function getDict(locale: Locale): Dict {
  return dict[locale];
}
