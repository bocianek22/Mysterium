import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canOps, canOpsManage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(["BILETY", "GADZETY", "AKCESORIA", "MATERIALY", "INNE"]).optional(),
  unit: z.string().optional().nullable(),
  lowStock: z.coerce.number().int().min(0).optional(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canOps(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const item = await prisma.inventoryItem.findUnique({
    where: { id: params.id },
    include: { movements: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canOpsManage(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const item = await prisma.inventoryItem.update({
    where: { id: params.id },
    data: {
      name: d.name, category: d.category,
      unit: d.unit !== undefined ? (d.unit || "szt.").trim() || "szt." : undefined,
      lowStock: d.lowStock, location: d.location ?? undefined, notes: d.notes ?? undefined,
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canOpsManage(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await prisma.inventoryItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
