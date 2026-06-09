import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isLocale, getDict, pick, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import { freeSlots, parseHours } from "@/lib/slots";
import PageHero from "@/components/site/PageHero";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  return pageMeta({ locale, title: locale === "pl" ? "Wolne terminy" : "Available times", description: locale === "pl" ? "Sprawdź najbliższe wolne terminy gier w Mysterium." : "Check the nearest available game times at Mysterium.", path: "/terminy" });
}

export default async function SlotsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const pl = locale === "pl";

  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings?.slotsEnabled) redirect(`/${locale}/rezerwacja`);

  const hours = parseHours(settings.openHoursJson);
  const step = settings.slotStepMin || 90;
  const now = new Date();
  const horizon = new Date(now.getTime() + 11 * 86400000);

  const [rooms, reservations] = await Promise.all([
    prisma.room.findMany({ where: { published: true, status: "ACTIVE" }, orderBy: { order: "asc" } }),
    prisma.reservation.findMany({ where: { start: { gte: now, lt: horizon }, status: { not: "CANCELLED" } }, select: { start: true, roomId: true } }),
  ]);

  const bookHref = settings?.lockmeUrl || `/${locale}/rezerwacja`;

  const perRoom = rooms.map((r) => {
    const starts = reservations.filter((x) => x.roomId === r.id).map((x) => x.start);
    return { room: r, slots: freeSlots(starts, hours, { stepMin: step, daysAhead: 11, limit: 8 }) };
  });

  return (
    <>
      <PageHero label={pl ? "Rezerwacja" : "Booking"} title={pl ? "Wolne terminy" : "Available times"} subtitle={pl ? "Najbliższe wolne godziny gier. Kliknij, aby zarezerwować." : "Nearest available game times. Click to book."} />
      <section className="px-6 md:px-[60px] py-12 md:py-16 relative z-[1]" style={{ background: "var(--navy-dd)" }}>
        <div className="max-w-[1000px] mx-auto flex flex-col gap-6">
          {perRoom.map(({ room, slots }) => (
            <div key={room.id} className="p-5 rounded reveal" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <h2 className="font-display text-gold-grad text-xl">{pick(room, "name", locale)}</h2>
                <a href={`/${locale}/pokoje/${room.slug}`} className="text-xs no-underline" style={{ color: "var(--gold)" }}>{pl ? "Szczegóły" : "Details"} →</a>
              </div>
              {slots.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--muted)" }}>{pl ? "Brak wolnych terminów w najbliższych dniach — napisz do nas, dobierzemy termin." : "No free slots in the coming days — contact us."}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((s, i) => (
                    <a key={i} href={bookHref} target={settings?.lockmeUrl ? "_blank" : undefined} rel="noopener noreferrer" className="no-underline px-3 py-2 rounded text-sm transition-all" style={{ border: "1px solid var(--border)", color: "var(--text)", background: "rgba(201,168,76,.05)" }}>
                      <span style={{ color: "var(--muted)" }}>{s.dateLabel}</span> · <b style={{ color: "var(--gold)" }}>{s.time}</b>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="text-center mt-4">
            <a href={bookHref} target={settings?.lockmeUrl ? "_blank" : undefined} rel="noopener noreferrer" className="btn-gold">{t.hero.bookNow}</a>
          </div>
          <p className="text-[11px] text-center" style={{ color: "var(--dim)" }}>{pl ? "Terminy orientacyjne — ostateczna dostępność potwierdzana przy rezerwacji." : "Times are indicative — final availability is confirmed at booking."}</p>
        </div>
      </section>
    </>
  );
}
