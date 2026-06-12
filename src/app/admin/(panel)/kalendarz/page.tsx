import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, canReservations } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const MONTHS = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
const DOW = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const STATUS_COLOR: Record<string, string> = { NEW: "#e0b257", CONFIRMED: "#5fb0d8", DONE: "#7eebb0", CANCELLED: "#fca5a5" };

export default async function CalendarPage({ searchParams }: { searchParams: { y?: string; m?: string } }) {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canReservations(s.role)) redirect("/admin");

  const now = new Date();
  const year = Number(searchParams.y) || now.getFullYear();
  const month = searchParams.m !== undefined ? Number(searchParams.m) : now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);

  const [reservations, rooms] = await Promise.all([
    prisma.reservation.findMany({ where: { start: { gte: start, lt: end } }, orderBy: { start: "asc" } }),
    prisma.room.findMany({ select: { id: true, namePl: true } }),
  ]);
  const roomName = (id: string | null) => rooms.find((r) => r.id === id)?.namePl || "";

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (start.getDay() + 6) % 7; // poniedziałek = 0
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDay = (day: number) => reservations.filter((r) => new Date(r.start).getDate() === day);
  const prev = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };
  const todayD = now.getFullYear() === year && now.getMonth() === month ? now.getDate() : -1;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1 className="font-display text-gold-grad text-3xl flex items-center gap-3"><span>🗓️</span> Kalendarz</h1>
        <div className="flex items-center gap-3 ml-auto">
          <Link href={`/admin/kalendarz?y=${prev.y}&m=${prev.m}`} className="px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>‹</Link>
          <span className="font-display text-lg" style={{ color: "var(--gold)" }}>{MONTHS[month]} {year}</span>
          <Link href={`/admin/kalendarz?y=${next.y}&m=${next.m}`} className="px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>›</Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-[2px] mb-[2px]">
        {DOW.map((d) => <div key={d} className="text-center text-[11px] py-2 font-serif tracking-[1px]" style={{ color: "var(--muted)" }}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-[2px]">
        {cells.map((day, i) => (
          <div key={i} className="min-h-[96px] p-1.5 rounded" style={{ background: day ? "rgba(13,27,42,.5)" : "transparent", border: day ? "1px solid var(--border)" : "none" }}>
            {day && (
              <>
                <div className="text-[11px] mb-1 flex items-center justify-between">
                  <span style={{ color: day === todayD ? "var(--gold)" : "var(--dim)", fontWeight: day === todayD ? 700 : 400 }}>{day}</span>
                </div>
                <div className="flex flex-col gap-1">
                  {byDay(day).slice(0, 4).map((r) => (
                    <div key={r.id} className="text-[10px] px-1.5 py-1 rounded truncate" title={`${new Date(r.start).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })} ${r.title} · ${roomName(r.roomId)} · ${r.customerName}`} style={{ background: "rgba(0,0,0,.25)", borderLeft: `3px solid ${STATUS_COLOR[r.status] || "var(--gold)"}`, color: "var(--text)" }}>
                      {new Date(r.start).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })} {r.title}
                    </div>
                  ))}
                  {byDay(day).length > 4 && <div className="text-[10px]" style={{ color: "var(--muted)" }}>+{byDay(day).length - 4} więcej</div>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-5 flex-wrap text-[11px]" style={{ color: "var(--muted)" }}>
        {Object.entries({ NEW: "Nowe", CONFIRMED: "Potwierdzone", DONE: "Zrealizowane", CANCELLED: "Anulowane" }).map(([k, v]) => (
          <span key={k} className="flex items-center gap-2"><span style={{ width: 10, height: 10, borderRadius: 2, background: STATUS_COLOR[k], display: "inline-block" }} /> {v}</span>
        ))}
        <Link href="/admin/rezerwacje" className="ml-auto" style={{ color: "var(--gold)" }}>→ Lista rezerwacji</Link>
      </div>
    </div>
  );
}
