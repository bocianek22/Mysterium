import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import Contact from "@/components/site/Contact";

export const dynamic = "force-dynamic";

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
    </div>
  );
}
