import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normEmail } from "@/lib/customers";
import { sendMail } from "@/lib/notify";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email("Podaj poprawny adres e-mail"),
  name: z.string().optional().nullable(),
});

function welcomeHtml(code: string, pct: number) {
  return `<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;background:#040c14;color:#e8dcc8;padding:28px;border-radius:12px;max-width:520px;margin:0 auto">
    <div style="font-family:Georgia,serif;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;font-size:13px">Mysterium — Escape Room</div>
    <h1 style="color:#e8c97a;font-size:26px;margin:14px 0 6px">Dziękujemy za zapis! 🗝️</h1>
    <p style="color:#9a8b75;line-height:1.7">Masz dla nas dobre oko — w nagrodę <b style="color:#e8dcc8">${pct}% zniżki</b> na grę w Mysterium (jednorazowo).</p>
    <div style="margin:22px 0;text-align:center">
      <div style="display:inline-block;border:1px dashed #c9a84c;border-radius:10px;padding:14px 26px">
        <div style="font-size:11px;letter-spacing:2px;color:#9a8b75;text-transform:uppercase">Twój kod</div>
        <div style="font-family:monospace;font-size:26px;letter-spacing:3px;color:#e8c97a;margin-top:4px">${code}</div>
      </div>
    </div>
    <p style="color:#9a8b75;line-height:1.7;font-size:13px">Podaj kod przy rezerwacji. Zniżka jednorazowa, do wykorzystania na jedną grę.</p>
    <p style="color:#5a5040;font-size:11px;margin-top:18px">Otrzymujesz tę wiadomość, bo zapisano ten adres do newslettera Mysterium.</p>
  </div>`;
}

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
  const email = normEmail(parsed.data.email);
  if (!email) return NextResponse.json({ error: "Podaj adres e-mail" }, { status: 400 });
  const name = (parsed.data.name || "").trim() || null;

  try {
    const existing = await prisma.customer.findUnique({ where: { email } });
    const customer = existing
      ? await prisma.customer.update({ where: { email }, data: { marketingConsent: true, ...(name && !existing.name ? { name } : {}) } })
      : await prisma.customer.create({ data: { email, name, marketingConsent: true, source: "NEWSLETTER" } });

    // Kod powitalny — tylko raz na klienta
    const s = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    let codeSent = false;
    if (s?.newsletterDiscountEnabled && s.newsletterDiscountCode?.trim() && !customer.welcomeCodeSentAt) {
      const res = await sendMail({
        to: email,
        subject: `Twój kod ${s.newsletterDiscountPct}% zniżki — Mysterium 🎁`,
        text: `Dziękujemy za zapis! Twój jednorazowy kod ${s.newsletterDiscountPct}% zniżki: ${s.newsletterDiscountCode.trim()}. Podaj go przy rezerwacji.`,
        html: welcomeHtml(s.newsletterDiscountCode.trim(), s.newsletterDiscountPct),
      });
      if (res.ok) { await prisma.customer.update({ where: { id: customer.id }, data: { welcomeCodeSentAt: new Date() } }); codeSent = true; }
    }
    return NextResponse.json({ ok: true, codeSent });
  } catch {
    return NextResponse.json({ error: "Nie udało się zapisać. Spróbuj ponownie." }, { status: 500 });
  }
}
