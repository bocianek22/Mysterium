import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canFinance } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paymentSettings } from "@/lib/payments";

const schema = z.object({
  amount: z.coerce.number().min(1).max(100000), // zł
  description: z.string().min(1, "Opis jest wymagany"),
  buyerName: z.string().optional().nullable(),
  buyerEmail: z.string().email().optional().or(z.literal("")).nullable(),
});

export async function GET() {
  const s = await getSession();
  if (!s || !canFinance(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const items = await prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const cfg = await paymentSettings();
  return NextResponse.json({ items, cfg });
}

// Tworzy żądanie płatności (event/wycena, zadatek lub całość — kwotę ustala wystawiający).
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !canFinance(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const cfg = await paymentSettings();
  if (!cfg.enabled) return NextResponse.json({ error: "Płatności online są wyłączone (Ustawienia → Płatności)" }, { status: 400 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const item = await prisma.payment.create({
    data: {
      provider: cfg.provider,
      purpose: "EVENT",
      amount: Math.round(d.amount * 100),
      description: d.description,
      buyerName: (d.buyerName || "").trim() || null,
      buyerEmail: (d.buyerEmail || "").trim() || null,
      createdById: s.sub,
    },
  });
  return NextResponse.json({ item });
}
