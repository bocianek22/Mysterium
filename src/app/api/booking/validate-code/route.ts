import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { parsePricing, estimatePrice, applyDiscount } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const schema = z.object({ code: z.string().min(1), roomId: z.string().min(1), people: z.coerce.number().min(1).max(50) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const code = parsed.data.code.trim().toUpperCase();

  const dc = await prisma.discountCode.findUnique({ where: { code } });
  if (!dc || !dc.active) return NextResponse.json({ valid: false, error: "Kod nieaktywny lub nie istnieje" });
  if (dc.usageLimit > 0 && dc.usedCount >= dc.usageLimit) return NextResponse.json({ valid: false, error: "Kod został wykorzystany" });

  const room = await prisma.room.findUnique({ where: { id: parsed.data.roomId }, select: { pricingJson: true } });
  const base = estimatePrice(parsePricing(room?.pricingJson), parsed.data.people);
  const final = applyDiscount(base, dc.kind, dc.value);

  return NextResponse.json({
    valid: true,
    code,
    kind: dc.kind,
    value: dc.value,
    descriptionPl: dc.descriptionPl,
    descriptionEn: dc.descriptionEn,
    basePrice: base,
    finalPrice: final,
  });
}
