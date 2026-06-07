import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canExpenses } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { monthRange } from "@/lib/payroll";

const schema = z.object({
  date: z.string().min(1), // YYYY-MM-DD
  category: z.enum(["ZAKUP", "NAPRAWA", "KONSERWACJA", "MEDIA", "MARKETING", "INNE"]).default("INNE"),
  description: z.string().min(1, "Opis jest wymagany"),
  amount: z.coerce.number().min(0).default(0),
  vendor: z.string().optional().nullable(),
  invoiceNo: z.string().optional().nullable(),
  invoiceUrl: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || !canExpenses(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const year = Number(searchParams.get("y")) || now.getUTCFullYear();
  const month = searchParams.get("m") !== null ? Number(searchParams.get("m")) : now.getUTCMonth();
  const { start, end } = monthRange(year, month);

  const items = await prisma.expense.findMany({ where: { date: { gte: start, lt: end } }, orderBy: { date: "desc" } });
  const total = items.reduce((a, e) => a + (e.amount || 0), 0);
  return NextResponse.json({ items, total, year, month });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !canExpenses(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const item = await prisma.expense.create({
    data: {
      date: new Date(`${d.date.slice(0, 10)}T00:00:00.000Z`),
      category: d.category,
      description: d.description,
      amount: d.amount,
      vendor: d.vendor || null,
      invoiceNo: d.invoiceNo || null,
      invoiceUrl: d.invoiceUrl || null,
      createdById: s.sub,
      createdByName: s.name || s.email,
    },
  });
  return NextResponse.json({ item });
}
