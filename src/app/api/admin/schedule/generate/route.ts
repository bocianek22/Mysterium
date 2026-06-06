import { NextRequest, NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSchedule } from "@/lib/scheduler";

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { from, to } = await req.json();
  if (!from || !to) return NextResponse.json({ error: "Brak zakresu" }, { status: 400 });
  const start = new Date(from);
  const end = new Date(to);

  const [employees, availabilities, demands, existingShifts] = await Promise.all([
    prisma.user.findMany({ where: { active: true, role: "EMPLOYEE" }, select: { id: true, name: true, email: true, canStationary: true, canMobile: true, targetHours: true } }),
    prisma.availability.findMany({ where: { status: "APPROVED", start: { gte: start, lt: end } } }),
    prisma.staffingDemand.findMany({ where: { date: { gte: start, lt: end } } }),
    prisma.shift.findMany({ where: { start: { gte: start, lt: end } } }),
  ]);

  // godziny już zaplanowane (poza generowaniem) liczymy do celu
  const baseHours = new Map<string, number>();
  for (const sh of existingShifts) {
    const h = Math.max(0, (new Date(sh.end).getTime() - new Date(sh.start).getTime()) / 3_600_000);
    baseHours.set(sh.userId, (baseHours.get(sh.userId) || 0) + h);
  }

  const result = generateSchedule({
    employees: employees.map((e) => ({
      id: e.id,
      name: e.name || e.email,
      canStationary: e.canStationary,
      canMobile: e.canMobile,
      targetHours: e.targetHours,
      baseHours: baseHours.get(e.id) || 0,
    })),
    availabilities: availabilities.map((a) => ({ userId: a.userId, start: a.start, end: a.end })),
    demands: demands.map((d) => ({
      date: `${d.date.getFullYear()}-${String(d.date.getMonth() + 1).padStart(2, "0")}-${String(d.date.getDate()).padStart(2, "0")}`,
      stationary: d.stationary,
      mobile: d.mobile,
      startTime: d.startTime,
      endTime: d.endTime,
    })),
  });

  return NextResponse.json(result);
}
