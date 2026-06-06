import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify, sendTelegram } from "@/lib/notify";

const schema = z.object({
  userId: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
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
  // Pracownik widzi tylko swoje zmiany
  if (!isManager(s.role)) where.userId = s.sub;
  else if (userId) where.userId = userId;
  if (from || to) {
    where.start = {};
    if (from) where.start.gte = new Date(from);
    if (to) where.start.lt = new Date(to);
  }

  const shifts = await prisma.shift.findMany({
    where,
    orderBy: { start: "asc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json({ items: shifts });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const shift = await prisma.shift.create({
    data: {
      userId: d.userId,
      start: new Date(d.start),
      end: new Date(d.end),
      note: d.note || null,
    },
  });

  prisma.user.findUnique({ where: { id: d.userId } }).then((u) => {
    if (!u) return;
    const when = `${new Date(shift.start).toLocaleString("pl-PL", { weekday: "long", day: "2-digit", month: "2-digit" })} ${new Date(shift.start).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}–${new Date(shift.end).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}`;
    notify({ type: "schedule", title: "Nowa zmiana w grafiku", lines: [`${u.name || u.email}: ${when}`, shift.note || ""] }).catch(() => {});
    if (u.telegramChatId) sendTelegram(`🗓️ <b>Masz nową zmianę</b>\n${when}${shift.note ? "\n" + shift.note : ""}`, u.telegramChatId).catch(() => {});
  }).catch(() => {});

  return NextResponse.json({ item: shift });
}
