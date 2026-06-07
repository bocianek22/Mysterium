import { NextRequest, NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Auto-podziękowanie po grze + prośba o opinię Google.
// Uruchamiane przez Vercel Cron (codziennie) lub ręcznie przez managera.
export async function GET(req: NextRequest) {
  const cronHeader = req.headers.get("x-vercel-cron");
  const key = new URL(req.url).searchParams.get("key");
  const session = await getSession();
  const authorized = !!cronHeader || (process.env.CRON_SECRET && key === process.env.CRON_SECRET) || (session && isManager(session.role));
  if (!authorized) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!s?.autoThankYouEnabled) return NextResponse.json({ ok: true, skipped: "wyłączone w ustawieniach", sent: 0 });

  const now = new Date();
  const since = new Date(now.getTime() - 48 * 3600 * 1000); // ostatnie 48 h
  const reservations = await prisma.reservation.findMany({
    where: {
      end: { lt: now, gte: since },
      status: { not: "CANCELLED" },
      thankedAt: null,
      NOT: { customerEmail: null },
    },
    select: { id: true, customerEmail: true, customerName: true },
  });

  const reviewLink = s.googleReviewsUrl?.trim();
  const base = (s.thankYouMessagePl?.trim()) ||
    "Dziękujemy za wizytę w Mysterium! Mamy nadzieję, że gra dostarczyła Wam emocji i dobrej zabawy.";
  const subject = "Dziękujemy za wizytę w Mysterium 🗝️";

  let sent = 0;
  const errors: string[] = [];
  for (const r of reservations) {
    const hello = r.customerName ? `Cześć ${r.customerName.split(" ")[0]}!\n\n` : "";
    const review = reviewLink ? `\n\nBędzie nam bardzo miło, jeśli zostawisz opinię — to dla nas ogromne wsparcie:\n${reviewLink}` : "";
    const text = `${hello}${base}${review}\n\nDo zobaczenia w Mysterium!`;
    const res = await sendMail({ to: r.customerEmail as string, subject, text });
    if (res.ok) {
      await prisma.reservation.update({ where: { id: r.id }, data: { thankedAt: new Date() } });
      sent++;
    } else {
      errors.push(res.error || "błąd");
    }
  }

  return NextResponse.json({ ok: true, candidates: reservations.length, sent, errors: errors.slice(0, 3) });
}
