import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowa subskrypcja" }, { status: 400 });
  const { endpoint, keys } = parsed.data;

  await prisma.pushSub.upsert({
    where: { endpoint },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId: session?.sub || null },
    update: { p256dh: keys.p256dh, auth: keys.auth, userId: session?.sub || null },
  });
  return NextResponse.json({ ok: true });
}
