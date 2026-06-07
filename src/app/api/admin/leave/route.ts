import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LEAVE_TYPES, leaveCounts, workingDays, yearRange } from "@/lib/leave";
import { notify } from "@/lib/notify";

const schema = z.object({
  startDate: z.string().min(1), // YYYY-MM-DD
  endDate: z.string().min(1),
  type: z.enum(["URLOP", "NA_ZADANIE", "BEZPLATNY", "CHOROBA", "INNE"]).default("URLOP"),
  reason: z.string().optional().nullable(),
  userId: z.string().optional(), // tylko manager może dodać dla kogoś
});

const day = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00.000Z`);

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year")) || new Date().getUTCFullYear();
  const { start, end } = yearRange(year);
  const manager = isManager(s.role);

  if (!manager) {
    const items = await prisma.leaveRequest.findMany({
      where: { userId: s.sub, startDate: { gte: start, lt: end } },
      orderBy: { startDate: "desc" },
    });
    const me = await prisma.user.findUnique({ where: { id: s.sub }, select: { leaveAllowance: true } });
    const allowance = me?.leaveAllowance ?? 26;
    const used = items.filter((i) => i.status === "APPROVED" && leaveCounts(i.type)).reduce((a, i) => a + i.days, 0);
    const pending = items.filter((i) => i.status === "PENDING" && leaveCounts(i.type)).reduce((a, i) => a + i.days, 0);
    return NextResponse.json({ manager: false, year, items, allowance, used, pending, remaining: allowance - used });
  }

  const items = await prisma.leaveRequest.findMany({
    where: { startDate: { gte: start, lt: end } },
    orderBy: [{ status: "asc" }, { startDate: "desc" }],
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  const employees = await prisma.user.findMany({ where: { role: "EMPLOYEE" }, select: { id: true, name: true, email: true, leaveAllowance: true }, orderBy: { name: "asc" } });
  const balances = employees.map((u) => {
    const own = items.filter((i) => i.userId === u.id);
    const used = own.filter((i) => i.status === "APPROVED" && leaveCounts(i.type)).reduce((a, i) => a + i.days, 0);
    const pending = own.filter((i) => i.status === "PENDING" && leaveCounts(i.type)).reduce((a, i) => a + i.days, 0);
    return { userId: u.id, name: u.name || u.email, allowance: u.leaveAllowance, used, pending, remaining: u.leaveAllowance - used };
  });
  return NextResponse.json({ manager: true, year, items, balances });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const manager = isManager(s.role);
  const userId = manager && d.userId ? d.userId : s.sub;

  const startDate = day(d.startDate);
  const endDate = day(d.endDate);
  if (endDate < startDate) return NextResponse.json({ error: "Data końca przed początkiem" }, { status: 400 });
  const days = workingDays(startDate, endDate);

  const item = await prisma.leaveRequest.create({
    data: {
      userId,
      startDate,
      endDate,
      days,
      type: d.type,
      reason: d.reason || null,
      status: manager ? "APPROVED" : "PENDING",
      decidedBy: manager ? s.name || s.email : null,
      decidedAt: manager ? new Date() : null,
    },
    include: { user: { select: { name: true, email: true } } },
  });

  // Powiadom zespół o nowym wniosku do rozpatrzenia.
  if (!manager) {
    const typeLabel = LEAVE_TYPES.find((t) => t.key === d.type)?.label || d.type;
    await notify({
      type: "schedule",
      title: "Nowy wniosek urlopowy",
      lines: [
        `${item.user.name || item.user.email}`,
        `${typeLabel}: ${d.startDate} – ${d.endDate} (${days} dni rob.)`,
        d.reason ? `Powód: ${d.reason}` : "",
      ],
    });
  }

  return NextResponse.json({ item });
}
