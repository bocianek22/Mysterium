import { notFound } from "next/navigation";
import { isLocale, getDict, pick, locales, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import Particles from "@/components/site/Particles";
import WhatsappFloat from "@/components/site/WhatsappFloat";
import SiteFX from "@/components/site/FX";
import Splash from "@/components/site/Splash";
import HtmlLang from "@/components/site/HtmlLang";
import CookieBanner from "@/components/site/CookieBanner";
import JsonLd from "@/components/site/JsonLd";
import SitePopup from "@/components/site/SitePopup";

// Renderowanie na żądanie — strona pobiera treści z bazy w czasie żądania,
// dzięki czemu build (np. na Vercel) nie wymaga połączenia z bazą.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const settings =
    (await prisma.siteSettings.findUnique({ where: { id: "main" } })) ?? null;

  const phone = settings?.phone ?? "+48 571 080 192";
  const email = settings?.email ?? "artsmysterium@gmail.com";
  const whatsapp = settings?.whatsapp ?? "48571080192";
  const address = (locale === "pl" ? settings?.addressPl : settings?.addressEn) || "Warszawska 40, 05-100 Nowy Dwór Mazowiecki";

  return (
    <>
      <HtmlLang locale={locale} />
      <Splash label={t.splash} />
      <SiteFX />
      <Particles />
      <Nav locale={locale} t={t} logoUrl={settings?.logoUrl} />
      <main>{children}</main>
      <Footer locale={locale} t={t} phone={phone} email={email} address={address} instagram={settings?.instagram} facebook={settings?.facebook} tiktok={settings?.tiktok} youtube={settings?.youtube} />
      {settings && settings.popupMode !== "OFF" && (
        <SitePopup
          locale={locale}
          t={t}
          mode={settings.popupMode === "NEWSLETTER" ? "NEWSLETTER" : "PROMO"}
          title={pick(settings, "popupTitle", locale)}
          text={pick(settings, "popupText", locale)}
          image={settings.popupImage}
          ctaLabel={pick(settings, "popupCtaLabel", locale)}
          ctaUrl={settings.popupCtaUrl}
          delaySec={settings.popupDelaySec ?? 6}
        />
      )}
      <WhatsappFloat whatsapp={whatsapp} />
      <CookieBanner locale={locale} />
      <JsonLd
        address={address}
        phone={phone}
        email={email}
        hours={locale === "pl" ? settings?.hoursPl : settings?.hoursEn}
        rating={settings?.googleReviewsEnabled ? settings?.googleRating : null}
      />
    </>
  );
}
