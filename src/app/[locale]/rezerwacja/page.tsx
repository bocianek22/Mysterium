import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { pick } from "@/lib/i18n";
import Booking from "@/components/site/Booking";
import OwnBooking from "@/components/site/OwnBooking";

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
  const pl = locale === "pl";
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });

  let rooms: { id: string; name: string }[] = [];
  if (settings?.ownBookingEnabled) {
    const list = await prisma.room.findMany({ where: { published: true, status: "ACTIVE" }, orderBy: { order: "asc" }, select: { id: true, namePl: true, nameEn: true } });
    rooms = list.map((r) => ({ id: r.id, name: pl ? r.namePl : r.nameEn }));
  }

  return (
    <div className="pt-[90px]">
      {settings?.ownBookingEnabled && rooms.length > 0 && (
        <section className="px-6 md:px-[60px] py-12 md:py-16 max-w-[1100px] mx-auto">
          <h2 className="font-display text-gold-grad text-3xl text-center mb-2">{pl ? "Zarezerwuj online" : "Book online"}</h2>
          <p className="text-center text-sm mb-8" style={{ color: "var(--muted)" }}>{pl ? "Wybierz pokój, termin i potwierdź — to wszystko." : "Pick a room, a time and confirm — that's it."}</p>
          <OwnBooking locale={locale} rooms={rooms} depositZl={settings.ownBookingDeposit || 0} info={pick(settings, "ownBookingInfo", locale)} />
        </section>
      )}
      <Booking t={t} lockmeUrl={settings?.lockmeUrl || "https://lock.me"} widget={settings?.lockmeWidget} />
    </div>
  );
}
