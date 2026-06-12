import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canExpenses, canFinance, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  date: z.string().optional(),
  category: z.enum(["ZAKUP", "NAPRAWA", "KONSERWACJA", "MEDIA", "MARKETING", "INNE"]).optional(),
  description: z.string().min(1).optional(),
  amount: z.coerce.number().min(0).optional(),
  vendor: z.string().optional().nullable(),
  invoiceNo: z.string().optional().nullable(),
  invoiceUrl: z.string().optional().nullable(),
});

// Edytować/usuwać może: zarządzający, Księgowa, albo autor wpisu.
function canModify(role: any, sub: string, createdById: string | null) {
  return isManager(role) || canFinance(role) || createdById === sub;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canExpenses(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const item = await prisma.expense.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canModify(s.role, s.sub, item.createdById)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const updated = await prisma.expense.update({
    where: { id: params.id },
    data: {
      date: d.date ? new Date(`${d.date.slice(0, 10)}T00:00:00.000Z`) : undefined,
      category: d.category,
      description: d.description,
      amount: d.amount,
      vendor: d.vendor ?? undefined,
      invoiceNo: d.invoiceNo ?? undefined,
      invoiceUrl: d.invoiceUrl ?? undefined,
    },
  });
  return NextResponse.json({ item: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canExpenses(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const item = await prisma.expense.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canModify(s.role, s.sub, item.createdById)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
