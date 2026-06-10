import type { Locale } from "@/lib/i18n";

type Tier = { labelPl?: string; labelEn?: string; price?: string };

export default function PriceTable({
  locale,
  json,
  title,
  weekendPct = 0,
}: {
  locale: Locale;
  json: string | null | undefined;
  title: string;
  weekendPct?: number;
}) {
  const weekendPrice = (price?: string) => {
    if (!weekendPct || !price) return null;
    const n = parseFloat(String(price).replace(/[^\d.,]/g, "").replace(",", "."));
    if (!n) return null;
    return `${Math.round(n * (1 + weekendPct / 100))} zł`;
  };
  let tiers: Tier[] = [];
  try {
    tiers = json ? JSON.parse(json) : [];
    if (!Array.isArray(tiers)) tiers = [];
  } catch {
    tiers = [];
  }
  tiers = tiers.filter((t) => (t.labelPl || t.labelEn) && t.price);
  if (tiers.length === 0) return null;

  return (
    <div className="reveal">
      <div className="sec-label">💰 {title}</div>
      <div className="mt-3 rounded overflow-hidden max-w-[460px]" style={{ border: "1px solid var(--border)" }}>
        {tiers.map((t, i) => (
          <div
            key={i}
            className="flex justify-between items-center px-5 py-3"
            style={{ background: i % 2 ? "rgba(13,27,42,.4)" : "rgba(13,27,42,.7)" }}
          >
            <span className="text-sm" style={{ color: "var(--text)" }}>
              {(locale === "pl" ? t.labelPl : t.labelEn) || t.labelPl}
            </span>
            <span className="font-display text-lg" style={{ color: "var(--gold)" }}>
              {t.price}
              {weekendPrice(t.price) && (
                <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>/ {weekendPrice(t.price)}</span>
              )}
            </span>
          </div>
        ))}
      </div>
      {weekendPct > 0 && (
        <p className="text-[11px] mt-2" style={{ color: "var(--dim)" }}>
          {locale === "pl" ? `Pierwsza cena: dni powszednie. Druga: weekendy i święta (+${weekendPct}%).` : `First price: weekdays. Second: weekends & holidays (+${weekendPct}%).`}
        </p>
      )}
    </div>
  );
}
