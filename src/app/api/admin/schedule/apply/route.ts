import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  shifts: z.array(
    z.object({
      userId: z.string(),
      start: z.string(),
      end: z.string(),
      type: z.string().optional(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });

  const data = parsed.data.shifts.map((sh) => ({
    userId: sh.userId,
    start: new Date(sh.start),
    end: new Date(sh.end),
    note: sh.type === "mobile" ? "Wyjazd" : sh.type === "stationary" ? "Stacjonarne" : null,
  }));
  const res = await prisma.shift.createMany({ data });
  return NextResponse.json({ ok: true, created: res.count });
}
