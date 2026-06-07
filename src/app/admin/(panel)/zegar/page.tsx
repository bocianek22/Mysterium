import { redirect } from "next/navigation";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthRange } from "@/lib/payroll";
import { entryHours, paidBreakMinutes, fmtHours } from "@/lib/clock";
import ClockQR from "@/components/admin/ClockQR";

export const dynamic = "force-dynamic";
const MONTHS = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];

export default async function ZegarPage() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!isManager(s.role)) redirect("/admin");

  const now = new Date();
  const { start, end } = monthRange(now.getUTCFullYear(), now.getUTCMonth());

  const [openNow, monthEntries, recent] = await Promise.all([
    prisma.clockEntry.findMany({
      where: { clockOut: null },
      orderBy: { clockIn: "asc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.clockEntry.findMany({
      where: { clockIn: { gte: start, lt: end }, clockOut: { not: null } },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.clockEntry.findMany({
      where: { clockOut: { not: null } },
      orderBy: { clockIn: "desc" },
      take: 15,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  // suma rzeczywistych godzin (RCP) per pracownik w tym miesiącu
  const byUser = new Map<string, { name: string; hours: number; days: number }>();
  for (const e of monthEntries) {
    const key = e.user.id;
    const cur = byUser.get(key) || { name: e.user.name || e.user.email, hours: 0, days: 0 };
    cur.hours += entryHours(e.clockIn, e.clockOut);
    cur.days += 1;
    byUser.set(key, cur);
  }
  const rows = Array.from(byUser.values()).sort((a, b) => b.hours - a.hours);

  const dt = (d: Date) => new Date(d).toLocaleDateString("pl-PL", { weekday: "short", day: "2-digit", month: "2-digit" });
  const time = (d: Date) => new Date(d).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>⏱️</span> Zegar (RCP)</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Rejestracja czasu pracy przez kod QR. Rzeczywiste godziny wejścia/wyjścia — do porównania z grafikiem i dokładniejszych wypłat.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
        <div className="flex flex-col gap-3">
          <ClockQR />
          <a href="/admin/kod" target="_blank" className="text-xs text-center px-4 py-2 rounded no-underline" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>
            🖥️ Otwórz tryb kiosk (osobny ekran / tablet)
          </a>
          <p className="text-[11px]" style={{ color: "var(--dim)" }}>
            Tryb kodu (statyczny/dynamiczny) ustawisz w <a href="/admin/settings" style={{ color: "var(--gold)" }}>Ustawieniach → Zegar (RCP)</a>. Dla tabletu przy wejściu utwórz konto z rolą „Kod" w <a href="/admin/users" style={{ color: "var(--gold)" }}>Pracownikach</a>.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Obecni w pracy teraz */}
          <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
            <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>W pracy teraz ({openNow.length})</h2>
            {openNow.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>Nikt nie jest aktualnie zarejestrowany.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {openNow.map((e) => (
                  <li key={e.id} className="text-sm flex justify-between items-center" style={{ color: "var(--text)" }}>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: "#7eebb0", boxShadow: "0 0 8px #7eebb0" }} />
                      {e.user.name || e.user.email}
                    </span>
                    <span style={{ color: "var(--muted)" }}>od {time(e.clockIn)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Suma godzin RCP w tym miesiącu */}
          <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
            <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>Rzeczywiste godziny — {MONTHS[now.getUTCMonth()]} {now.getUTCFullYear()}</h2>
            {rows.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>Brak zarejestrowanych wyjść w tym miesiącu.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {rows.map((r) => (
                  <li key={r.name} className="text-sm flex justify-between" style={{ color: "var(--text)" }}>
                    <span>{r.name} <span style={{ color: "var(--dim)" }}>· {r.days} dni</span></span>
                    <span><b style={{ color: "var(--gold)" }}>{r.hours.toFixed(2)} h</b> <span style={{ color: "var(--dim)" }}>(przerwa {paidBreakMinutes(r.hours / Math.max(1, r.days))} min/dz.)</span></span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Ostatnie rejestracje */}
      <div className="mt-6 p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>Ostatnie rejestracje</h2>
        {recent.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--muted)" }}>Brak rejestracji.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ color: "var(--text)" }}>
              <thead>
                <tr style={{ color: "var(--muted)" }}>
                  <th className="text-left font-serif text-[10px] tracking-[1px] uppercase py-2">Pracownik</th>
                  <th className="text-left font-serif text-[10px] tracking-[1px] uppercase py-2">Dzień</th>
                  <th className="text-left font-serif text-[10px] tracking-[1px] uppercase py-2">Wejście–wyjście</th>
                  <th className="text-left font-serif text-[10px] tracking-[1px] uppercase py-2">Czas</th>
                  <th className="text-left font-serif text-[10px] tracking-[1px] uppercase py-2">Przerwa</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((e) => {
                  const h = entryHours(e.clockIn, e.clockOut);
                  return (
                    <tr key={e.id} style={{ borderTop: "1px solid var(--border)" }}>
                      <td className="py-2">{e.user.name || e.user.email}</td>
                      <td className="py-2" style={{ color: "var(--muted)" }}>{dt(e.clockIn)}</td>
                      <td className="py-2" style={{ color: "var(--muted)" }}>{time(e.clockIn)}–{time(e.clockOut!)}</td>
                      <td className="py-2"><b style={{ color: "var(--gold)" }}>{fmtHours(h)}</b></td>
                      <td className="py-2" style={{ color: "var(--muted)" }}>{paidBreakMinutes(h)} min</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
