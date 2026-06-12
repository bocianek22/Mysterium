import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { leaveTypeLabel } from "@/lib/leave";
import { sendTelegram } from "@/lib/notify";

const schema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  reason: z.string().optional().nullable(),
});

// Rozpatrzenie wniosku (manager) lub edycja powodu (autor, gdy PENDING).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const item = await prisma.leaveRequest.findUnique({ where: { id: params.id }, include: { user: { select: { name: true, email: true, telegramChatId: true } } } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const manager = isManager(s.role);
  if (!manager && item.userId !== s.sub) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;

  const decided = manager && d.status && d.status !== item.status;
  const updated = await prisma.leaveRequest.update({
    where: { id: params.id },
    data: {
      status: manager ? d.status ?? undefined : undefined,
      reason: d.reason ?? undefined,
      decidedBy: decided ? s.name || s.email : undefined,
      decidedAt: decided ? new Date() : undefined,
    },
  });

  // Powiadom pracownika o decyzji (Telegram 1:1, jeśli ma chatId).
  if (decided && item.user.telegramChatId) {
    const fmt = (dt: Date) => new Date(dt).toLocaleDateString("pl-PL");
    const verdict = d.status === "APPROVED" ? "✅ zaakceptowany" : d.status === "REJECTED" ? "❌ odrzucony" : "zmieniony";
    await sendTelegram(
      `🏖️ <b>Wniosek urlopowy ${verdict}</b>\n${leaveTypeLabel(item.type)}: ${fmt(item.startDate)}–${fmt(item.endDate)} (${item.days} dni rob.)`,
      item.user.telegramChatId
    );
  }

  return NextResponse.json({ item: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const item = await prisma.leaveRequest.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const manager = isManager(s.role);
  // Pracownik może usunąć tylko swój i tylko gdy jeszcze oczekuje.
  if (!manager && (item.userId !== s.sub || item.status !== "PENDING"))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await prisma.leaveRequest.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
