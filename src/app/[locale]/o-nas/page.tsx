import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";
import About from "@/components/site/About";
import Reviews from "@/components/site/Reviews";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return pageMeta({ locale, title: t.about.title, description: locale === "pl" ? "Poznaj Mysterium — escape room w Nowym Dworze Mazowieckim." : "Meet Mysterium — an escape room in Nowy Dwór Mazowiecki.", path: "/o-nas" });
}

export default async function AboutPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const [settings, reviews] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "main" } }),
    prisma.review.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
  ]);

  const about = (locale === "pl" ? settings?.aboutPl : settings?.aboutEn) || "";
  const address = (locale === "pl" ? settings?.addressPl : settings?.addressEn) || "Warszawska 40, 05-100 Nowy Dwór Mazowiecki";

  return (
    <>
      <PageHero label={t.about.label} title={t.about.title} />
      <About locale={locale} t={t} about={about} address={address} mapEmbed={settings?.mapEmbed} mapLink={settings?.mapLink} />
      <Reviews locale={locale} t={t} reviews={reviews} googleUrl={settings?.googleReviewsEnabled ? settings?.googleReviewsUrl : null} googleRating={settings?.googleReviewsEnabled ? settings?.googleRating : null} />
    </>
  );
}
