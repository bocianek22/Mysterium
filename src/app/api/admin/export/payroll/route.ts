import { NextRequest } from "next/server";
import { getSession, isOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";
import { shiftBreakdown, sumBreakdowns, monthRange } from "@/lib/earnings";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || !isOwner(s.role)) return new Response("Forbidden", { status: 403 });
  const now = new Date();
  const year = Number(req.nextUrl.searchParams.get("y")) || now.getUTCFullYear();
  const month = req.nextUrl.searchParams.get("m") !== null ? Number(req.nextUrl.searchParams.get("m")) : now.getUTCMonth();
  const { start, end } = monthRange(year, month);

  const users = await prisma.user.findMany({ where: { role: "EMPLOYEE" }, include: { shifts: { where: { start: { gte: start, lt: end } } } }, orderBy: { name: "asc" } });
  const rows = users.map((u) => {
    const b = sumBreakdowns(u.shifts.map((sh) => shiftBreakdown(sh.start, sh.end, { rateDay: u.rateDay, rateNight: u.rateNight, rateWeekend: u.rateWeekend })));
    return [u.name || u.email, u.shifts.length, b.dayHours, b.nightHours, b.weekendHours, b.totalHours, b.pay];
  });
  const csv = toCsv(["Pracownik", "Zmiany", "Godz. dzień", "Godz. noc", "Godz. weekend", "Razem godz.", "Do wypłaty"], rows);
  return csvResponse(`wyplaty-${year}-${String(month + 1).padStart(2, "0")}.csv`, csv);
}
