import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { getHomeData } from "@/lib/data";
import Hero from "@/components/site/Hero";
import Rooms from "@/components/site/Rooms";
import VideoSection from "@/components/site/VideoSection";
import HowItWorks from "@/components/site/HowItWorks";
import Pricing from "@/components/site/Pricing";
import Gallery from "@/components/site/Gallery";
import Reviews from "@/components/site/Reviews";
import Faq from "@/components/site/Faq";
import Booking from "@/components/site/Booking";
import Contact from "@/components/site/Contact";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const { settings, rooms, gallery, videos, reviews, pricing, faq } =
    await getHomeData();

  const heroDesc = locale === "pl" ? settings?.heroDescPl : settings?.heroDescEn;

  return (
    <>
      <Hero locale={locale} t={t} desc={heroDesc || ""} />
      <Rooms locale={locale} t={t} rooms={rooms} />
      <VideoSection locale={locale} t={t} videos={videos} />
      <HowItWorks t={t} />
      <Pricing locale={locale} t={t} plans={pricing} />
      <Gallery locale={locale} t={t} images={gallery} />
      <Reviews locale={locale} t={t} reviews={reviews} />
      <Faq locale={locale} t={t} items={faq} />
      <Booking t={t} lockmeUrl={settings?.lockmeUrl || "https://lock.me"} />
      <Contact
        locale={locale}
        t={t}
        phone={settings?.phone || "+48 571 080 192"}
        email={settings?.email || "artsmysterium@gmail.com"}
        address={(locale === "pl" ? settings?.addressPl : settings?.addressEn) || ""}
        hours={(locale === "pl" ? settings?.hoursPl : settings?.hoursEn) || ""}
        whatsapp={settings?.whatsapp || "48571080192"}
      />
    </>
  );
}
