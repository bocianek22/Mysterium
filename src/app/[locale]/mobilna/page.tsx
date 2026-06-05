import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";
import MobileCard from "@/components/site/MobileCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return pageMeta({ locale, title: t.mobile.title, description: t.mobile.sub, path: "/mobilna" });
}

export default async function MobilePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const offers = await prisma.mobileOffer.findMany({ where: { published: true }, orderBy: { order: "asc" } });

  return (
    <>
      <PageHero label={t.mobile.label} title={t.mobile.title} subtitle={t.mobile.sub} />
      <section className="px-6 md:px-[60px] py-16 md:py-24 relative z-[1] aurora" style={{ background: "linear-gradient(180deg,var(--navy-dd) 0%,var(--teal-m) 50%,var(--navy-dd) 100%)" }}>
        <div className="relative z-[1]">
          {offers.length === 0 ? (
            <p className="text-center" style={{ color: "var(--muted)" }}>{t.rooms.empty}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-[2px] max-w-[1200px] mx-auto">
              {offers.map((o) => <MobileCard key={o.id} offer={o} locale={locale} t={t} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
