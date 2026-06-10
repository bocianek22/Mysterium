import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { freeSlots, parseHours, warsawDate } from "@/lib/slots";
import { isBanned, normalizeEmail, normalizePhone } from "@/lib/bans";
import { clientIp } from "@/lib/rateLimit";
import { nextRefNo } from "@/lib/reservations";
import { notify, sendMail } from "@/lib/notify";
import { siteUrl } from "@/lib/seo";
import { startCheckout, resolveOrigin, paymentSettings } from "@/lib/payments";

export const dynamic = "force-dynamic";

const schema = z.object({
  roomId: z.string().min(1),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().min(2, "Podaj imię i nazwisko"),
  email: z.string().email("Podaj poprawny e-mail"),
  phone: z.string().min(6, "Podaj numer telefonu"),
  people: z.coerce.number().min(1).max(50),
  notes: z.string().optional().nullable(),
  deposit: z.coerce.boolean().optional(), // czy zapłacić zadatek online
});

export async function POST(req: NextRequest) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings?.ownBookingEnabled) return NextResponse.json({ error: "Rezerwacja online jest wyłączona" }, { status: 400 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const ip = clientIp(req);

  // Ban: e-mail / telefon / IP
  if (await isBanned({ email: d.email, phone: d.phone, ip })) {
    return NextResponse.json({ error: "Rezerwacja online jest dla Ciebie niedostępna. Skontaktuj się z nami telefonicznie." }, { status: 403 });
  }

  // Anty-spam: maks. 5 rezerwacji z jednego IP w ciągu 10 minut
  if (ip && ip !== "unknown") {
    const recent = await prisma.reservation.count({ where: { ip, createdAt: { gte: new Date(Date.now() - 10 * 60000) } } });
    if (recent >= 5) return NextResponse.json({ error: "Zbyt wiele rezerwacji w krótkim czasie. Spróbuj później." }, { status: 429 });
  }

  const room = await prisma.room.findUnique({ where: { id: d.roomId } });
  if (!room) return NextResponse.json({ error: "Nie znaleziono pokoju" }, { status: 404 });

  const start = warsawDate(d.dateKey, d.time);
  const step = settings.slotStepMin || 90;
  const end = new Date(start.getTime() + step * 60000);
  if (start < new Date()) return NextResponse.json({ error: "Ten termin już minął" }, { status: 400 });

  // Walidacja, że slot wciąż wolny (anty-wyścig)
  const now = new Date();
  const reservations = await prisma.reservation.findMany({
    where: { roomId: d.roomId, status: { not: "CANCELLED" }, start: { gte: now, lt: new Date(now.getTime() + 30 * 86400000) } },
    select: { start: true },
  });
  const blocks = await prisma.slotBlock.findMany({ where: { OR: [{ roomId: d.roomId }, { roomId: null }], end: { gte: now } }, select: { start: true, end: true } }).catch(() => []);
  const slots = freeSlots(reservations.map((r) => r.start), parseHours(settings.openHoursJson), { stepMin: step, daysAhead: 30, limit: 500, leadMin: settings.ownBookingLeadMin ?? 120, blocks });
  if (!slots.some((s) => s.dateKey === d.dateKey && s.time === d.time)) {
    return NextResponse.json({ error: "Ten termin jest już zajęty. Wybierz inny." }, { status: 409 });
  }

  // Powiązanie/utworzenie klienta po e-mailu
  const email = normalizeEmail(d.email);
  let customerId: string | null = null;
  try {
    const existing = await prisma.customer.findUnique({ where: { email } });
    customerId = existing?.id ?? (await prisma.customer.create({ data: { name: d.name.trim(), email, phone: d.phone.trim(), source: "RESERVATION" } })).id;
  } catch { customerId = null; }

  const refNo = await nextRefNo();
  const reservation = await prisma.reservation.create({
    data: {
      title: `${room.namePl} — ${d.name.trim()}`,
      roomId: d.roomId,
      start, end,
      people: d.people,
      customerName: d.name.trim(),
      customerEmail: email,
      customerPhone: d.phone.trim(),
      notes: d.notes?.trim() || null,
      source: "ONLINE",
      status: "CONFIRMED", // potwierdzanie automatyczne
      customerId,
      refNo,
      ip,
    },
  });

  notify({ type: "reservation", title: "Nowa rezerwacja online", lines: [`${room.namePl} · ${d.people} os.`, start.toLocaleString("pl-PL"), `${d.name} · ${d.phone}`, refNo] });

  // Potwierdzenie dla klienta + link „dodaj do kalendarza"
  try {
    const ymd = (dt: Date) => dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const address = settings.addressPl || "Warszawska 40, 05-100 Nowy Dwór Mazowiecki";
    const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Mysterium — " + room.namePl)}&dates=${ymd(start)}/${ymd(end)}&details=${encodeURIComponent("Rezerwacja " + refNo)}&location=${encodeURIComponent(address)}`;
    const when = start.toLocaleString("pl-PL", { weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    await sendMail({
      to: email,
      subject: `Potwierdzenie rezerwacji ${refNo} — Mysterium`,
      text: `Dziękujemy za rezerwację! 🎉\n\nPokój: ${room.namePl}\nTermin: ${when}\nOsób: ${d.people}\nNumer rezerwacji: ${refNo}\nAdres: ${address}\n\nDodaj do kalendarza:\n${gcal}\n\nZarządzaj rezerwacją (anulowanie/podgląd):\n${siteUrl()}/pl/moje-rezerwacje\n\nDo zobaczenia w Mysterium!`,
    });
  } catch {}

  // Zadatek online (opcjonalny)
  const depositZl = settings.ownBookingDeposit || 0;
  if (d.deposit && depositZl > 0) {
    const cfg = await paymentSettings();
    if (cfg.enabled) {
      try {
        const payment = await prisma.payment.create({
          data: {
            provider: cfg.provider,
            purpose: "BOOKING",
            amount: Math.round(depositZl * 100),
            description: `Zadatek — rezerwacja ${refNo}`,
            buyerName: d.name.trim(),
            buyerEmail: email,
            metaJson: JSON.stringify({ reservationId: reservation.id, refNo }),
          },
        });
        const url = await startCheckout(payment.id, resolveOrigin(req.headers));
        return NextResponse.json({ ok: true, refNo, paymentUrl: url });
      } catch {
        // Płatność się nie powiodła — rezerwacja i tak istnieje (zadatek był opcjonalny)
        return NextResponse.json({ ok: true, refNo, paymentError: true });
      }
    }
  }

  return NextResponse.json({ ok: true, refNo });
}
