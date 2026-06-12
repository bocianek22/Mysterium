import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, verifyCredentials, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  current: z.string().min(1, "Podaj obecne hasło"),
  next: z.string().min(8, "Nowe hasło musi mieć min. 8 znaków"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });

  const user = await verifyCredentials(session.email, parsed.data.current);
  if (!user) return NextResponse.json({ error: "Obecne hasło jest nieprawidłowe" }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.next) } });
  return NextResponse.json({ ok: true });
}
