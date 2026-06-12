import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Podaj poprawny e-mail" }, { status: 400 });
  const d = parsed.data;
  const email = d.email.trim().toLowerCase();

  // Nie duplikuj aktywnego zgłoszenia (ten sam e-mail+pokój, jeszcze niepowiadomiony)
  const existing = await prisma.waitlist.findFirst({ where: { email, roomId: d.roomId || null, notifiedAt: null } });
  if (existing) return NextResponse.json({ ok: true });

  await prisma.waitlist.create({
    data: { email, name: d.name?.trim() || null, phone: d.phone?.trim() || null, roomId: d.roomId || null, dateKey: d.dateKey || null },
  });
  return NextResponse.json({ ok: true });
}
