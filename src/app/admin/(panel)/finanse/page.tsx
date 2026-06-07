import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, canFinance } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computePayroll, monthRange } from "@/lib/payroll";

export const dynamic = "force-dynamic";
const MONTHS = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const zl = (n: number) => n.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";

export default async function FinancePage({ searchParams }: { searchParams: { y?: string; m?: string } }) {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  if (!canFinance(s.role)) redirect("/admin");

  const now = new Date();
  const year = Number(searchParams.y) || now.getUTCFullYear();
  const month = searchParams.m !== undefined ? Number(searchParams.m) : now.getUTCMonth();
  const { start, end } = monthRange(year, month);

  const [reservations, employees, vouchers, codes, expenses] = await Promise.all([
    prisma.reservation.findMany({ where: { start: { gte: start, lt: end } } }),
    prisma.user.findMany({ where: { role: "EMPLOYEE" }, include: { timesheets: { where: { date: { gte: start, lt: end } } } } }),
    prisma.voucher.findMany(),
    prisma.discountCode.findMany(),
    prisma.expense.findMany({ where: { date: { gte: start, lt: end } } }),
  ]);

  const active = reservations.filter((r) => r.status !== "CANCELLED");
  const revenue = active.reduce((a, r) => a + (r.price || 0), 0);
  const resCosts = active.reduce((a, r) => a + (r.fuelCost || 0) + (r.otherCost || 0), 0);
  const expensesTotal = expenses.reduce((a, e) => a + (e.amount || 0), 0);
  const costs = resCosts + expensesTotal;
  const payroll = employees.reduce((a, u) => a + computePayroll(u.timesheets, u.ratesJson).brutto, 0);
  const profit = revenue - costs - payroll;

  // wykres przychodu po dniach
  const days = new Date(year, month + 1, 0).getDate();
  const byDay = Array.from({ length: days }, () => 0);
  for (const r of active) byDay[new Date(r.start).getDate() - 1] += r.price || 0;
  const maxDay = Math.max(1, ...byDay);

  // statystyki gier
  const people = active.reduce((a, r) => a + (r.people || 0), 0);
  const doneCount = reservations.filter((r) => r.status === "DONE").length;
  const cancelled = reservations.filter((r) => r.status === "CANCELLED").length;
  const avgPeople = active.length ? (people / active.length).toFixed(1) : "0";

  const voucherSold = vouchers.filter((v) => v.status === "SOLD" || v.status === "REDEEMED");
  const voucherAmount = voucherSold.reduce((a, v) => a + (v.amount || 0), 0);
  const codeUses = codes.reduce((a, c) => a + (c.usedCount || 0), 0);

  const prev = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  const cards = [
    { label: "Przychód", value: zl(revenue), color: "#7eebb0" },
    { label: "Koszty (rezerwacje + wydatki)", value: zl(costs), color: "#fca5a5" },
    { label: "Wypłaty", value: zl(payroll), color: "#fca5a5" },
    { label: "Zysk", value: zl(profit), color: profit >= 0 ? "var(--gold)" : "#fca5a5", big: true },
  ];

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>💰</span> Finanse</h1>
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/finanse?y=${prev.y}&m=${prev.m}`} className="px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>‹</Link>
        <span className="font-display text-xl" style={{ color: "var(--gold)" }}>{MONTHS[month]} {year}</span>
        <Link href={`/admin/finanse?y=${next.y}&m=${next.m}`} className="px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>›</Link>
        <div className="ml-auto flex gap-2 flex-wrap">
          {[
            { t: "finance", l: "Podsumowanie" },
            { t: "expenses", l: "Wydatki" },
            { t: "vouchers", l: "Bony" },
          ].map((r) => (
            <a key={r.t} href={`/api/admin/report/${r.t}?y=${year}&m=${month}`} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>⬇ PDF {r.l}</a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="p-5 rounded" style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}>
            <div className="font-display" style={{ color: c.color, fontSize: c.big ? 30 : 24 }}>{c.value}</div>
            <div className="font-serif text-[10px] tracking-[1px] uppercase mt-1" style={{ color: "var(--muted)" }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Wykres przychodu po dniach */}
      <div className="p-5 rounded mb-8" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>Przychód po dniach</h2>
        <div className="flex items-end gap-[2px]" style={{ height: 140 }}>
          {byDay.map((v, i) => (
            <div key={i} className="flex-1 rounded-t" title={`${i + 1}. — ${zl(v)}`} style={{ height: `${(v / maxDay) * 100}%`, minHeight: v > 0 ? 3 : 0, background: "linear-gradient(180deg,var(--gold-l),var(--gold-d))" }} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>Koszty</h2>
          <ul className="text-sm flex flex-col gap-2" style={{ color: "var(--text)" }}>
            <li className="flex justify-between"><span style={{ color: "var(--muted)" }}>Paliwo + inne (rezerwacje)</span> <b>{zl(resCosts)}</b></li>
            <li className="flex justify-between"><span style={{ color: "var(--muted)" }}>Wydatki firmowe</span> <b>{zl(expensesTotal)}</b></li>
            <li className="flex justify-between" style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}><span style={{ color: "var(--muted)" }}>Razem koszty</span> <b style={{ color: "#fca5a5" }}>{zl(costs)}</b></li>
          </ul>
          <Link href="/admin/wydatki" className="inline-block mt-4 text-xs" style={{ color: "var(--gold)" }}>🧾 Zarządzaj wydatkami →</Link>
        </div>
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>Statystyki gier</h2>
          <ul className="text-sm flex flex-col gap-2" style={{ color: "var(--text)" }}>
            <li className="flex justify-between"><span style={{ color: "var(--muted)" }}>Rezerwacje (aktywne)</span> <b>{active.length}</b></li>
            <li className="flex justify-between"><span style={{ color: "var(--muted)" }}>Zrealizowane</span> <b>{doneCount}</b></li>
            <li className="flex justify-between"><span style={{ color: "var(--muted)" }}>Anulowane / no-show</span> <b>{cancelled}</b></li>
            <li className="flex justify-between"><span style={{ color: "var(--muted)" }}>Łącznie graczy</span> <b>{people}</b></li>
            <li className="flex justify-between"><span style={{ color: "var(--muted)" }}>Średnio osób / grę</span> <b>{avgPeople}</b></li>
          </ul>
        </div>
        <div className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>Bony i kody</h2>
          <ul className="text-sm flex flex-col gap-2" style={{ color: "var(--text)" }}>
            <li className="flex justify-between"><span style={{ color: "var(--muted)" }}>Sprzedane bony</span> <b>{voucherSold.length}</b></li>
            <li className="flex justify-between"><span style={{ color: "var(--muted)" }}>Wartość bonów</span> <b>{zl(voucherAmount)}</b></li>
            <li className="flex justify-between"><span style={{ color: "var(--muted)" }}>Użycia kodów rabatowych</span> <b>{codeUses}</b></li>
          </ul>
          <Link href="/admin/faktury" className="inline-block mt-4 text-xs" style={{ color: "var(--gold)" }}>🧾 Zobacz faktury i koszty →</Link>
        </div>
      </div>
    </div>
  );
}
