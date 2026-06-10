import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Lista: moje zgłoszenia (OPEN) + zmiany innych do przejęcia.
export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const swaps = await prisma.shiftSwap.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" } });
  const shiftIds = [...new Set(swaps.map((x) => x.shiftId))];
  const userIds = [...new Set(swaps.map((x) => x.fromUserId))];
  const [shifts, users] = await Promise.all([
    prisma.shift.findMany({ where: { id: { in: shiftIds }, start: { gte: new Date() } } }),
    prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } }),
  ]);
  const shiftMap = new Map(shifts.map((x) => [x.id, x]));
  const userMap = new Map(users.map((x) => [x.id, x]));

  const enriched = swaps
    .map((sw) => {
      const sh = shiftMap.get(sw.shiftId);
      if (!sh) return null; // zmiana przeszła / usunięta
      const u = userMap.get(sw.fromUserId);
      return { id: sw.id, shiftId: sw.shiftId, fromUserId: sw.fromUserId, fromName: u?.name || u?.email || "—", start: sh.start, end: sh.end, note: sw.note };
    })
    .filter(Boolean) as { id: string; fromUserId: string; start: Date }[];

  return NextResponse.json({
    mine: enriched.filter((x) => x.fromUserId === s.sub),
    open: enriched.filter((x) => x.fromUserId !== s.sub),
  });
}

const schema = z.object({ shiftId: z.string().min(1), note: z.string().optional().nullable() });

// Zgłoszenie oddania własnej zmiany.
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });

  const shift = await prisma.shift.findUnique({ where: { id: parsed.data.shiftId } });
  if (!shift || shift.userId !== s.sub) return NextResponse.json({ error: "To nie jest Twoja zmiana" }, { status: 403 });
  if (shift.start < new Date()) return NextResponse.json({ error: "Nie można oddać minionej zmiany" }, { status: 400 });

  const existing = await prisma.shiftSwap.findFirst({ where: { shiftId: shift.id, status: "OPEN" } });
  if (existing) return NextResponse.json({ error: "Ta zmiana jest już wystawiona" }, { status: 400 });

  await prisma.shiftSwap.create({ data: { shiftId: shift.id, fromUserId: s.sub, note: parsed.data.note || null } });
  notify({ type: "schedule", title: "Oddanie zmiany", lines: [`${s.name || s.email} wystawił(a) zmianę do przejęcia`, new Date(shift.start).toLocaleString("pl-PL")] });
  return NextResponse.json({ ok: true });
}
