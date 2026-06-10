import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isLocale, getDict, pick, type Locale } from "@/lib/i18n";
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
  const [gallery, videos, albums] = await Promise.all([
    prisma.galleryImage.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    prisma.video.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    prisma.eventAlbum.findMany({ where: { published: true }, orderBy: [{ order: "desc" }, { createdAt: "desc" }] }),
  ]);

  return (
    <>
      <PageHero label={t.gallery.label} title={t.gallery.title} subtitle={locale === "pl" ? "Zajrzyj do środka — zdjęcia i filmy z naszych pokoi." : "Take a look inside — photos and videos from our rooms."} />
      <Gallery locale={locale} t={t} images={gallery} />
      <VideoSection locale={locale} t={t} videos={videos} />

      {albums.length > 0 && (
        <section className="px-6 md:px-[60px] py-16 max-w-[1100px] mx-auto">
          <div className="text-center mb-10">
            <div className="font-serif text-[11px] tracking-[5px] uppercase mb-3" style={{ color: "var(--gold)" }}>{t.realizations.label}</div>
            <h2 className="font-display text-gold-grad" style={{ fontSize: "clamp(26px,4vw,40px)" }}>{t.realizations.title}</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>{t.realizations.sub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((a) => {
              const title = pick(a, "title", locale);
              return (
                <Link key={a.id} href={`/${locale}/galeria/${a.slug}`} className="group no-underline rounded overflow-hidden flex flex-col transition-all hover:-translate-y-1" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
                  <div className="relative aspect-[16/10] overflow-hidden" style={{ background: "var(--navy-d)" }}>
                    {a.coverImage ? (
                      <Image src={a.coverImage} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: "var(--dim)" }}>📸</div>}
                  </div>
                  <div className="p-5">
                    {a.dateLabel && <div className="font-serif text-[10px] tracking-[2px] uppercase mb-1" style={{ color: "var(--gold)" }}>{a.dateLabel}</div>}
                    <h3 className="font-display text-lg" style={{ color: "var(--text)" }}>{title}</h3>
                    {a.roomName && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{a.roomName}</p>}
                    <span className="mt-3 inline-block text-xs" style={{ color: "var(--gold-l)" }}>{t.realizations.see}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="px-6 md:px-[60px] pb-20 max-w-[1100px] mx-auto">
        <Link href={`/${locale}/hall-of-fame`} className="block text-center p-8 rounded no-underline transition-all hover:-translate-y-1" style={{ background: "linear-gradient(135deg,rgba(201,168,76,.1),rgba(13,27,42,.6))", border: "1px solid var(--border)" }}>
          <div className="text-3xl mb-2">🏆</div>
          <div className="font-display text-gold-grad text-2xl">{t.hall.title}</div>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>{t.hall.sub}</p>
          <span className="mt-4 inline-block text-sm" style={{ color: "var(--gold)" }}>{t.hall.cta}</span>
        </Link>
      </section>
    </>
  );
}
