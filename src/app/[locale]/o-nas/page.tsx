import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import PageHero from "@/components/site/PageHero";
import About from "@/components/site/About";
import Reviews from "@/components/site/Reviews";

export const dynamic = "force-dynamic";

export default async function AboutPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const [settings, reviews] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "main" } }),
    prisma.review.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
  ]);

  const about = (locale === "pl" ? settings?.aboutPl : settings?.aboutEn) || "";
  const address = (locale === "pl" ? settings?.addressPl : settings?.addressEn) || "ul. Ogrodowa, Warszawa";

  return (
    <>
      <PageHero label={t.about.label} title={t.about.title} />
      <About locale={locale} t={t} about={about} address={address} mapEmbed={settings?.mapEmbed} mapLink={settings?.mapLink} />
      <Reviews locale={locale} t={t} reviews={reviews} />
    </>
  );
}
