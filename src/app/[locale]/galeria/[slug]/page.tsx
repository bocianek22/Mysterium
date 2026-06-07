import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, getDict, pick, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";
import RoomGallery from "@/components/site/RoomGallery";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const album = await prisma.eventAlbum.findUnique({ where: { slug: params.slug } });
  if (!album) return {};
  const title = pick(album, "title", locale);
  return pageMeta({ locale, title: `${title} — Mysterium`, description: (pick(album, "desc", locale) || title).slice(0, 160), path: `/galeria/${album.slug}`, image: album.coverImage });
}

export default async function AlbumPage({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const album = await prisma.eventAlbum.findUnique({ where: { slug: params.slug } });
  if (!album || !album.published) notFound();

  const title = pick(album, "title", locale);
  const desc = pick(album, "desc", locale);
  let images: string[] = [];
  try { images = album.imagesJson ? JSON.parse(album.imagesJson) : []; if (!Array.isArray(images)) images = []; } catch { images = []; }
  if (album.coverImage && !images.includes(album.coverImage)) images = [album.coverImage, ...images];

  return (
    <>
      <PageHero label={album.dateLabel || t.realizations.label} title={title} subtitle={album.roomName || undefined} />
      <section className="px-6 md:px-[60px] pb-20 max-w-[1100px] mx-auto">
        {desc && <p className="text-center max-w-[680px] mx-auto mb-10 text-[16px] leading-[1.9]" style={{ color: "var(--muted)" }}>{desc}</p>}
        <RoomGallery images={images} />
        <div className="mt-12 text-center">
          <Link href={`/${locale}/galeria`} className="text-sm no-underline" style={{ color: "var(--gold)" }}>{t.realizations.back}</Link>
        </div>
      </section>
    </>
  );
}
