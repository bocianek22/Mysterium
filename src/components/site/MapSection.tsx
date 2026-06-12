import type { Locale } from "@/lib/i18n";

export default function MapSection({ locale, address, parking }: { locale: Locale; address: string; parking?: string | null }) {
  const pl = locale === "pl";
  if (!address) return null;
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
  const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  return (
    <section className="px-6 md:px-[60px] pb-20 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
      <div className="max-w-[1100px] mx-auto">
        <div className="sec-label reveal">{pl ? "Dojazd" : "Getting here"}</div>
        <h2 className="font-display text-gold-grad text-2xl md:text-3xl mb-6 reveal">{pl ? "Jak do nas trafić" : "How to find us"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 reveal rounded overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <iframe
              title={pl ? "Mapa dojazdu" : "Location map"}
              src={src}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
              style={{ height: 360, border: 0, filter: "grayscale(.3) contrast(1.05)" }}
            />
          </div>
          <div className="reveal reveal-d1 p-5 rounded" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
            <div className="text-sm mb-1" style={{ color: "var(--gold)" }}>📍 {pl ? "Adres" : "Address"}</div>
            <p className="text-[15px] mb-4" style={{ color: "var(--text)" }}>{address}</p>
            {parking && (
              <>
                <div className="text-sm mb-1" style={{ color: "var(--gold)" }}>🅿️ {pl ? "Parking / dojazd" : "Parking / directions"}</div>
                <p className="text-sm mb-4 whitespace-pre-line leading-[1.7]" style={{ color: "var(--muted)" }}>{parking}</p>
              </>
            )}
            <a href={dirUrl} target="_blank" rel="noopener noreferrer" className="btn-gold inline-block" style={{ clipPath: "none", padding: "11px 22px" }}>
              {pl ? "Wyznacz trasę" : "Get directions"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
