import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession, isManager } from "@/lib/auth";
import { monthRange } from "@/lib/earnings";
import { computePayroll } from "@/lib/payroll";
import CopyField from "@/components/admin/CopyField";
import EmployeeCosts from "@/components/admin/EmployeeCosts";
import TimesheetWidget from "@/components/admin/TimesheetWidget";

export const dynamic = "force-dynamic";

function baseUrl() {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}

export default async function Dashboard() {
  const session = await getSession();
  if (!session) return null;
  const now = new Date();
  const { start, end } = monthRange(now.getUTCFullYear(), now.getUTCMonth());

  if (isManager(session.role)) return <ManagerDashboard start={start} end={end} />;
  return <EmployeeDashboard userId={session.sub} start={start} end={end} />;
}

async function ManagerDashboard({ start, end }: { start: Date; end: Date }) {
  const [
    upcomingRes,
    monthRes,
    unread,
    rooms,
    employees,
    monthShifts,
  ] = await Promise.all([
    prisma.reservation.count({ where: { start: { gte: new Date() } } }),
    prisma.reservation.count({ where: { start: { gte: start, lt: end } } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.room.count(),
    prisma.user.count({ where: { role: "EMPLOYEE" } }),
    prisma.user.findMany({ where: { role: "EMPLOYEE" }, include: { timesheets: { where: { date: { gte: start, lt: end } } } } }),
  ]);

  let payHours = 0;
  let payBrutto = 0;
  for (const u of monthShifts) {
    const p = computePayroll(u.timesheets, u.ratesJson);
    payHours += p.totalHours;
    payBrutto += p.brutto;
  }

  const stats = [
    { label: "Nadchodzące rezerwacje", value: upcomingRes, icon: "📅", href: "/admin/rezerwacje" },
    { label: "Rezerwacje w tym miesiącu", value: monthRes, icon: "🗓️", href: "/admin/rezerwacje" },
    { label: "Godziny w tym miesiącu", value: payHours.toFixed(1), icon: "⏱️", href: "/admin/wyplaty" },
    { label: "Wypłaty brutto (ten mies.)", value: payBrutto.toFixed(2) + " zł", icon: "💵", href: "/admin/wyplaty" },
    { label: "Nieprzeczytane wiadomości", value: unread, icon: "✉️", href: "/admin/messages", badge: unread > 0 },
    { label: "Pracownicy", value: employees, icon: "👥", href: "/admin/users" },
    { label: "Pokoje", value: rooms, icon: "🚪", href: "/admin/rooms" },
  ];

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2">Pulpit</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        Przegląd działalności Mysterium.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="relative p-6 rounded transition-all hover:-translate-y-1 no-underline" style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}>
            <div className="text-2xl mb-3">{s.icon}</div>
            <div className="font-display text-3xl" style={{ color: "var(--gold)" }}>{s.value}</div>
            <div className="font-serif text-[11px] tracking-[1px] uppercase mt-1" style={{ color: "var(--muted)" }}>{s.label}</div>
            {s.badge && <span className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />}
          </Link>
        ))}
      </div>
    </div>
  );
}

async function EmployeeDashboard({ userId, start, end }: { userId: string; start: Date; end: Date }) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const monthShifts = await prisma.shift.findMany({
    where: { userId, start: { gte: start, lt: end } },
    orderBy: { start: "asc" },
  });
  const upcoming = await prisma.shift.findMany({
    where: { userId, start: { gte: new Date() } },
    orderBy: { start: "asc" },
    take: 5,
  });
  const timesheets = await prisma.dailyTimesheet.findMany({ where: { userId, date: { gte: start, lt: end } } });
  const pay = computePayroll(timesheets, user.ratesJson);
  const openClock = await prisma.clockEntry.findFirst({ where: { userId, clockOut: null }, orderBy: { clockIn: "desc" } });
  const icalUrl = `${baseUrl()}/api/calendar/${user.calendarToken}`;

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2">Witaj, {user.name || "Pracowniku"}!</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>Twój grafik i wynagrodzenie.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Godziny (ten miesiąc)", value: pay.totalHours.toFixed(1) },
          { label: "Netto (szac.)", value: pay.net.toFixed(2) + " zł" },
          { label: "Brutto (szac.)", value: pay.brutto.toFixed(2) + " zł" },
          { label: "Nadchodzące zmiany", value: upcoming.length },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded" style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}>
            <div className="font-display text-2xl" style={{ color: "var(--gold)" }}>{s.value}</div>
            <div className="font-serif text-[10px] tracking-[1px] uppercase mt-1" style={{ color: "var(--muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 p-4 rounded flex items-center justify-between flex-wrap gap-3" style={{ background: openClock ? "rgba(126,235,176,.08)" : "rgba(13,27,42,.6)", border: `1px solid ${openClock ? "rgba(126,235,176,.3)" : "var(--border)"}` }}>
        <span className="text-sm flex items-center gap-2" style={{ color: "var(--text)" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: openClock ? "#7eebb0" : "var(--dim)", boxShadow: openClock ? "0 0 8px #7eebb0" : "none" }} />
          {openClock
            ? <>W pracy od <b style={{ color: "var(--gold)" }}>{new Date(openClock.clockIn).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</b></>
            : <span style={{ color: "var(--muted)" }}>Aktualnie poza pracą</span>}
        </span>
        <Link href="/admin/clock" className="text-xs px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>⏱️ Zegar pracy →</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>Najbliższe zmiany</h2>
          {upcoming.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--muted)" }}>Brak zaplanowanych zmian.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((s) => (
                <li key={s.id} className="text-sm flex justify-between" style={{ color: "var(--text)" }}>
                  <span>{new Date(s.start).toLocaleString("pl-PL", { weekday: "short", day: "2-digit", month: "2-digit" })}</span>
                  <span style={{ color: "var(--muted)" }}>
                    {new Date(s.start).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}–
                    {new Date(s.end).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/grafik" className="inline-block mt-4 text-xs" style={{ color: "var(--gold)" }}>Zobacz pełny grafik →</Link>
        </div>

        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>Kalendarz Google</h2>
          <p className="text-xs mb-2" style={{ color: "var(--muted)" }}>
            Dodaj swój grafik do Google Calendar — skopiuj link i w Google: „Inne kalendarze → Z adresu URL".
          </p>
          <CopyField value={icalUrl} />
        </div>
      </div>

      <TimesheetWidget />
      <EmployeeCosts />

      {user.calendarEmbed && (
        <div className="mt-6 p-3 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <iframe src={user.calendarEmbed} className="w-full rounded" style={{ height: 500, border: 0 }} title="Kalendarz" />
        </div>
      )}
    </div>
  );
}
