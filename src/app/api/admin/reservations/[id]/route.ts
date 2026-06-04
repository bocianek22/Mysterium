import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().optional(),
  roomId: z.string().optional().nullable(),
  start: z.string().optional(),
  end: z.string().optional(),
  people: z.coerce.number().min(0).optional(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = await getSession();
  if (!s || !isManager(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const item = await prisma.reservation.update({
    where: { id: params.id },
    data: {
      title: d.title,
      roomId: d.roomId === undefined ? undefined : d.roomId || null,
      start: d.start ? new Date(d.start) : undefined,
      end: d.end ? new Date(d.end) : undefined,
      people: d.people,
      customerName: d.customerName ?? undefined,
      customerPhone: d.customerPhone ?? undefined,
      customerEmail: d.customerEmail ?? undefined,
      notes: d.notes ?? undefined,
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = await getSession();
  if (!s || !isManager(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await prisma.reservation.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
