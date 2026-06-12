import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { paymentSettings, startCheckout, resolveOrigin } from "@/lib/payments";

export const dynamic = "force-dynamic";

const schema = z.object({
  amount: z.coerce.number().min(20).max(5000), // zł
  buyerName: z.string().optional().nullable(),
  buyerEmail: z.string().email("Podaj poprawny e-mail"),
});

// Publiczny zakup bonu online.
export async function POST(req: NextRequest) {
  const cfg = await paymentSettings();
  if (!cfg.enabled || !cfg.voucherSale) return NextResponse.json({ error: "Sprzedaż bonów online jest wyłączona" }, { status: 400 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;

  const payment = await prisma.payment.create({
    data: {
      provider: cfg.provider,
      purpose: "VOUCHER",
      amount: Math.round(d.amount * 100),
      description: `Bon podarunkowy ${d.amount} zł`,
      buyerName: (d.buyerName || "").trim() || null,
      buyerEmail: d.buyerEmail,
    },
  });

  try {
    const url = await startCheckout(payment.id, resolveOrigin(req.headers));
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Nie udało się rozpocząć płatności" }, { status: 500 });
  }
}
