import type { Locale, Dict } from "@/lib/i18n";

export default function About({
  locale,
  t,
  about,
  address,
  mapEmbed,
  mapLink,
}: {
  locale: Locale;
  t: Dict;
  about: string;
  address: string;
  mapEmbed?: string | null;
  mapLink?: string | null;
}) {
  // Domyślne osadzenie mapy z adresu (bez klucza API), gdy brak własnego embeda
  const src =
    mapEmbed && mapEmbed.trim()
      ? mapEmbed
      : `https://www.google.com/maps?q=${encodeURIComponent(address || "Warszawa")}&output=embed`;

  const paragraphs = (about || "").split(/\n{2,}/).filter(Boolean);

  return (
    <section className="px-6 md:px-[60px] py-16 md:py-24 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="reveal reveal-left">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} className="text-[15px] md:text-base leading-[1.95] mb-4" style={{ color: "var(--muted)" }}>
                {p}
              </p>
            ))
          ) : (
            <p className="text-[15px] leading-[1.95]" style={{ color: "var(--muted)" }}>
              {locale === "pl"
                ? "Mysterium to stacjonarny escape room w sercu Warszawy. Tworzymy wciągające historie, dopracowane zagadki i niepowtarzalny klimat — idealne na wieczór ze znajomymi, randkę, urodziny czy event firmowy."
                : "Mysterium is an on-site escape room in the heart of Warsaw. We craft immersive stories, polished puzzles and a one-of-a-kind atmosphere — perfect for a night out, a date, a birthday or a corporate event."}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              locale === "pl" ? "🗝️ Autorskie zagadki" : "🗝️ Original puzzles",
              locale === "pl" ? "🎭 Mocny klimat" : "🎭 Strong atmosphere",
              locale === "pl" ? "👥 2–8 graczy" : "👥 2–8 players",
            ].map((tag) => (
              <span key={tag} className="font-serif text-[10px] tracking-[2px] uppercase px-[14px] py-2" style={{ border: "1px solid rgba(201,168,76,.25)", background: "rgba(201,168,76,.05)", color: "var(--muted)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="reveal reveal-right">
          <div className="font-serif text-[10px] tracking-[3px] uppercase mb-3" style={{ color: "var(--gold)" }}>
            {t.about.findUs}
          </div>
          <div className="corner-frame overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <iframe
              src={src}
              className="w-full block"
              style={{ height: 360, border: 0, filter: "grayscale(.3) invert(.92) hue-rotate(170deg)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa"
            />
          </div>
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm" style={{ color: "var(--muted)" }}>📍 {address}</span>
            {mapLink && (
              <a href={mapLink} target="_blank" rel="noopener noreferrer" className="font-serif text-[11px] tracking-[2px]" style={{ color: "var(--gold-l)" }}>
                {locale === "pl" ? "Otwórz w Google Maps ↗" : "Open in Google Maps ↗"}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
