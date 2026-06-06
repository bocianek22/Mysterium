import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pushEventToGoogle } from "@/lib/google";
import { notify } from "@/lib/notify";

const schema = z.object({
  title: z.string().min(1),
  roomId: z.string().optional().nullable(),
  start: z.string().min(1),
  end: z.string().min(1),
  people: z.coerce.number().min(0).default(0),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["NEW", "CONFIRMED", "DONE", "CANCELLED"]).optional(),
  assignedUserId: z.string().optional().nullable(),
  deposit: z.coerce.number().min(0).optional(),
  paid: z.coerce.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const where: any = {};
  if (from || to) {
    where.start = {};
    if (from) where.start.gte = new Date(from);
    if (to) where.start.lt = new Date(to);
  }
  const items = await prisma.reservation.findMany({
    where,
    orderBy: { start: "asc" },
    include: { room: { select: { id: true, namePl: true } }, assignedUser: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const item = await prisma.reservation.create({
    data: {
      title: d.title,
      roomId: d.roomId || null,
      start: new Date(d.start),
      end: new Date(d.end),
      people: d.people,
      customerName: d.customerName || null,
      customerPhone: d.customerPhone || null,
      customerEmail: d.customerEmail || null,
      notes: d.notes || null,
      source: "MANUAL",
      status: d.status || "NEW",
      assignedUserId: d.assignedUserId || null,
      deposit: d.deposit || 0,
      paid: d.paid || false,
    },
  });

  notify({
    type: "reservation",
    title: "Nowa rezerwacja",
    lines: [
      item.title,
      new Date(item.start).toLocaleString("pl-PL", { dateStyle: "full", timeStyle: "short" }),
      item.customerName ? `Klient: ${item.customerName}${item.customerPhone ? " · " + item.customerPhone : ""}` : "",
      item.people ? `Osób: ${item.people}` : "",
    ],
  }).catch(() => {});

  // Opcjonalny zapis do Google Calendar (nie blokuje odpowiedzi przy błędzie)
  pushEventToGoogle({
    summary: `Rezerwacja: ${item.title}`,
    description: [item.customerName, item.customerPhone, item.notes]
      .filter(Boolean)
      .join(" • "),
    start: item.start,
    end: item.end,
  }).catch(() => {});

  return NextResponse.json({ item });
}
