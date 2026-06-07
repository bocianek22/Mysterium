import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canOpsManage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  kind: z.enum(["OPEN", "CLOSE"]).default("OPEN"),
  label: z.string().min(1, "Treść jest wymagana"),
  order: z.coerce.number().optional(),
});

export async function GET() {
  const s = await getSession();
  if (!s || !canOpsManage(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const items = await prisma.checklistItem.findMany({ orderBy: [{ kind: "asc" }, { order: "asc" }] });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !canOpsManage(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const count = await prisma.checklistItem.count({ where: { kind: d.kind } });
  const item = await prisma.checklistItem.create({ data: { kind: d.kind, label: d.label, order: d.order ?? count } });
  return NextResponse.json({ item });
}
