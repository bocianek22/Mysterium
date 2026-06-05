import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { getHomeData } from "@/lib/data";
import Hero from "@/components/site/Hero";
import Promo from "@/components/site/Promo";
import Rooms from "@/components/site/Rooms";
import VideoSection from "@/components/site/VideoSection";
import HowItWorks from "@/components/site/HowItWorks";
import Pricing from "@/components/site/Pricing";
import Reviews from "@/components/site/Reviews";
import Faq from "@/components/site/Faq";

export const dynamic = "force-dynamic";

export default async function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const { settings, rooms, videos, reviews, pricing, faq } = await getHomeData();

  const heroDesc = locale === "pl" ? settings?.heroDescPl : settings?.heroDescEn;

  return (
    <>
      <Hero locale={locale} t={t} desc={heroDesc || ""} />

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

      {/* Teaser oferty mobilnej */}
      <section className="px-6 md:px-[60px] py-16 md:py-20 relative z-[1] aurora" style={{ background: "linear-gradient(135deg,var(--teal-m),var(--navy-dd))" }}>
        <div className="relative z-[1] max-w-[1000px] mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="text-6xl md:text-7xl floaty">📦</div>
          <div className="flex-1">
            <div className="sec-label reveal">{t.mobile.label}</div>
            <h2 className="font-display text-gold-grad shimmer text-3xl md:text-4xl mb-3 reveal reveal-d1">{t.mobile.title}</h2>
            <p className="text-base mb-5 max-w-[560px] reveal reveal-d2" style={{ color: "var(--muted)" }}>{t.mobile.sub}</p>
            <a href={`/${locale}/mobilna`} className="btn-gold reveal reveal-d3">{t.mobile.explore}</a>
          </div>
        </div>
      </section>

      <VideoSection locale={locale} t={t} videos={videos} />
      <HowItWorks t={t} />
      <Pricing locale={locale} t={t} plans={pricing} />
      <Reviews locale={locale} t={t} reviews={reviews} />
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
