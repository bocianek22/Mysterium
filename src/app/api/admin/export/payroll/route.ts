import { NextRequest } from "next/server";
import { getSession, isOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";
import { computePayroll, monthRange } from "@/lib/payroll";
import { WORK_CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || !isOwner(s.role)) return new Response("Forbidden", { status: 403 });
  const now = new Date();
  const year = Number(req.nextUrl.searchParams.get("y")) || now.getUTCFullYear();
  const month = req.nextUrl.searchParams.get("m") !== null ? Number(req.nextUrl.searchParams.get("m")) : now.getUTCMonth();
  const { start, end } = monthRange(year, month);

  const users = await prisma.user.findMany({ where: { role: "EMPLOYEE" }, include: { timesheets: { where: { date: { gte: start, lt: end } } } }, orderBy: { name: "asc" } });
  const rows = users.map((u) => {
    const p = computePayroll(u.timesheets, u.ratesJson);
    return [u.name || u.email, u.contractType || "", ...WORK_CATEGORIES.map((c) => (p.hours as any)[c.key]), p.totalHours, p.net, p.brutto];
  });
  const csv = toCsv(["Pracownik", "Umowa", ...WORK_CATEGORIES.map((c) => c.label + " (h)"), "Razem h", "Netto", "Brutto"], rows);
  return csvResponse(`wyplaty-${year}-${String(month + 1).padStart(2, "0")}.csv`, csv);
}
