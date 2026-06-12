import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, pick, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";
import RoomsExplorer, { type ExplorerRoom } from "@/components/site/RoomsExplorer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return pageMeta({ locale, title: t.rooms.title, description: locale === "pl" ? "Nasze pokoje zagadek w Nowym Dworze Mazowieckim — wybierz misję dla swojej grupy." : "Our escape rooms in Nowy Dwór Mazowiecki — choose a mission for your group.", path: "/pokoje" });
}

function priceFrom(json?: string | null): number | null {
  try {
    const a = json ? JSON.parse(json) : null;
    if (Array.isArray(a) && a.length) {
      const prices = a.map((z: any) => Number(z.price)).filter((n: number) => n > 0);
      if (prices.length) return Math.min(...prices);
    }
  } catch {}
  return null;
}

export default async function RoomsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const rooms = await prisma.room.findMany({ where: { published: true }, orderBy: { order: "asc" } });

  const data: ExplorerRoom[] = rooms.map((r) => ({
    id: r.id, slug: r.slug, name: pick(r, "name", locale), tagline: pick(r, "tagline", locale) || "",
    image: r.image, minPlayers: r.minPlayers, maxPlayers: r.maxPlayers, durationMin: r.durationMin,
    difficulty: pick(r, "difficulty", locale), badge: pick(r, "badge", locale),
    featured: (r as { featured?: boolean }).featured ?? false, priceFrom: priceFrom(r.pricingJson),
  }));

  return (
    <>
      <PageHero
        label={t.rooms.label}
        title={t.rooms.title}
        subtitle={locale === "pl" ? "Wybierz pokój i rozpocznij swoją przygodę. Filtruj, porównuj i kliknij po szczegóły." : "Pick a room and start your adventure. Filter, compare and click for details."}
      />
      <RoomsExplorer locale={locale} rooms={data} bookBase={`/${locale}/pokoje`} />
    </>
  );
}
