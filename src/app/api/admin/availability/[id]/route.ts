import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  note: z.string().optional().nullable(),
  start: z.string().optional(),
  end: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const item = await prisma.availability.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Pracownik może edytować tylko swoje i nie zmienia statusu
  if (!isManager(s.role) && item.userId !== s.sub)
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const updated = await prisma.availability.update({
    where: { id: params.id },
    data: {
      status: isManager(s.role) ? d.status : undefined,
      note: d.note ?? undefined,
      start: d.start ? new Date(d.start) : undefined,
      end: d.end ? new Date(d.end) : undefined,
    },
  });
  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const item = await prisma.availability.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isManager(s.role) && item.userId !== s.sub)
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await prisma.availability.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
