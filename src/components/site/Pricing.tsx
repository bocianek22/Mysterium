import type { PricingPlan } from "@prisma/client";
import type { Locale, Dict } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

export default function Pricing({
  locale,
  t,
  plans,
}: {
  locale: Locale;
  t: Dict;
  plans: PricingPlan[];
}) {
  if (plans.length === 0) return null;
  return (
    <section
      className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1]"
      id="cennik"
      style={{ background: "linear-gradient(135deg,var(--teal-m) 0%,var(--navy-dd) 100%)" }}
    >
      <SectionHeader label={t.pricing.label} title={t.pricing.title} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[2px] max-w-[1100px] mx-auto mt-[60px]">
        {plans.map((p) => {
          const name = pick(p, "name", locale);
          const desc = pick(p, "desc", locale);
          const isQuote = !/\d/.test(p.price);
          return (
            <div
              key={p.id}
              className="relative overflow-hidden px-[30px] py-10 transition-all hover:-translate-y-[6px]"
              style={{
                background: p.featured ? "rgba(13,61,58,.2)" : "var(--navy-dd)",
                border: p.featured ? "1px solid rgba(201,168,76,.3)" : "1px solid rgba(201,168,76,.08)",
              }}
            >
              {p.featured && (
                <div
                  className="absolute top-[-1px] left-1/2 -translate-x-1/2 font-serif text-[9px] tracking-[2px] uppercase font-semibold px-5 py-[3px]"
                  style={{ background: "linear-gradient(90deg,var(--gold-d),var(--gold))", color: "var(--navy-dd)" }}
                >
                  {locale === "pl" ? "Najpopularniejszy" : "Most popular"}
                </div>
              )}
              <div className="font-serif text-[13px] tracking-[3px] uppercase mb-5 mt-2" style={{ color: "var(--gold)" }}>
                {name}
              </div>
              <div className="font-display leading-none mb-1" style={{ fontSize: isQuote ? 32 : 52, marginTop: isQuote ? 10 : 0 }}>
                {p.price}
              </div>
              {desc && (
                <div className="text-sm mt-4 mb-7 pt-4 leading-[1.7]" style={{ color: "var(--muted)", borderTop: "1px solid rgba(201,168,76,.08)" }}>
                  {desc}
                </div>
              )}
              <a
                href={p.ctaUrl || `/${locale}#${isQuote ? "kontakt" : "rezerwacja"}`}
                className="inline-block font-serif text-[11px] tracking-[2px] no-underline px-7 py-[11px] transition-all"
                style={{
                  border: "1px solid rgba(201,168,76,.35)",
                  color: p.featured ? "var(--navy-dd)" : "var(--gold)",
                  background: p.featured ? "linear-gradient(135deg,var(--gold-d),var(--gold))" : "transparent",
                  clipPath: "polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)",
                }}
              >
                {isQuote ? t.pricing.ask : t.pricing.book}
              </a>
            </div>
          );
        })}
      </div>
      <p className="text-center mt-7 font-serif text-[11px] tracking-[2px]" style={{ color: "var(--dim)" }}>
        {t.pricing.coupon}
      </p>
    </section>
  );
}
