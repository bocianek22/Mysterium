import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale, getDict, pick, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import RoomGallery from "@/components/site/RoomGallery";
import QuoteForm from "@/components/site/QuoteForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string; slug: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const offer = await prisma.mobileOffer.findUnique({ where: { slug: params.slug } });
  if (!offer) return {};
  const name = pick(offer, "name", locale);
  const desc = (pick(offer, "tagline", locale) || pick(offer, "description", locale) || name).slice(0, 160);
  return pageMeta({ locale, title: name, description: desc, path: `/mobilna/${offer.slug}`, image: offer.image });
}

function parseJson<T>(s: string | null | undefined, fb: T): T {
  try { const v = s ? JSON.parse(s) : fb; return Array.isArray(v) || typeof v === "object" ? v : fb; } catch { return fb; }
}

export default async function MobileDetail({ params }: { params: { locale: string; slug: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const offer = await prisma.mobileOffer.findUnique({ where: { slug: params.slug } });
  if (!offer || !offer.published) notFound();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const whatsapp = settings?.whatsapp || "48571080192";

  const name = pick(offer, "name", locale);
  const tagline = pick(offer, "tagline", locale);
  const description = pick(offer, "description", locale);
  const badge = pick(offer, "badge", locale);
  const priceInfo = pick(offer, "priceInfo", locale);
  const area = pick(offer, "area", locale);
  const requirements = pick(offer, "requirements", locale);
  const occasions = pick(offer, "occasions", locale).split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  const images: string[] = parseJson(offer.imagesJson, []);
  const zones: { labelPl: string; labelEn: string; price: string }[] = parseJson(offer.travelZonesJson, []);

  return (
    <article>
      {/* HERO */}
      <section className="relative overflow-hidden pt-[140px] pb-14 px-6 md:px-[60px]">
        {offer.image ? (
          <>
            <div className="absolute inset-0" style={{ backgroundImage: `url(${offer.image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(0deg,var(--navy-dd) 5%,rgba(4,12,20,.8) 50%,rgba(4,12,20,.7))" }} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(13,61,58,.45),transparent 70%),var(--navy-dd)" }} />
        )}
        <div className="relative z-[1] max-w-[1000px] mx-auto">
          <Link href={`/${locale}/mobilna`} className="font-serif text-[11px] tracking-[2px] uppercase no-underline" style={{ color: "var(--gold)" }}>← {t.mobile.label}</Link>
          <div className="mt-4 mb-3"><span className="font-serif text-[9px] tracking-[3px] uppercase px-3 py-[3px]" style={{ border: "1px solid rgba(125,211,208,.4)", color: "#7dd3d0", background: "rgba(13,61,58,.3)" }}>{badge}</span></div>
          <h1 className="font-display text-gold-grad shimmer font-bold mb-3" style={{ fontSize: "clamp(36px,6vw,64px)", lineHeight: 1.05 }}>{name}</h1>
          {tagline && <p className="text-lg max-w-[640px]" style={{ color: "var(--muted)" }}>{tagline}</p>}
          <div className="flex gap-5 flex-wrap mt-6">
            <span className="font-serif text-[11px] tracking-[1px] flex items-center gap-2" style={{ color: "var(--gold)" }}>⏱ {offer.durationMin} {t.rooms.min}</span>
            <span className="font-serif text-[11px] tracking-[1px] flex items-center gap-2" style={{ color: "var(--gold)" }}>👥 {offer.minPlayers}–{offer.maxPlayers} {t.rooms.people}</span>
            {priceInfo && <span className="font-serif text-[11px] tracking-[1px] flex items-center gap-2" style={{ color: "var(--gold)" }}>💰 {t.mobile.gamePrice}: {priceInfo}</span>}
          </div>
          <div className="mt-8"><a href="#wycena" className="btn-gold">{t.mobile.quoteTitle}</a></div>
        </div>
      </section>

      {/* Opis + dla kogo */}
      <section className="px-6 md:px-[60px] py-12 md:py-16 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10">
          <div className="reveal">
            {description && description.split(/\n{2,}/).filter(Boolean).map((p, i) => (
              <p key={i} className="text-[15px] md:text-base leading-[1.95] mb-4" style={{ color: "var(--muted)" }}>{p}</p>
            ))}
          </div>
          {occasions.length > 0 && (
            <div className="reveal reveal-right">
              <div className="sec-label">{t.mobile.forWhom}</div>
              <ul className="flex flex-col gap-2 mt-3">
                {occasions.map((o, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm py-2 px-3 rounded" style={{ background: "rgba(201,168,76,.05)", border: "1px solid var(--border)", color: "var(--text)" }}>
                    <span style={{ color: "var(--gold)" }}>◆</span> {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Cennik dojazdu + obszar + wymagania */}
      {(zones.length > 0 || area || requirements) && (
        <section className="px-6 md:px-[60px] py-12 md:py-16 relative z-[1] aurora" style={{ background: "linear-gradient(135deg,var(--teal-m),var(--navy-dd))" }}>
          <div className="relative z-[1] max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {zones.length > 0 && (
              <div className="reveal">
                <div className="sec-label">{t.mobile.travel}</div>
                <div className="mt-3 rounded overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  {zones.map((z, i) => (
                    <div key={i} className="flex justify-between px-4 py-3 text-sm" style={{ background: i % 2 ? "rgba(13,27,42,.4)" : "rgba(13,27,42,.7)", color: "var(--text)" }}>
                      <span>{(locale === "pl" ? z.labelPl : z.labelEn) || z.labelPl}</span>
                      <span className="font-display" style={{ color: "var(--gold)" }}>{z.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-6">
              {area && (
                <div className="reveal reveal-d1">
                  <div className="sec-label">📍 {t.mobile.area}</div>
                  <p className="text-sm leading-[1.8] mt-2" style={{ color: "var(--muted)" }}>{area}</p>
                </div>
              )}
              {requirements && (
                <div className="reveal reveal-d2">
                  <div className="sec-label">🔌 {t.mobile.requirements}</div>
                  <p className="text-sm leading-[1.8] mt-2" style={{ color: "var(--muted)" }}>{requirements}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Galeria */}
      {images.length > 0 && (
        <section className="px-6 md:px-[60px] py-12 md:py-16 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
          <div className="max-w-[1100px] mx-auto">
            <div className="sec-label reveal">{t.gallery.label}</div>
            <div className="sec-divider reveal" />
            <RoomGallery images={images} />
          </div>
        </section>
      )}

      {/* Wycena */}
      <section id="wycena" className="px-6 md:px-[60px] py-16 md:py-20 relative z-[1]" style={{ background: "linear-gradient(135deg,var(--teal-m) 0%,var(--navy-dd) 100%)" }}>
        <div className="max-w-[640px] mx-auto reveal reveal-scale">
          <QuoteForm t={t} offerName={name} whatsapp={whatsapp} />
        </div>
      </section>
    </article>
  );
}
