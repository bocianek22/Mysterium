import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canReservations } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findOrCreateCustomer } from "@/lib/customers";
import { notifyWaitlist } from "@/lib/waitlist";
import { pushEventToGoogle, updateGoogleEvent, deleteGoogleEvent } from "@/lib/google";

const schema = z.object({
  title: z.string().optional(),
  roomId: z.string().optional().nullable(),
  start: z.string().optional(),
  end: z.string().optional(),
  people: z.coerce.number().min(0).optional(),
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = await getSession();
  if (!s || !canReservations(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  // Przepnij/utwórz klienta, jeśli podano dane kontaktowe.
  const customerId = (d.customerName || d.customerEmail || d.customerPhone)
    ? await findOrCreateCustomer({ name: d.customerName, email: d.customerEmail, phone: d.customerPhone })
    : undefined;
  const item = await prisma.reservation.update({
    where: { id: params.id },
    data: {
      title: d.title,
      customerId: customerId === undefined ? undefined : customerId,
      roomId: d.roomId === undefined ? undefined : d.roomId || null,
      start: d.start ? new Date(d.start) : undefined,
      end: d.end ? new Date(d.end) : undefined,
      people: d.people,
      customerName: d.customerName ?? undefined,
      customerPhone: d.customerPhone ?? undefined,
      customerEmail: d.customerEmail ?? undefined,
      notes: d.notes ?? undefined,
      status: d.status,
      assignedUserId: d.assignedUserId === undefined ? undefined : d.assignedUserId || null,
      deposit: d.deposit,
      paid: d.paid,
      price: d.price,
      invoiceUrl: d.invoiceUrl ?? undefined,
      fuelCost: d.fuelCost,
      fuelInvoiceUrl: d.fuelInvoiceUrl ?? undefined,
      otherCost: d.otherCost,
      otherInvoiceUrl: d.otherInvoiceUrl ?? undefined,
    },
  });
  // Zwolniony termin → powiadom listę oczekujących
  if (d.status === "CANCELLED" && item.start > new Date()) {
    notifyWaitlist(item.roomId, new Date(item.start).toISOString().slice(0, 10));
  }

  // Synchronizacja z Google Calendar: anulowanie usuwa wydarzenie, edycja je aktualizuje.
  try {
    if (item.googleEventId) {
      if (item.status === "CANCELLED") {
        await deleteGoogleEvent(item.googleEventId);
        await prisma.reservation.update({ where: { id: item.id }, data: { googleEventId: null } });
      } else {
        await updateGoogleEvent(item.googleEventId, {
          summary: `Rezerwacja: ${item.title}`,
          description: [item.customerName, item.customerPhone, item.notes].filter(Boolean).join(" • "),
          start: item.start,
          end: item.end,
        });
      }
    } else if (item.status !== "CANCELLED") {
      // Brak wydarzenia (np. rezerwacja sprzed włączenia synchronizacji) — utwórz teraz.
      const eventId = await pushEventToGoogle({
        summary: `Rezerwacja: ${item.title}`,
        description: [item.customerName, item.customerPhone, item.notes].filter(Boolean).join(" • "),
        start: item.start,
        end: item.end,
      });
      if (eventId) await prisma.reservation.update({ where: { id: item.id }, data: { googleEventId: eventId } });
    }
  } catch {}

  return NextResponse.json({ item });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = await getSession();
  if (!s || !canReservations(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const existing = await prisma.reservation.findUnique({ where: { id: params.id }, select: { googleEventId: true } });
  if (existing?.googleEventId) await deleteGoogleEvent(existing.googleEventId).catch(() => {});
  await prisma.reservation.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
