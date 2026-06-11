import { prisma } from "./prisma";
import { sendMail } from "./notify";
import { siteUrl } from "./seo";

// Gdy zwolni się termin dla pokoju (anulowanie), powiadom oczekujących.
export async function notifyWaitlist(roomId: string | null, dateKey?: string | null) {
  try {
    const entries = await prisma.waitlist.findMany({
      where: { notifiedAt: null, OR: [{ roomId: roomId || undefined }, { roomId: null }] },
      take: 25,
      orderBy: { createdAt: "asc" },
    });
    // filtr po dniu (puste = dowolny) wykonujemy w kodzie, by uniknąć złożonego OR
    const matched = entries.filter((e) => !e.dateKey || !dateKey || e.dateKey === dateKey);
    if (!matched.length) return;

    const room = roomId ? await prisma.room.findUnique({ where: { id: roomId }, select: { namePl: true } }) : null;
    const link = `${siteUrl()}/pl/rezerwacja`;
    for (const e of matched) {
      await sendMail({
        to: e.email,
        subject: "Zwolnił się termin — Mysterium",
        text: `Dobra wiadomość! Zwolnił się termin${room ? ` w pokoju ${room.namePl}` : ""}${dateKey ? ` (${dateKey})` : ""}.\n\nZarezerwuj online, zanim ktoś Cię uprzedzi:\n${link}\n\nTo wiadomość z listy oczekujących Mysterium.`,
      }).catch(() => {});
      await prisma.waitlist.update({ where: { id: e.id }, data: { notifiedAt: new Date() } }).catch(() => {});
    }
  } catch {}
}
