import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyCustomerToken } from "@/lib/customerToken";
import { notify } from "@/lib/notify";
import { notifyWaitlist } from "@/lib/waitlist";

export const dynamic = "force-dynamic";

const schema = z.object({ token: z.string().min(10), reservationId: z.string().min(1) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });

  const email = await verifyCustomerToken(parsed.data.token);
  if (!email) return NextResponse.json({ error: "Link wygasł. Poproś o nowy." }, { status: 401 });

  const r = await prisma.reservation.findUnique({ where: { id: parsed.data.reservationId } });
  if (!r || (r.customerEmail || "").toLowerCase() !== email) return NextResponse.json({ error: "Nie znaleziono rezerwacji" }, { status: 404 });
  if (r.source !== "ONLINE") return NextResponse.json({ error: "Tę rezerwację anuluj telefonicznie." }, { status: 400 });
  if (r.status === "CANCELLED") return NextResponse.json({ ok: true });
  if (r.start < new Date()) return NextResponse.json({ error: "Nie można anulować minionej rezerwacji." }, { status: 400 });

  await prisma.reservation.update({ where: { id: r.id }, data: { status: "CANCELLED" } });
  notify({ type: "reservation", title: "Anulowanie rezerwacji online", lines: [`${r.customerName || email}`, new Date(r.start).toLocaleString("pl-PL"), r.refNo || ""] });
  // Powiadom listę oczekujących — zwolnił się termin
  const dateKey = new Date(r.start).toISOString().slice(0, 10);
  notifyWaitlist(r.roomId, dateKey);
  return NextResponse.json({ ok: true });
}
