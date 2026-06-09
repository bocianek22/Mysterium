import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import Contact from "@/components/site/Contact";
import MapSection from "@/components/site/MapSection";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return pageMeta({ locale, title: t.contact.title, description: locale === "pl" ? "Skontaktuj się z Mysterium — telefon, e-mail, WhatsApp, formularz." : "Contact Mysterium — phone, e-mail, WhatsApp, form.", path: "/kontakt" });
}

export default async function ContactPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });

  return (
    <div className="pt-[90px]">
      <Contact
        locale={locale}
        t={t}
        phone={settings?.phone || "+48 571 080 192"}
        email={settings?.email || "artsmysterium@gmail.com"}
        address={(locale === "pl" ? settings?.addressPl : settings?.addressEn) || ""}
        hours={(locale === "pl" ? settings?.hoursPl : settings?.hoursEn) || ""}
        whatsapp={settings?.whatsapp || "48571080192"}
      />
      <MapSection
        locale={locale}
        address={(locale === "pl" ? settings?.addressPl : settings?.addressEn) || "Warszawska 40, 05-100 Nowy Dwór Mazowiecki"}
        parking={locale === "pl" ? settings?.parkingPl : settings?.parkingEn}
      />
    </div>
  );
}
