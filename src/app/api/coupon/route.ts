import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") || "").trim().toUpperCase();
  if (!code) return NextResponse.json({ valid: false });
  try {
    const c = await prisma.discountCode.findUnique({ where: { code } });
    if (!c || !c.active) return NextResponse.json({ valid: false });
    if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) return NextResponse.json({ valid: false });
    return NextResponse.json({
      valid: true,
      kind: c.kind,
      value: c.value,
      descriptionPl: c.descriptionPl,
      descriptionEn: c.descriptionEn,
    });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
