import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, canFinance } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computePayroll, monthRange } from "@/lib/payroll";
import { WORK_CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";
const MONTHS = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const z = (n: number) => n.toFixed(2);

export default async function WyplatyPage({ searchParams }: { searchParams: { y?: string; m?: string } }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!canFinance(session.role)) redirect("/admin");

  const now = new Date();
  const year = Number(searchParams.y) || now.getUTCFullYear();
  const month = searchParams.m !== undefined ? Number(searchParams.m) : now.getUTCMonth();
  const { start, end } = monthRange(year, month);

  const users = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    include: { timesheets: { where: { date: { gte: start, lt: end } } } },
    orderBy: { name: "asc" },
  });

  const rows = users.map((u) => ({ user: u, p: computePayroll(u.timesheets, u.ratesJson) }));
  const grandNet = rows.reduce((a, r) => a + r.p.net, 0);
  const grandBrutto = rows.reduce((a, r) => a + r.p.brutto, 0);

  const prev = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>💵</span> Wypłaty</h1>
        {canFinance(session.role) && (
          <div className="flex gap-2">
            <a href={`/api/admin/export/payroll?y=${year}&m=${month}`} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>⬇ CSV</a>
            <a href={`/api/admin/report/payroll?y=${year}&m=${month}`} target="_blank" rel="noreferrer" className="text-sm px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>⬇ PDF</a>
          </div>
        )}
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Wynagrodzenie liczone z kart godzin pracowników wg kategorii × ich stawki (netto / brutto).</p>

      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/wyplaty?y=${prev.y}&m=${prev.m}`} className="px-3 py-1 rounded text-sm" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>‹</Link>
        <span className="font-display text-xl" style={{ color: "var(--gold)" }}>{MONTHS[month]} {year}</span>
        <Link href={`/admin/wyplaty?y=${next.y}&m=${next.m}`} className="px-3 py-1 rounded text-sm" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>›</Link>
      </div>

      {rows.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Brak pracowników.</p>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead>
              <tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
                <th className="text-left font-serif text-[10px] tracking-[1px] uppercase px-4 py-3">Pracownik</th>
                {WORK_CATEGORIES.map((c) => <th key={c.key} className="text-left font-serif text-[10px] tracking-[1px] uppercase px-3 py-3">{c.label} (h)</th>)}
                <th className="text-left font-serif text-[10px] tracking-[1px] uppercase px-3 py-3">Razem h</th>
                <th className="text-left font-serif text-[10px] tracking-[1px] uppercase px-3 py-3">Netto</th>
                <th className="text-left font-serif text-[10px] tracking-[1px] uppercase px-3 py-3">Brutto</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-4 py-3">{r.user.name || r.user.email}{r.user.contractType ? <span style={{ color: "var(--dim)" }}> · {r.user.contractType}</span> : null}</td>
                  {WORK_CATEGORIES.map((c) => <td key={c.key} className="px-3 py-3">{(r.p.hours as any)[c.key].toFixed(1)}</td>)}
                  <td className="px-3 py-3">{r.p.totalHours.toFixed(1)}</td>
                  <td className="px-3 py-3">{z(r.p.net)} zł</td>
                  <td className="px-3 py-3 font-display" style={{ color: "var(--gold)" }}>{z(r.p.brutto)} zł</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid var(--border-h)", background: "rgba(201,168,76,.04)" }}>
                <td className="px-4 py-3 font-serif uppercase text-[11px] tracking-[1px]" style={{ color: "var(--gold)" }} colSpan={WORK_CATEGORIES.length + 2}>Razem</td>
                <td className="px-3 py-3">{z(grandNet)} zł</td>
                <td className="px-3 py-3 font-display" style={{ color: "var(--gold)" }}>{z(grandBrutto)} zł</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
