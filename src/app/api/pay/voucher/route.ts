import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { paymentSettings, startCheckout } from "@/lib/payments";

export const dynamic = "force-dynamic";

const schema = z.object({
  amount: z.coerce.number().min(20).max(5000), // zł
  buyerName: z.string().optional().nullable(),
  buyerEmail: z.string().email("Podaj poprawny e-mail"),
});

function origin(req: NextRequest) {
  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

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
    const url = await startCheckout(payment.id, origin(req));
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Nie udało się rozpocząć płatności" }, { status: 500 });
  }
}
