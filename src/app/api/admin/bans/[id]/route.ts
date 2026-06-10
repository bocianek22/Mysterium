import { NextRequest, NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await prisma.bookingBan.delete({ where: { id: params.id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
