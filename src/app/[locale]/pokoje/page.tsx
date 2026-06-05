import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";
import Rooms from "@/components/site/Rooms";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return pageMeta({ locale, title: t.rooms.title, description: locale === "pl" ? "Nasze pokoje zagadek w Warszawie — wybierz misję dla swojej grupy." : "Our escape rooms in Warsaw — choose a mission for your group.", path: "/pokoje" });
}

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
