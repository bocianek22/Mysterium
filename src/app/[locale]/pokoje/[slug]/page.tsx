import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, getDict, pick, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import RoomGallery from "@/components/site/RoomGallery";
import PriceTable from "@/components/site/PriceTable";
import RoomDecor from "@/components/site/RoomDecor";
import EmbedHtml from "@/components/site/EmbedHtml";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const room = await prisma.room.findUnique({ where: { slug: params.slug } });
  if (!room) return {};
  const name = pick(room, "name", locale);
  const desc = (pick(room, "tagline", locale) || pick(room, "description", locale) || name).slice(0, 160);
  return pageMeta({ locale, title: name, description: desc, path: `/pokoje/${room.slug}`, image: room.image });
}

export default async function RoomDetail({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const room = await prisma.room.findUnique({ where: { slug: params.slug } });
  if (!room || !room.published) notFound();

  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const name = pick(room, "name", locale);
  const tagline = pick(room, "tagline", locale);
  const description = pick(room, "description", locale);
  const badge = pick(room, "badge", locale);
  const difficulty = pick(room, "difficulty", locale);

  let images: string[] = [];
  try {
    images = room.imagesJson ? JSON.parse(room.imagesJson) : [];
    if (!Array.isArray(images)) images = [];
  } catch {
    images = [];
  }
  const bookHref = room.bookingUrl || settings?.lockmeUrl || `/${locale}/rezerwacja`;
  const theme = (room as { theme?: string }).theme || "default";
  const themed = theme !== "default";
  const sectionBg = "var(--navy-dd)"; // paleta motywu nadaje kolor sekcjom
  // Tło nagłówka = media właściciela: wideo (mp4/webm) > zdjęcie/GIF > zdjęcie główne
  const heroVideo = (room as { heroVideo?: string }).heroVideo || null;
  const heroImgUrl = (room as { heroImage?: string }).heroImage || room.image || null;

  return (
    <article className={`room-theme theme-${theme}`}>
      {/* HERO pokoju */}
      <section className="relative overflow-hidden pt-[140px] pb-16 px-6 md:px-[60px]">
        {heroVideo ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay loop muted playsInline
            poster={heroImgUrl || undefined}
          >
            <source src={heroVideo} />
          </video>
        ) : heroImgUrl ? (
          <div className="absolute inset-0" style={{ backgroundImage: `url(${heroImgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        ) : (
          // Brak mediów → wygląd jak domyślny motyw strony (klimatyczny gradient)
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 35%,rgba(13,61,58,.4),transparent 70%),radial-gradient(ellipse 50% 40% at 85% 15%,rgba(201,168,76,.06),transparent 60%),linear-gradient(180deg,var(--navy-dd),var(--navy-d))" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,var(--navy-dd) 5%,rgba(4,12,20,.8) 50%,rgba(4,12,20,.7))" }} />
        {themed && <div className="absolute inset-0" style={{ background: "var(--hero-veil)" }} />}
        {themed && <div className="room-fx" aria-hidden="true" />}
        {themed && <RoomDecor theme={theme} />}
        <div className="relative z-[1] max-w-[1000px] mx-auto">
          <Link href={`/${locale}/pokoje`} className="font-serif text-[11px] tracking-[2px] uppercase no-underline" style={{ color: "var(--gold)" }}>
            {t.common.backToRooms}
          </Link>
          <div className="mt-4 mb-3">
            <span className="font-serif text-[9px] tracking-[3px] uppercase px-3 py-[3px]" style={{ border: "1px solid rgba(201,168,76,.5)", color: "var(--gold)", background: "rgba(201,168,76,.08)" }}>{badge}</span>
          </div>
          <h1 className="font-display text-gold-grad shimmer font-bold mb-3" style={{ fontSize: "clamp(36px,6vw,64px)", lineHeight: 1.05 }}>{name}</h1>
          {tagline && <p className="text-lg max-w-[640px]" style={{ color: "var(--muted)" }}>{tagline}</p>}
          <div className="flex gap-5 flex-wrap mt-6">
            <span className="font-serif text-[11px] tracking-[1px] flex items-center gap-2" style={{ color: "var(--gold)" }}>⏱ {room.durationMin} {t.rooms.min}</span>
            <span className="font-serif text-[11px] tracking-[1px] flex items-center gap-2" style={{ color: "var(--gold)" }}>👥 {room.minPlayers}–{room.maxPlayers} {t.rooms.people}</span>
            <span className="font-serif text-[11px] tracking-[1px] flex items-center gap-2" style={{ color: "var(--gold)" }}>⚡ {difficulty}</span>
          </div>
          <div className="mt-8">
            <a href={bookHref} target={room.bookingUrl ? "_blank" : undefined} rel="noopener noreferrer" className="btn-gold">{t.common.bookThisRoom}</a>
          </div>
        </div>
      </section>

      {/* Opis + cennik */}
      {(description || room.pricingJson) && (
        <section className="px-6 md:px-[60px] py-12 md:py-16 relative z-[1]" style={{ background: sectionBg }}>
          <div className="max-w-[760px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="reveal">
              {(description || "").split(/\n{2,}/).filter(Boolean).map((p, i) => (
                <p key={i} className="text-[15px] md:text-base leading-[1.95] mb-4" style={{ color: "var(--muted)" }}>{p}</p>
              ))}
            </div>
            <PriceTable locale={locale} json={room.pricingJson} title={t.pricing.label} />
          </div>
        </section>
      )}

      {/* Galeria pokoju */}
      {images.length > 0 && (
        <section className="px-6 md:px-[60px] pb-16 relative z-[1]" style={{ background: sectionBg }}>
          <div className="max-w-[1100px] mx-auto">
            <div className="sec-label reveal">{t.gallery.label}</div>
            <div className="sec-divider reveal" />
            <RoomGallery images={images} />
          </div>
        </section>
      )}

      {/* Opinie z Lockme */}
      {room.reviewsEmbed && room.reviewsEmbed.trim() && (
        <section className="px-6 md:px-[60px] pb-16 relative z-[1]" style={{ background: sectionBg }}>
          <div className="max-w-[1000px] mx-auto">
            <div className="sec-label reveal">{locale === "pl" ? "Opinie graczy" : "Player reviews"}</div>
            <div className="sec-divider reveal" />
            <div className="reveal"><EmbedHtml html={room.reviewsEmbed} /></div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 md:px-[60px] py-16 relative z-[1] aurora text-center" style={{ background: "linear-gradient(135deg,var(--teal-m),var(--navy-dd))" }}>
        <div className="relative z-[1]">
          <a href={bookHref} target={room.bookingUrl ? "_blank" : undefined} rel="noopener noreferrer" className="btn-gold">{t.common.bookThisRoom}</a>
        </div>
      </section>
    </article>
  );
}
