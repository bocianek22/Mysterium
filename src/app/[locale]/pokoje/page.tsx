import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import PageHero from "@/components/site/PageHero";
import Rooms from "@/components/site/Rooms";

export const dynamic = "force-dynamic";

export default async function RoomsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const rooms = await prisma.room.findMany({ where: { published: true }, orderBy: { order: "asc" } });

  return (
    <>
      <PageHero
        label={t.rooms.label}
        title={t.rooms.title}
        subtitle={locale === "pl" ? "Wybierz pokój i rozpocznij swoją przygodę. Kliknij, by poznać szczegóły." : "Pick a room and start your adventure. Click for details."}
      />
      <Rooms locale={locale} t={t} rooms={rooms} hideHeader />
    </>
  );
}
