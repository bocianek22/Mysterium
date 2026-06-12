import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canOps, canOpsManage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["OPEN", "DONE"]).optional(),
  type: z.enum(["RESET", "BATERIE", "USTERKA", "NAPRAWA", "PRZEGLAD", "INNE"]).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]).optional(),
  dueDate: z.string().optional().nullable(),
  roomId: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canOps(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const cur = await prisma.maintenanceLog.findUnique({ where: { id: params.id } });
  if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const closing = d.status === "DONE" && cur.status !== "DONE";
  const reopening = d.status === "OPEN" && cur.status !== "OPEN";
  const item = await prisma.maintenanceLog.update({
    where: { id: params.id },
    data: {
      status: d.status,
      type: d.type,
      description: d.description,
      priority: d.priority,
      roomId: d.roomId === undefined ? undefined : d.roomId || null,
      dueDate: d.dueDate === undefined ? undefined : d.dueDate ? new Date(`${d.dueDate.slice(0, 10)}T00:00:00.000Z`) : null,
      resolvedAt: closing ? new Date() : reopening ? null : undefined,
      resolvedByName: closing ? s.name || s.email : reopening ? null : undefined,
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canOps(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const cur = await prisma.maintenanceLog.findUnique({ where: { id: params.id } });
  if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canOpsManage(s.role) && cur.createdById !== s.sub) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await prisma.maintenanceLog.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
