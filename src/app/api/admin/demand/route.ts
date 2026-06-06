import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  date: z.string().min(1), // YYYY-MM-DD
  stationary: z.coerce.number().min(0).default(0),
  mobile: z.coerce.number().min(0).default(0),
  startTime: z.string().default("16:00"),
  endTime: z.string().default("22:00"),
  note: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const where: any = {};
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lt = new Date(to);
  }
  const items = await prisma.staffingDemand.findMany({ where, orderBy: { date: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const date = new Date(`${d.date}T00:00:00`);
  // pusty wpis (0/0) -> usuń
  if (d.stationary === 0 && d.mobile === 0) {
    await prisma.staffingDemand.deleteMany({ where: { date } });
    return NextResponse.json({ ok: true, deleted: true });
  }
  const item = await prisma.staffingDemand.upsert({
    where: { date },
    update: { stationary: d.stationary, mobile: d.mobile, startTime: d.startTime, endTime: d.endTime, note: d.note || null },
    create: { date, stationary: d.stationary, mobile: d.mobile, startTime: d.startTime, endTime: d.endTime, note: d.note || null },
  });
  return NextResponse.json({ item });
}
