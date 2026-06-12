import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Hasło musi mieć min. 8 znaków"),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });

  const pr = await prisma.passwordReset.findUnique({ where: { token: parsed.data.token } });
  if (!pr || pr.usedAt || pr.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link wygasł lub jest nieprawidłowy. Poproś o nowy." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: pr.userId }, data: { passwordHash: await hashPassword(parsed.data.password) } }),
    prisma.passwordReset.update({ where: { id: pr.id }, data: { usedAt: new Date() } }),
  ]);
  return NextResponse.json({ ok: true });
}
