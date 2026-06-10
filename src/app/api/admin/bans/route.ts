import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, normalizePhone } from "@/lib/bans";

export const dynamic = "force-dynamic";

// Lista banów + ostatnie rezerwacje online (z IP) do szybkiego banowania.
export async function GET() {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const [bans, recent] = await Promise.all([
    prisma.bookingBan.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.reservation.findMany({
      where: { source: "ONLINE" },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, customerName: true, customerEmail: true, customerPhone: true, ip: true, start: true, refNo: true },
    }),
  ]);
  return NextResponse.json({ bans, recent });
}

const schema = z.object({
  type: z.enum(["EMAIL", "PHONE", "IP"]),
  value: z.string().min(1),
  reason: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });

  const value = parsed.data.type === "EMAIL" ? normalizeEmail(parsed.data.value) : parsed.data.type === "PHONE" ? normalizePhone(parsed.data.value) : parsed.data.value.trim();
  if (!value) return NextResponse.json({ error: "Pusta wartość" }, { status: 400 });

  const ban = await prisma.bookingBan.upsert({
    where: { type_value: { type: parsed.data.type, value } },
    create: { type: parsed.data.type, value, reason: parsed.data.reason?.trim() || null },
    update: { reason: parsed.data.reason?.trim() || null },
  });
  return NextResponse.json({ ban });
}
