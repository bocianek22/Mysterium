import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  userId: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  note: z.string().optional().nullable(),
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
  const item = await prisma.shift.update({
    where: { id: params.id },
    data: {
      userId: d.userId,
      start: d.start ? new Date(d.start) : undefined,
      end: d.end ? new Date(d.end) : undefined,
      note: d.note ?? undefined,
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
  await prisma.shift.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
