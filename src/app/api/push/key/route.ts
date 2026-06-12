import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" }, select: { vapidPublicKey: true, pushEnabled: true } });
  return NextResponse.json({ publicKey: s?.pushEnabled ? s.vapidPublicKey : null, enabled: !!s?.pushEnabled });
}
