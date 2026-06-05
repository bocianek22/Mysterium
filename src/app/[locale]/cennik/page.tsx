import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDict, pick, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";
import PriceTable from "@/components/site/PriceTable";
import Faq from "@/components/site/Faq";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return pageMeta({ locale, title: t.pricing.title, description: locale === "pl" ? "Cennik pokoi i oferty mobilnej Mysterium — ceny zależne od liczby osób." : "Mysterium room and mobile pricing — prices depend on group size.", path: "/cennik" });
}

export default async function PricingPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const [rooms, mobile, faq] = await Promise.all([
    prisma.room.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    prisma.mobileOffer.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    prisma.faqItem.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
  ]);

  const items = [
    ...rooms.map((r) => ({ kind: "pokoje" as const, slug: r.slug, name: pick(r, "name", locale), pricingJson: r.pricingJson, badge: pick(r, "badge", locale) })),
    ...mobile.map((m) => ({ kind: "mobilna" as const, slug: m.slug, name: pick(m, "name", locale), pricingJson: m.pricingJson, badge: pick(m, "badge", locale) })),
  ];
  const withPricing = items.filter((i) => i.pricingJson && i.pricingJson !== "[]");

  return (
    <>
      <PageHero label={t.pricing.label} title={t.pricing.title} subtitle={locale === "pl" ? "Ceny zależą od pokoju i liczby osób. Szczegóły przy każdej grze." : "Prices depend on the room and group size. Details for each game."} />
      <section className="px-6 md:px-[60px] py-12 md:py-20 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {withPricing.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>{locale === "pl" ? "Cennik wkrótce." : "Pricing coming soon."}</p>
          ) : (
            withPricing.map((i) => (
              <div key={i.kind + i.slug} className="p-6 rounded reveal" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="font-display text-2xl" style={{ color: "var(--gold)" }}>{i.name}</h2>
                  <span className="font-serif text-[9px] tracking-[2px] uppercase px-3 py-[3px]" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>{i.badge}</span>
                </div>
                <PriceTable locale={locale} json={i.pricingJson} title={t.pricing.label} />
                <Link href={`/${locale}/${i.kind}/${i.slug}`} className="inline-block mt-4 font-serif text-[11px] tracking-[2px]" style={{ color: "var(--gold-l)" }}>
                  {t.common.details} →
                </Link>
              </div>
            ))
          )}
        </div>
        <p className="text-center mt-10 font-serif text-[11px] tracking-[2px] reveal" style={{ color: "var(--dim)" }}>{t.pricing.coupon}</p>
      </section>
      <Faq locale={locale} t={t} items={faq} />
    </>
  );
}
