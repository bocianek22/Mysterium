import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { entryHours } from "@/lib/clock";
import ClockAction from "@/components/admin/ClockAction";

export const dynamic = "force-dynamic";

export default async function ClockPage({ searchParams }: { searchParams: { t?: string } }) {
  const s = await getSession();
  if (!s) redirect("/admin/login");

  const open = await prisma.clockEntry.findFirst({
    where: { userId: s.sub, clockOut: null },
    orderBy: { clockIn: "desc" },
  });

  // ostatnie wpisy pracownika (do podglądu)
  const recent = await prisma.clockEntry.findMany({
    where: { userId: s.sub, clockOut: { not: null } },
    orderBy: { clockIn: "desc" },
    take: 6,
  });

  const dt = (d: Date) => new Date(d).toLocaleString("pl-PL", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const time = (d: Date) => new Date(d).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-display text-gold-grad text-3xl mb-1 flex items-center gap-3"><span>⏱️</span> Zegar pracy</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>{s.name || s.email}</p>

      <div className="p-5 rounded mb-5" style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}>
        {open ? (
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 rounded-full" style={{ background: "#7eebb0", boxShadow: "0 0 10px #7eebb0" }} />
            <span className="text-sm" style={{ color: "var(--text)" }}>
              W pracy od <b style={{ color: "var(--gold)" }}>{time(open.clockIn)}</b>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-4">
            <span className="w-3 h-3 rounded-full" style={{ background: "var(--dim)" }} />
            <span className="text-sm" style={{ color: "var(--muted)" }}>Poza pracą</span>
          </div>
        )}
        <ClockAction token={searchParams.t} open={!!open} />
      </div>

      {recent.length > 0 && (
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-xs tracking-[2px] uppercase mb-3" style={{ color: "var(--gold)" }}>Ostatnie rejestracje</h2>
          <ul className="flex flex-col gap-2">
            {recent.map((e) => (
              <li key={e.id} className="text-[12px] flex justify-between" style={{ color: "var(--muted)" }}>
                <span>{dt(e.clockIn)}</span>
                <span>{time(e.clockIn)}–{time(e.clockOut!)} · <b style={{ color: "var(--text)" }}>{entryHours(e.clockIn, e.clockOut).toFixed(2)} h</b></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
