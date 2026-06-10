import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, pick, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";
import PriceTable from "@/components/site/PriceTable";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  return pageMeta({
    locale,
    title: locale === "pl" ? "Pakiety okazjonalne — urodziny, wieczory, integracje" : "Special packages — birthdays, parties, team building",
    description: locale === "pl" ? "Gotowe pakiety na urodziny, wieczory panieńskie/kawalerskie i integracje firmowe. Ceny od — zależnie od liczby osób." : "Ready packages for birthdays, parties and corporate team building. Prices from — depending on group size.",
    path: "/pakiety",
  });
}

export default async function PackagesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const pl = locale === "pl";
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const packages = await prisma.package.findMany({ where: { published: true }, orderBy: [{ featured: "desc" }, { order: "asc" }] });

  return (
    <>
      <PageHero
        label={pl ? "Oferta" : "Offer"}
        title={pl ? "Pakiety okazjonalne" : "Special packages"}
        subtitle={pl ? "Urodziny, wieczory panieńskie i kawalerskie, integracje firmowe — wybierz gotowy pakiet." : "Birthdays, hen & stag parties, team building — pick a ready package."}
      />

      <section className="px-6 md:px-[60px] py-12 md:py-16 max-w-[1200px] mx-auto">
        {packages.length === 0 ? (
          <p className="text-center" style={{ color: "var(--muted)" }}>
            {pl ? "Pakiety pojawią się wkrótce. Napisz do nas po indywidualną wycenę!" : "Packages coming soon. Contact us for a custom quote!"}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {packages.map((p) => {
              const name = pick(p, "name", locale);
              const occasion = pick(p, "occasion", locale);
              const tagline = pick(p, "tagline", locale);
              const desc = pick(p, "description", locale);
              const note = pick(p, "priceNote", locale);
              const includes = (pick(p, "includes", locale) || "").split("\n").map((s) => s.trim()).filter(Boolean);
              return (
                <div key={p.id} className="corner-frame overflow-hidden flex flex-col" style={{ background: "rgba(13,27,42,.5)", border: p.featured ? "1px solid var(--gold)" : "1px solid var(--border)" }}>
                  {p.image && (
                    <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${p.image})` }} />
                  )}
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {occasion && <span className="text-[11px] font-serif tracking-[2px] uppercase px-2 py-1 rounded" style={{ background: "rgba(201,168,76,.12)", color: "var(--gold)" }}>{occasion}</span>}
                      <span className="text-[11px]" style={{ color: "var(--dim)" }}>👥 {p.minPlayers}–{p.maxPlayers} · ⏱️ {p.durationMin} min</span>
                    </div>
                    <h3 className="font-display text-gold-grad text-2xl">{name}</h3>
                    {tagline && <p className="text-sm" style={{ color: "var(--muted)" }}>{tagline}</p>}
                    {p.priceFrom > 0 && (
                      <div className="text-lg" style={{ color: "var(--gold-l)" }}>
                        {pl ? "od" : "from"} <b style={{ fontSize: "1.5rem" }}>{p.priceFrom} zł</b>
                        {note && <span className="text-[12px] ml-1" style={{ color: "var(--dim)" }}>{note}</span>}
                      </div>
                    )}
                    {desc && <p className="text-sm leading-[1.7]" style={{ color: "var(--muted)" }}>{desc}</p>}
                    {includes.length > 0 && (
                      <ul className="flex flex-col gap-1.5 mt-1">
                        {includes.map((it, i) => (
                          <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--text)" }}>
                            <span style={{ color: "var(--gold)" }}>✓</span> {it}
                          </li>
                        ))}
                      </ul>
                    )}
                    {p.pricingJson && p.pricingJson !== "[]" && (
                      <div className="mt-2"><PriceTable locale={locale} json={p.pricingJson} title={pl ? "Cennik wg liczby osób" : "Price by group size"} weekendPct={settings?.weekendSurchargePct || 0} /></div>
                    )}
                    <div className="mt-auto pt-3">
                      <a href={p.bookingUrl || `/${locale}/rezerwacja`} target={p.bookingUrl ? "_blank" : undefined} className="btn-gold inline-block" style={{ clipPath: "none", padding: "10px 24px" }}>
                        {pl ? "Rezerwuj" : "Book now"}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
