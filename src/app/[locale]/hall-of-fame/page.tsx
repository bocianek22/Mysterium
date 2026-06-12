import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { pageMeta } from "@/lib/seo";
import PageHero from "@/components/site/PageHero";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const locale = params.locale as Locale;
  const t = getDict(locale);
  return pageMeta({ locale, title: `${t.hall.title} — Mysterium`, description: t.hall.sub, path: "/hall-of-fame" });
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default async function HallOfFamePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const t = getDict(locale);
  const entries = await prisma.leaderboardEntry.findMany({ where: { published: true } });

  // grupowanie wg gry + sortowanie po (przypięcie, czas rosnąco)
  const total = (e: { timeMin: number; timeSec: number }) => e.timeMin * 60 + e.timeSec;
  const groups = new Map<string, typeof entries>();
  for (const e of entries) {
    const key = e.roomName || "—";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }
  for (const list of groups.values()) list.sort((a, b) => (b.order - a.order) || (total(a) - total(b)));

  const fmt = (e: { timeMin: number; timeSec: number }) => `${e.timeMin}:${String(e.timeSec).padStart(2, "0")}`;

  return (
    <>
      <PageHero label={t.hall.label} title={t.hall.title} subtitle={t.hall.sub} />
      <section className="px-6 md:px-[60px] pb-20 max-w-[900px] mx-auto">
        {entries.length === 0 ? (
          <p className="text-center" style={{ color: "var(--muted)" }}>{t.hall.empty}</p>
        ) : (
          <div className="flex flex-col gap-10">
            {Array.from(groups.entries()).map(([room, list]) => (
              <div key={room}>
                <h2 className="font-display text-gold-grad text-2xl mb-4">{room}</h2>
                <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
                  <table className="w-full text-sm" style={{ color: "var(--text)" }}>
                    <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
                      <th className="text-left font-serif text-[10px] tracking-[1px] uppercase px-4 py-3">{t.hall.rank}</th>
                      <th className="text-left font-serif text-[10px] tracking-[1px] uppercase px-4 py-3">{t.hall.team}</th>
                      <th className="text-left font-serif text-[10px] tracking-[1px] uppercase px-4 py-3">{t.hall.time}</th>
                      <th className="text-left font-serif text-[10px] tracking-[1px] uppercase px-4 py-3">{t.hall.players}</th>
                      <th className="text-left font-serif text-[10px] tracking-[1px] uppercase px-4 py-3"></th>
                    </tr></thead>
                    <tbody>
                      {list.map((e, i) => (
                        <tr key={e.id} style={{ borderTop: "1px solid var(--border)", background: i < 3 ? "rgba(201,168,76,.04)" : undefined }}>
                          <td className="px-4 py-3 font-display text-lg" style={{ color: "var(--gold)" }}>{MEDAL[i] || i + 1}</td>
                          <td className="px-4 py-3 font-semibold">{e.teamName}</td>
                          <td className="px-4 py-3 font-display" style={{ color: "var(--gold-l)" }}>{fmt(e)}</td>
                          <td className="px-4 py-3" style={{ color: "var(--muted)" }}>{e.players || "—"}</td>
                          <td className="px-4 py-3 text-[11px]" style={{ color: "var(--dim)" }}>{e.dateLabel || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
