import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import Booking from "@/components/site/Booking";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return pageMeta({ locale, title: t.booking.title, description: locale === "pl" ? "Zarezerwuj swój termin w Mysterium online przez LockMe." : "Book your slot at Mysterium online via LockMe.", path: "/rezerwacja" });
}

export default async function BookingPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });

  return (
    <div className="pt-[90px]">
      <Booking t={t} lockmeUrl={settings?.lockmeUrl || "https://lock.me"} widget={settings?.lockmeWidget} />
    </div>
  );
}
