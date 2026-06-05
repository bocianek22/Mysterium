import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import PageHero from "@/components/site/PageHero";
import Pricing from "@/components/site/Pricing";
import Faq from "@/components/site/Faq";

export const dynamic = "force-dynamic";

export default async function PricingPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const [pricing, faq] = await Promise.all([
    prisma.pricingPlan.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    prisma.faqItem.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <PageHero label={t.pricing.label} title={t.pricing.title} subtitle={locale === "pl" ? "Przejrzyste pakiety dla każdej grupy i okazji." : "Transparent packages for every group and occasion."} />
      <Pricing locale={locale} t={t} plans={pricing} />
      <Faq locale={locale} t={t} items={faq} />
    </>
  );
}
