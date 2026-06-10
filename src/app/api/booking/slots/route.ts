import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { freeSlots, parseHours } from "@/lib/slots";

export const dynamic = "force-dynamic";

// Publiczne: wolne sloty dla wybranego pokoju (własny system rezerwacji).
export async function GET(req: NextRequest) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings?.ownBookingEnabled) return NextResponse.json({ error: "Rezerwacja online wyłączona" }, { status: 400 });

  const roomId = new URL(req.url).searchParams.get("roomId");
  if (!roomId) return NextResponse.json({ slots: [] });

  const horizonDays = 21;
  const now = new Date();
  const reservations = await prisma.reservation.findMany({
    where: { roomId, status: { not: "CANCELLED" }, start: { gte: now, lt: new Date(now.getTime() + horizonDays * 86400000) } },
    select: { start: true },
  });
  const blocks = await prisma.slotBlock.findMany({
    where: { OR: [{ roomId }, { roomId: null }], end: { gte: now } },
    select: { start: true, end: true },
  }).catch(() => [] as { start: Date; end: Date }[]);

  const slots = freeSlots(
    reservations.map((r) => r.start),
    parseHours(settings.openHoursJson),
    { stepMin: settings.slotStepMin || 90, daysAhead: horizonDays, limit: 60, leadMin: settings.ownBookingLeadMin ?? 120, blocks }
  );
  return NextResponse.json({ slots });
}
