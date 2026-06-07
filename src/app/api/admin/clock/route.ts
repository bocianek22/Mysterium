import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClockConfig, verifyToken, entryHours, paidBreakMinutes, fmtHours } from "@/lib/clock";
import { sendTelegram } from "@/lib/notify";

export const dynamic = "force-dynamic";
const schema = z.object({ t: z.string().min(1) });

// Wejście/wyjście przez kod QR. Jeśli jest otwarty wpis → zamyka (wyjście),
// w przeciwnym razie otwiera nowy (wejście).
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "Brak kodu — zeskanuj kod QR." }, { status: 400 });
  }
  const { secret, mode } = await getClockConfig();
  if (!verifyToken(secret, parsed.data.t, mode)) {
    return NextResponse.json({ error: "EXPIRED", message: "Kod nieaktualny — zeskanuj kod QR przy wejściu." }, { status: 400 });
  }

  const open = await prisma.clockEntry.findFirst({
    where: { userId: s.sub, clockOut: null },
    orderBy: { clockIn: "desc" },
  });

  if (open) {
    const now = new Date();
    const entry = await prisma.clockEntry.update({ where: { id: open.id }, data: { clockOut: now } });
    const hours = entryHours(entry.clockIn, now);
    const breakMinutes = paidBreakMinutes(hours);
    await sendClockReminder(s.sub, hours, breakMinutes);
    return NextResponse.json({ action: "OUT", clockIn: entry.clockIn, clockOut: now, hours, breakMinutes });
  }

  const entry = await prisma.clockEntry.create({ data: { userId: s.sub, clockIn: new Date(), source: "QR" } });
  return NextResponse.json({ action: "IN", clockIn: entry.clockIn });
}

// Po wyjściu przypomina pracownikowi (Telegram 1:1) o uzupełnieniu karty godzin.
async function sendClockReminder(userId: string, hours: number, breakMinutes: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { telegramChatId: true } });
  const chatId = user?.telegramChatId;
  if (!chatId) return;
  const brk = breakMinutes ? `\nNależna płatna przerwa: <b>${breakMinutes} min</b>.` : "";
  const text =
    `⏱️ <b>Koniec zmiany</b>\nCzas pracy: <b>${fmtHours(hours)}</b>.${brk}\n` +
    `Pamiętaj uzupełnić kartę godzin w panelu (kategorie: stacjonarna, mobilna, dojazd, sprzątanie).`;
  await sendTelegram(text, chatId);
}
