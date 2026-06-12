import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canOps } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";
import { maintenanceTypeLabel } from "@/lib/ops";

const schema = z.object({
  roomId: z.string().optional().nullable(),
  type: z.enum(["RESET", "BATERIE", "USTERKA", "NAPRAWA", "PRZEGLAD", "INNE"]).default("USTERKA"),
  description: z.string().min(1, "Opis jest wymagany"),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).default("NORMAL"),
  dueDate: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || !canOps(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const status = new URL(req.url).searchParams.get("status"); // OPEN | DONE | null=all
  const where: any = {};
  if (status === "OPEN" || status === "DONE") where.status = status;
  const items = await prisma.maintenanceLog.findMany({
    where,
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
    include: { room: { select: { namePl: true } } },
    take: 300,
  });
  const openCount = await prisma.maintenanceLog.count({ where: { status: "OPEN" } });
  return NextResponse.json({ items, openCount });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !canOps(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const item = await prisma.maintenanceLog.create({
    data: {
      roomId: d.roomId || null,
      type: d.type,
      description: d.description,
      priority: d.priority,
      dueDate: d.dueDate ? new Date(`${d.dueDate.slice(0, 10)}T00:00:00.000Z`) : null,
      createdById: s.sub,
      createdByName: s.name || s.email,
    },
    include: { room: { select: { namePl: true } } },
  });

  // Powiadom zespół o pilnym zgłoszeniu.
  if (d.priority === "HIGH") {
    notify({
      type: "schedule",
      title: "Pilne zgłoszenie konserwacji",
      lines: [`${maintenanceTypeLabel(d.type)}${item.room ? " · " + item.room.namePl : ""}`, d.description],
    }).catch(() => {});
  }
  return NextResponse.json({ item });
}
