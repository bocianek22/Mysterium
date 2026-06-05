import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";
import Gallery from "@/components/site/Gallery";
import VideoSection from "@/components/site/VideoSection";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return pageMeta({ locale, title: t.gallery.title, description: locale === "pl" ? "Zdjęcia i filmy z naszych pokoi zagadek." : "Photos and videos from our escape rooms.", path: "/galeria" });
}

export default async function GalleryPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const [gallery, videos] = await Promise.all([
    prisma.galleryImage.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    prisma.video.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <PageHero label={t.gallery.label} title={t.gallery.title} subtitle={locale === "pl" ? "Zajrzyj do środka — zdjęcia i filmy z naszych pokoi." : "Take a look inside — photos and videos from our rooms."} />
      <Gallery locale={locale} t={t} images={gallery} />
      <VideoSection locale={locale} t={t} videos={videos} />
    </>
  );
}
