import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canReservations } from "@/lib/auth";
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
  price: z.coerce.number().min(0).optional(),
  invoiceUrl: z.string().optional().nullable(),
  fuelCost: z.coerce.number().min(0).optional(),
  fuelInvoiceUrl: z.string().optional().nullable(),
  otherCost: z.coerce.number().min(0).optional(),
  otherInvoiceUrl: z.string().optional().nullable(),
});

// Generuje kolejny numer zlecenia: MYS-RRRR-NNNN
async function nextRefNo(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.reservation.count();
  for (let i = 1; i <= 5; i++) {
    const candidate = `MYS-${year}-${String(count + i).padStart(4, "0")}`;
    const exists = await prisma.reservation.findUnique({ where: { refNo: candidate } });
    if (!exists) return candidate;
  }
  return `MYS-${year}-${Date.now().toString().slice(-5)}`;
}

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const where: any = {};
  // pracownik widzi tylko zlecenia, do których jest przypisany
  if (!canReservations(s.role)) where.assignedUserId = s.sub;
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
  if (!s || !canReservations(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const refNo = await nextRefNo();
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
      refNo,
      price: d.price || 0,
      invoiceUrl: d.invoiceUrl || null,
      fuelCost: d.fuelCost || 0,
      fuelInvoiceUrl: d.fuelInvoiceUrl || null,
      otherCost: d.otherCost || 0,
      otherInvoiceUrl: d.otherInvoiceUrl || null,
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
