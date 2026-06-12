import { NextRequest } from "next/server";
import { getSession, canFinance } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";
import { monthRange } from "@/lib/earnings";

export const dynamic = "force-dynamic";

// Zbiorczy eksport pod księgowość: przychody (rezerwacje), płatności online, wydatki.
export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || !canFinance(s.role)) return new Response("Forbidden", { status: 403 });
  const now = new Date();
  const year = Number(req.nextUrl.searchParams.get("y")) || now.getUTCFullYear();
  const month = req.nextUrl.searchParams.get("m") !== null ? Number(req.nextUrl.searchParams.get("m")) : now.getUTCMonth();
  const { start, end } = monthRange(year, month);

  const [reservations, payments, expenses] = await Promise.all([
    prisma.reservation.findMany({ where: { start: { gte: start, lt: end }, status: { not: "CANCELLED" } }, orderBy: { start: "asc" } }),
    prisma.payment.findMany({ where: { paidAt: { gte: start, lt: end }, status: "PAID" }, orderBy: { paidAt: "asc" } }),
    prisma.expense.findMany({ where: { date: { gte: start, lt: end } }, orderBy: { date: "asc" } }),
  ]);

  const rows: (string | number)[][] = [];
  for (const r of reservations) rows.push(["PRZYCHÓD", new Date(r.start).toLocaleDateString("pl-PL"), r.refNo || "", r.customerName || "", "rezerwacja: " + r.title, (r.price || 0).toFixed(2)]);
  for (const p of payments) rows.push(["PŁATNOŚĆ ONLINE", p.paidAt ? new Date(p.paidAt).toLocaleDateString("pl-PL") : "", p.id.slice(0, 8), p.buyerEmail || "", (p.purpose === "VOUCHER" ? "bon" : "event") + (p.description ? ": " + p.description : ""), (p.amount / 100).toFixed(2)]);
  for (const e of expenses) rows.push(["WYDATEK", new Date(e.date).toLocaleDateString("pl-PL"), e.invoiceNo || "", e.vendor || "", e.category + ": " + e.description, (-(e.amount || 0)).toFixed(2)]);

  const csv = toCsv(["Typ", "Data", "Nr / ID", "Kontrahent / Klient", "Opis", "Kwota (zł)"], rows);
  return csvResponse(`ksiegowosc-${year}-${String(month + 1).padStart(2, "0")}.csv`, csv);
}
