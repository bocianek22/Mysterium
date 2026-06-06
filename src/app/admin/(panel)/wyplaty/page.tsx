import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isManager, isOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shiftBreakdown, sumBreakdowns, monthRange } from "@/lib/earnings";

export const dynamic = "force-dynamic";

const MONTHS = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];

export default async function WyplatyPage({
  searchParams,
}: {
  searchParams: { y?: string; m?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!isManager(session.role)) redirect("/admin");

  const now = new Date();
  const year = Number(searchParams.y) || now.getUTCFullYear();
  const month = searchParams.m !== undefined ? Number(searchParams.m) : now.getUTCMonth();
  const { start, end } = monthRange(year, month);

  const users = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    include: { shifts: { where: { start: { gte: start, lt: end } } } },
    orderBy: { name: "asc" },
  });

  const rows = users.map((u) => {
    const b = sumBreakdowns(
      u.shifts.map((s) => shiftBreakdown(s.start, s.end, { rateDay: u.rateDay, rateNight: u.rateNight, rateWeekend: u.rateWeekend }))
    );
    return { user: u, b, shifts: u.shifts.length };
  });
  const grand = sumBreakdowns(rows.map((r) => r.b));

  const prev = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>💵</span> Wypłaty</h1>
        {isOwner(session.role) && (
          <a href={`/api/admin/export/payroll?y=${year}&m=${month}`} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>⬇ Eksport CSV</a>
        )}
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Wynagrodzenie liczone z grafiku: godziny dzienne, nocne (22–6) i weekendowe × stawki pracownika.
      </p>

      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/wyplaty?y=${prev.y}&m=${prev.m}`} className="px-3 py-1 rounded text-sm" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>‹</Link>
        <span className="font-display text-xl" style={{ color: "var(--gold)" }}>{MONTHS[month]} {year}</span>
        <Link href={`/admin/wyplaty?y=${next.y}&m=${next.m}`} className="px-3 py-1 rounded text-sm" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>›</Link>
      </div>

      {rows.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Brak pracowników. Dodaj ich w zakładce Pracownicy.</p>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead>
              <tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
                {["Pracownik", "Zmiany", "Dzień (h)", "Noc (h)", "Wknd (h)", "Razem (h)", "Do wypłaty"].map((h) => (
                  <th key={h} className="text-left font-serif text-[10px] tracking-[1px] uppercase px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-4 py-3">{r.user.name || r.user.email}</td>
                  <td className="px-4 py-3">{r.shifts}</td>
                  <td className="px-4 py-3">{r.b.dayHours.toFixed(1)}</td>
                  <td className="px-4 py-3">{r.b.nightHours.toFixed(1)}</td>
                  <td className="px-4 py-3">{r.b.weekendHours.toFixed(1)}</td>
                  <td className="px-4 py-3">{r.b.totalHours.toFixed(1)}</td>
                  <td className="px-4 py-3 font-display" style={{ color: "var(--gold)" }}>{r.b.pay.toFixed(2)} zł</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid var(--border-h)", background: "rgba(201,168,76,.04)" }}>
                <td className="px-4 py-3 font-serif uppercase text-[11px] tracking-[1px]" style={{ color: "var(--gold)" }}>Razem</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3">{grand.dayHours.toFixed(1)}</td>
                <td className="px-4 py-3">{grand.nightHours.toFixed(1)}</td>
                <td className="px-4 py-3">{grand.weekendHours.toFixed(1)}</td>
                <td className="px-4 py-3">{grand.totalHours.toFixed(1)}</td>
                <td className="px-4 py-3 font-display" style={{ color: "var(--gold)" }}>{grand.pay.toFixed(2)} zł</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
