import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") || "").trim().toUpperCase();
  if (!code) return NextResponse.json({ valid: false });
  try {
    const v = await prisma.voucher.findUnique({ where: { code } });
    if (!v) return NextResponse.json({ valid: false });
    if (v.status === "REDEEMED") return NextResponse.json({ valid: false, redeemed: true });
    let expired = false;
    if (v.validUntil) {
      const d = new Date(v.validUntil);
      if (!isNaN(d.getTime()) && d.getTime() < Date.now()) expired = true;
    }
    if (expired) return NextResponse.json({ valid: false, expired: true });
    return NextResponse.json({ valid: true, titlePl: v.titlePl, titleEn: v.titleEn, validUntil: v.validUntil });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
