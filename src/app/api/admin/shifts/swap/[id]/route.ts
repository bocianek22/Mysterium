import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

export const dynamic = "force-dynamic";

const schema = z.object({ action: z.enum(["accept", "cancel"]) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });

  const swap = await prisma.shiftSwap.findUnique({ where: { id: params.id } });
  if (!swap || swap.status !== "OPEN") return NextResponse.json({ error: "Zgłoszenie nieaktywne" }, { status: 400 });

  if (parsed.data.action === "cancel") {
    if (swap.fromUserId !== s.sub) return NextResponse.json({ error: "Brak uprawnień" }, { status: 403 });
    await prisma.shiftSwap.update({ where: { id: swap.id }, data: { status: "CANCELLED", resolvedAt: new Date() } });
    return NextResponse.json({ ok: true });
  }

  // accept — ktoś inny przejmuje zmianę
  if (swap.fromUserId === s.sub) return NextResponse.json({ error: "Nie możesz przejąć własnej zmiany" }, { status: 400 });
  const shift = await prisma.shift.findUnique({ where: { id: swap.shiftId } });
  if (!shift || shift.start < new Date()) return NextResponse.json({ error: "Zmiana już nieaktualna" }, { status: 400 });

  await prisma.$transaction([
    prisma.shift.update({ where: { id: shift.id }, data: { userId: s.sub } }),
    prisma.shiftSwap.update({ where: { id: swap.id }, data: { status: "ACCEPTED", acceptedById: s.sub, resolvedAt: new Date() } }),
  ]);
  notify({ type: "schedule", title: "Zmiana przejęta", lines: [`${s.name || s.email} przejął(ęła) zmianę`, new Date(shift.start).toLocaleString("pl-PL")] });
  return NextResponse.json({ ok: true });
}
