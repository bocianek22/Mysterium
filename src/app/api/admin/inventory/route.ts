import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canOps, canOpsManage } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana"),
  category: z.enum(["BILETY", "GADZETY", "AKCESORIA", "MATERIALY", "INNE"]).default("INNE"),
  quantity: z.coerce.number().int().min(0).default(0),
  unit: z.string().optional().nullable(),
  lowStock: z.coerce.number().int().min(0).default(0),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || !canOps(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const cat = new URL(req.url).searchParams.get("category");
  const where: any = {};
  if (cat) where.category = cat;
  const items = await prisma.inventoryItem.findMany({ where, orderBy: [{ category: "asc" }, { name: "asc" }] });
  const lowCount = items.filter((i) => i.lowStock > 0 && i.quantity <= i.lowStock).length;
  return NextResponse.json({ items, lowCount });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !canOpsManage(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const item = await prisma.inventoryItem.create({
    data: {
      name: d.name, category: d.category, quantity: d.quantity, unit: (d.unit || "szt.").trim() || "szt.",
      lowStock: d.lowStock, location: d.location || null, notes: d.notes || null,
    },
  });
  return NextResponse.json({ item });
}
