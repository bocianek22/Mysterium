import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canOps } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function todayUTC() {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

// Widok checklisty na dziś — pozycje + status odhaczenia.
export async function GET() {
  const s = await getSession();
  if (!s || !canOps(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const date = todayUTC();
  const [items, checks] = await Promise.all([
    prisma.checklistItem.findMany({ where: { active: true }, orderBy: [{ kind: "asc" }, { order: "asc" }] }),
    prisma.checklistCheck.findMany({ where: { date } }),
  ]);
  const byItem = new Map(checks.map((c) => [c.itemId, c]));
  const result = items.map((i) => ({
    id: i.id, kind: i.kind, label: i.label, order: i.order,
    checked: byItem.has(i.id), doneByName: byItem.get(i.id)?.doneByName || null,
  }));
  return NextResponse.json({ items: result, date: date.toISOString() });
}

const toggleSchema = z.object({ itemId: z.string().min(1), checked: z.coerce.boolean() });

// Odhaczenie / odznaczenie pozycji na dziś.
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !canOps(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = toggleSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const date = todayUTC();
  const { itemId, checked } = parsed.data;
  if (checked) {
    await prisma.checklistCheck.upsert({
      where: { itemId_date: { itemId, date } },
      update: { doneByName: s.name || s.email },
      create: { itemId, date, doneByName: s.name || s.email },
    });
  } else {
    await prisma.checklistCheck.deleteMany({ where: { itemId, date } });
  }
  return NextResponse.json({ ok: true });
}
