import { NextRequest } from "next/server";
import { getSession, canFinance } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computePayroll, monthRange } from "@/lib/payroll";
import { reportHtml, htmlResponse } from "@/lib/report";

export const dynamic = "force-dynamic";

const MONTHS = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];
const zl = (n: number) => (n || 0).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  const s = await getSession();
  if (!s || !canFinance(s.role)) return new Response("Forbidden", { status: 403 });

  const now = new Date();
  const year = Number(req.nextUrl.searchParams.get("y")) || now.getUTCFullYear();
  const month = req.nextUrl.searchParams.get("m") !== null ? Number(req.nextUrl.searchParams.get("m")) : now.getUTCMonth();
  const { start, end } = monthRange(year, month);
  const period = `${MONTHS[month]} ${year}`;

  if (params.type === "reservations") {
    const rows = await prisma.reservation.findMany({ orderBy: { start: "desc" }, include: { room: { select: { namePl: true } }, assignedUser: { select: { name: true, email: true } } } });
    return htmlResponse(reportHtml({
      title: "Rezerwacje",
      subtitle: `Wszystkie rezerwacje · ${rows.length} poz.`,
      columns: ["Nr", "Data", "Pokój", "Status", "Osób", "Klient", "Przychód", "Zysk"],
      alignRight: [4, 6, 7],
      rows: rows.map((r) => [
        r.refNo,
        new Date(r.start).toLocaleString("pl-PL"),
        r.room?.namePl || "",
        r.status,
        r.people,
        r.customerName,
        zl(r.price || 0),
        zl((r.price || 0) - (r.fuelCost || 0) - (r.otherCost || 0)),
      ]),
      totals: ["Razem", "", "", "", "", "", zl(rows.reduce((a, r) => a + (r.price || 0), 0)), zl(rows.reduce((a, r) => a + (r.price || 0) - (r.fuelCost || 0) - (r.otherCost || 0), 0))],
    }));
  }

  if (params.type === "payroll") {
    const users = await prisma.user.findMany({ where: { role: "EMPLOYEE" }, include: { timesheets: { where: { date: { gte: start, lt: end } } } }, orderBy: { name: "asc" } });
    const computed = users.map((u) => ({ name: u.name || u.email, contract: u.contractType || "", p: computePayroll(u.timesheets, u.ratesJson) }));
    return htmlResponse(reportHtml({
      title: "Wypłaty",
      subtitle: period,
      columns: ["Pracownik", "Umowa", "Razem h", "Netto", "Brutto"],
      alignRight: [2, 3, 4],
      rows: computed.map((c) => [c.name, c.contract, c.p.totalHours, zl(c.p.net), zl(c.p.brutto)]),
      totals: ["Razem", "", computed.reduce((a, c) => a + c.p.totalHours, 0), zl(computed.reduce((a, c) => a + c.p.net, 0)), zl(computed.reduce((a, c) => a + c.p.brutto, 0))],
    }));
  }

  if (params.type === "vouchers") {
    const rows = await prisma.voucher.findMany({ where: { status: { in: ["SOLD", "REDEEMED"] } }, orderBy: { createdAt: "desc" } });
    return htmlResponse(reportHtml({
      title: "Sprzedaż bonów",
      subtitle: `Sprzedane i zrealizowane · ${rows.length} poz.`,
      columns: ["Kod", "Wartość", "Status", "Nabywca", "Ważny do", "Data"],
      alignRight: [1],
      rows: rows.map((v) => [v.code, v.amount ? zl(v.amount) : "na grę", v.status === "REDEEMED" ? "Zrealizowany" : "Sprzedany", v.buyerName || "", v.validUntil || "", new Date(v.createdAt).toLocaleDateString("pl-PL")]),
      totals: ["Razem", zl(rows.reduce((a, v) => a + (v.amount || 0), 0)), "", "", "", ""],
    }));
  }

  if (params.type === "expenses") {
    const rows = await prisma.expense.findMany({ where: { date: { gte: start, lt: end } }, orderBy: { date: "desc" } });
    return htmlResponse(reportHtml({
      title: "Wydatki firmowe",
      subtitle: period,
      columns: ["Data", "Kategoria", "Opis", "Kontrahent", "Nr faktury", "Kwota"],
      alignRight: [5],
      rows: rows.map((e) => [new Date(e.date).toLocaleDateString("pl-PL"), e.category, e.description, e.vendor || "", e.invoiceNo || "", zl(e.amount)]),
      totals: ["Razem", "", "", "", "", zl(rows.reduce((a, e) => a + (e.amount || 0), 0))],
    }));
  }

  if (params.type === "finance") {
    const [reservations, employees, vouchers, expenses] = await Promise.all([
      prisma.reservation.findMany({ where: { start: { gte: start, lt: end } } }),
      prisma.user.findMany({ where: { role: "EMPLOYEE" }, include: { timesheets: { where: { date: { gte: start, lt: end } } } } }),
      prisma.voucher.findMany({ where: { status: { in: ["SOLD", "REDEEMED"] } } }),
      prisma.expense.findMany({ where: { date: { gte: start, lt: end } } }),
    ]);
    const active = reservations.filter((r) => r.status !== "CANCELLED");
    const revenue = active.reduce((a, r) => a + (r.price || 0), 0);
    const resCosts = active.reduce((a, r) => a + (r.fuelCost || 0) + (r.otherCost || 0), 0);
    const expensesTotal = expenses.reduce((a, e) => a + (e.amount || 0), 0);
    const payroll = employees.reduce((a, u) => a + computePayroll(u.timesheets, u.ratesJson).brutto, 0);
    const profit = revenue - resCosts - expensesTotal - payroll;
    return htmlResponse(reportHtml({
      title: "Podsumowanie finansowe",
      subtitle: period,
      columns: ["Pozycja", "Kwota"],
      alignRight: [1],
      rows: [
        ["Przychód (rezerwacje)", zl(revenue)],
        ["Koszty rezerwacji (paliwo + inne)", "-" + zl(resCosts)],
        ["Wydatki firmowe", "-" + zl(expensesTotal)],
        ["Wypłaty (brutto)", "-" + zl(payroll)],
        ["Rezerwacje aktywne", String(active.length)],
        ["Sprzedane bony (wartość)", zl(vouchers.reduce((a, v) => a + (v.amount || 0), 0))],
      ],
      totals: ["Zysk", zl(profit)],
    }));
  }

  return new Response("Nieznany typ raportu", { status: 404 });
}
