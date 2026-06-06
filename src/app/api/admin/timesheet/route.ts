import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  date: z.string().min(1), // YYYY-MM-DD
  userId: z.string().optional(), // tylko manager dla kogoś
  stationaryH: z.coerce.number().min(0).default(0),
  mobileH: z.coerce.number().min(0).default(0),
  travelH: z.coerce.number().min(0).default(0),
  cleaningH: z.coerce.number().min(0).default(0),
  note: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const userId = searchParams.get("userId");
  const where: any = {};
  if (!isManager(s.role)) where.userId = s.sub;
  else if (userId) where.userId = userId;
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lt = new Date(to);
  }
  const items = await prisma.dailyTimesheet.findMany({ where, orderBy: { date: "desc" }, include: { user: { select: { id: true, name: true, email: true } } } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const userId = isManager(s.role) && d.userId ? d.userId : s.sub;
  const date = new Date(`${d.date}T00:00:00`);
  const data = { stationaryH: d.stationaryH, mobileH: d.mobileH, travelH: d.travelH, cleaningH: d.cleaningH, note: d.note || null };
  const item = await prisma.dailyTimesheet.upsert({
    where: { userId_date: { userId, date } },
    update: data,
    create: { userId, date, ...data },
  });
  return NextResponse.json({ item });
}
