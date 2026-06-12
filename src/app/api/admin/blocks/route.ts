import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canReservations } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { warsawDate } from "@/lib/slots";

export const dynamic = "force-dynamic";

const schema = z.object({
  date: z.string().min(8),       // YYYY-MM-DD
  from: z.string().min(4),       // HH:MM
  to: z.string().min(4),         // HH:MM
  roomId: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});

export async function GET() {
  const s = await getSession();
  if (!s || !canReservations(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const items = await prisma.slotBlock.findMany({ where: { end: { gte: new Date(Date.now() - 86400000) } }, orderBy: { start: "asc" }, take: 200 });
  const rooms = await prisma.room.findMany({ select: { id: true, namePl: true } });
  return NextResponse.json({ items, rooms });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !canReservations(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const start = warsawDate(d.date, d.from);
  const end = warsawDate(d.date, d.to);
  if (!(end > start)) return NextResponse.json({ error: "Godzina końca musi być po początku" }, { status: 400 });
  const item = await prisma.slotBlock.create({ data: { start, end, roomId: d.roomId || null, reason: (d.reason || "").trim() || null } });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest) {
  const s = await getSession();
  if (!s || !canReservations(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (id) await prisma.slotBlock.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
