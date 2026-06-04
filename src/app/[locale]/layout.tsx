import { notFound } from "next/navigation";
import { isLocale, getDict, locales, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import Nav from "@/components/site/Nav";
import Footer from "@/components/site/Footer";
import Particles from "@/components/site/Particles";
import WhatsappFloat from "@/components/site/WhatsappFloat";

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

  return (
    <>
      <Particles />
      <Nav locale={locale} t={t} />
      <main>{children}</main>
      <Footer locale={locale} t={t} phone={phone} email={email} />
      <WhatsappFloat whatsapp={whatsapp} />
    </>
  );
}
