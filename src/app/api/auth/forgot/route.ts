import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/notify";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  // Zawsze ok — bez ujawniania, czy konto istnieje
  if (!parsed.success) return NextResponse.json({ ok: true });
  const email = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.active) {
    const token = crypto.randomBytes(24).toString("hex");
    await prisma.passwordReset.create({ data: { token, userId: user.id, expiresAt: new Date(Date.now() + 3600 * 1000) } });
    const link = `${siteUrl()}/admin/reset/${token}`;
    await sendMail({
      to: email,
      subject: "Reset hasła — Panel Mysterium",
      text: `Aby ustawić nowe hasło, otwórz link (ważny 1 godzinę):\n${link}\n\nJeśli to nie Ty, zignoruj tę wiadomość.`,
    });
  }
  return NextResponse.json({ ok: true });
}
