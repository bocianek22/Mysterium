import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
  note: z.string().optional().nullable(),
  userId: z.string().optional(), // tylko manager może dodać dla kogoś
});

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const where: any = {};
  if (!isManager(s.role)) where.userId = s.sub;
  else if (userId) where.userId = userId;

  const items = await prisma.availability.findMany({
    where,
    orderBy: { start: "asc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const userId = isManager(s.role) && d.userId ? d.userId : s.sub;
  const item = await prisma.availability.create({
    data: {
      userId,
      start: new Date(d.start),
      end: new Date(d.end),
      note: d.note || null,
      status: isManager(s.role) ? "APPROVED" : "PENDING",
    },
  });
  return NextResponse.json({ item });
}
