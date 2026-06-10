import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signCustomerToken } from "@/lib/customerToken";
import { sendMail } from "@/lib/notify";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().email(), locale: z.enum(["pl", "en"]).optional() });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ ok: true }); // bez ujawniania
  const email = parsed.data.email.trim().toLowerCase();
  const locale = parsed.data.locale || "pl";

  // Wyślij link tylko jeśli są jakieś rezerwacje na ten e-mail (anty-spam),
  // ale odpowiadaj zawsze tak samo (anty-enumeracja).
  const count = await prisma.reservation.count({ where: { customerEmail: email } });
  if (count > 0) {
    const token = await signCustomerToken(email);
    const link = `${siteUrl()}/${locale}/moje-rezerwacje?token=${token}`;
    const pl = locale === "pl";
    await sendMail({
      to: email,
      subject: pl ? "Twoje rezerwacje — Mysterium" : "Your bookings — Mysterium",
      text: pl
        ? `Otwórz link, aby zobaczyć i zarządzać swoimi rezerwacjami (ważny 30 dni):\n${link}`
        : `Open the link to view and manage your bookings (valid 30 days):\n${link}`,
    });
  }
  return NextResponse.json({ ok: true });
}
