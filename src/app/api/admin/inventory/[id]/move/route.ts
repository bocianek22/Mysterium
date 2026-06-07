import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canOps } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  delta: z.coerce.number().int(), // +przyjęcie / -wydanie
  reason: z.string().optional().nullable(),
});

// Ruch magazynowy: zmienia stan i zapisuje wpis w historii.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canOps(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success || parsed.data.delta === 0) return NextResponse.json({ error: "Podaj ilość" }, { status: 400 });
  const cur = await prisma.inventoryItem.findUnique({ where: { id: params.id } });
  if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newQty = Math.max(0, cur.quantity + parsed.data.delta);
  const realDelta = newQty - cur.quantity; // po przycięciu do 0
  const [item] = await prisma.$transaction([
    prisma.inventoryItem.update({ where: { id: params.id }, data: { quantity: newQty } }),
    prisma.inventoryMovement.create({ data: { itemId: params.id, delta: realDelta, reason: parsed.data.reason || null, byName: s.name || s.email } }),
  ]);
  return NextResponse.json({ item });
}
