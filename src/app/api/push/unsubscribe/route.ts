import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { endpoint } = await req.json().catch(() => ({ endpoint: "" }));
  if (endpoint) await prisma.pushSub.deleteMany({ where: { endpoint } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
