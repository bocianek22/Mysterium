import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { getHomeData } from "@/lib/data";
import Hero from "@/components/site/Hero";
import FeatureStrip from "@/components/site/FeatureStrip";
import Promo from "@/components/site/Promo";
import Rooms from "@/components/site/Rooms";
import MobileCard from "@/components/site/MobileCard";
import SectionHeader from "@/components/site/SectionHeader";
import VideoSection from "@/components/site/VideoSection";
import HowItWorks from "@/components/site/HowItWorks";
import Reviews from "@/components/site/Reviews";
import Faq from "@/components/site/Faq";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  return pageMeta({
    locale,
    title: "MYSTERIUM — Escape Room Nowy Dwór Mazowiecki",
    description: locale === "pl"
      ? "Escape room w Nowym Dworze Mazowieckim i mobilna Skrzynia „Pułapka” na eventy. Rozwiąż zagadki i ucieknij przed czasem."
      : "Escape room in Nowy Dwór Mazowiecki and the mobile box 'The Trap' for events. Solve the puzzles and escape before time runs out.",
    path: "",
  });
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const { settings, rooms, mobile, videos, reviews, faq } = await getHomeData();

  const heroDesc = locale === "pl" ? settings?.heroDescPl : settings?.heroDescEn;
  const address = (locale === "pl" ? settings?.addressPl : settings?.addressEn) || "";

  return (
    <>
      <Hero locale={locale} t={t} desc={heroDesc || ""} address={address} />
      <FeatureStrip t={t} />

      {settings?.promoMode && settings.promoMode !== "OFF" && (
        <Promo
          locale={locale}
          t={t}
          mode={settings.promoMode}
          title={(locale === "pl" ? settings.promoTitlePl : settings.promoTitleEn) || ""}
          text={(locale === "pl" ? settings.promoTextPl : settings.promoTextEn) || ""}
          ctaLabel={(locale === "pl" ? settings.promoCtaLabelPl : settings.promoCtaLabelEn) || ""}
          ctaUrl={settings.promoCtaUrl}
          date={settings.promoDate ? settings.promoDate.toISOString() : null}
        />
      )}

      <Rooms locale={locale} t={t} rooms={rooms.slice(0, 3)} />
      <div className="text-center -mt-8 md:-mt-12 pb-16 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
        <a href={`/${locale}/pokoje`} className="btn-outline">{t.common.seeAllRooms}</a>
      </div>

      {/* Oferty mobilne — karty jak pokoje */}
      {mobile.length > 0 && (
        <section className="px-6 md:px-[60px] py-20 md:py-[120px] relative z-[1] aurora" style={{ background: "linear-gradient(180deg,var(--navy-dd) 0%,var(--teal-m) 50%,var(--navy-dd) 100%)" }}>
          <div className="relative z-[1]">
            <SectionHeader label={t.mobile.label} title={t.mobile.title} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(340px,1fr))] gap-[2px] max-w-[1200px] mx-auto">
              {mobile.slice(0, 3).map((o) => <MobileCard key={o.id} offer={o} locale={locale} t={t} />)}
            </div>
            <div className="text-center mt-10">
              <a href={`/${locale}/mobilna`} className="btn-outline">{t.mobile.explore}</a>
            </div>
          </div>
        </section>
      )}

      <VideoSection locale={locale} t={t} videos={videos} />
      <HowItWorks t={t} />
      <Reviews locale={locale} t={t} reviews={reviews} googleUrl={settings?.googleReviewsEnabled ? settings?.googleReviewsUrl : null} googleRating={settings?.googleReviewsEnabled ? settings?.googleRating : null} />
      <Faq locale={locale} t={t} items={faq} />

      {/* CTA końcowe */}
      <section className="px-6 md:px-[60px] py-20 relative z-[1] aurora text-center" style={{ background: "linear-gradient(135deg,var(--teal-m),var(--navy-dd))" }}>
        <div className="relative z-[1] max-w-[640px] mx-auto">
          <h2 className="font-display text-gold-grad shimmer text-3xl md:text-4xl mb-5 reveal">{t.booking.title}</h2>
          <div className="flex gap-4 justify-center flex-wrap reveal reveal-d1">
            <a href={`/${locale}/rezerwacja`} className="btn-gold">{t.hero.bookNow}</a>
            <a href={`/${locale}/kontakt`} className="btn-outline">{t.nav.contact}</a>
          </div>
        </div>
      </section>
    </>
  );
}
