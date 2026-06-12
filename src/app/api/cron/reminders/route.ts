import { NextRequest, NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Przypomnienia przed grą. Vercel Cron (np. co godzinę) lub ręcznie przez managera.
export async function GET(req: NextRequest) {
  const cronHeader = req.headers.get("x-vercel-cron");
  const key = new URL(req.url).searchParams.get("key");
  const session = await getSession();
  const authorized = !!cronHeader || (process.env.CRON_SECRET && key === process.env.CRON_SECRET) || (session && isManager(session.role));
  if (!authorized) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!s?.reminderEnabled) return NextResponse.json({ ok: true, skipped: "wyłączone", sent: 0 });

  const lead = s.reminderLeadHours || 24;
  const now = new Date();
  const until = new Date(now.getTime() + lead * 3600 * 1000);

  const reservations = await prisma.reservation.findMany({
    where: { start: { gte: now, lte: until }, status: { not: "CANCELLED" }, remindedAt: null, NOT: { customerEmail: null } },
    include: { room: { select: { namePl: true } } },
  });

  const subject = s.reminderSubject?.trim() || "Przypomnienie o grze w Mysterium 🗝️";
  const tpl = s.reminderBody?.trim() || "Cześć {name}!\n\nPrzypominamy o Twojej grze w Mysterium: {date} o {time}{room}.\n\nProsimy o przybycie 10–15 minut wcześniej. Do zobaczenia!";

  let sent = 0;
  for (const r of reservations) {
    const d = new Date(r.start);
    const date = d.toLocaleDateString("pl-PL", { weekday: "long", day: "2-digit", month: "long", timeZone: "Europe/Warsaw" });
    const time = d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw" });
    const text = tpl
      .replace(/\{name\}/g, r.customerName?.split(" ")[0] || "")
      .replace(/\{date\}/g, date)
      .replace(/\{time\}/g, time)
      .replace(/\{room\}/g, r.room?.namePl ? ` — ${r.room.namePl}` : "");
    const res = await sendMail({ to: r.customerEmail as string, subject, text });
    if (res.ok) { await prisma.reservation.update({ where: { id: r.id }, data: { remindedAt: new Date() } }); sent++; }
  }
  return NextResponse.json({ ok: true, candidates: reservations.length, sent });
}
