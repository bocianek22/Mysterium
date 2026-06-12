import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail, sendTelegram } from "@/lib/notify";
import { normEmail } from "@/lib/customers";

const schema = z.object({
  subject: z.string().min(1, "Temat jest wymagany"),
  body: z.string().min(1, "Treść jest wymagana"),
  channel: z.enum(["EMAIL", "TELEGRAM", "BOTH"]).default("EMAIL"),
  audience: z.string().default("ALL"), // ALL | nazwa tagu
});

export async function GET() {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const items = await prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  // ilu klientów ma zgodę marketingową + e-mail (potencjalny zasięg)
  const consented = await prisma.customer.count({ where: { marketingConsent: true, NOT: { email: null } } });
  return NextResponse.json({ items, reach: consented });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;

  const where: any = { marketingConsent: true };
  if (d.audience && d.audience !== "ALL") where.tagsJson = { contains: `"${d.audience}"` };
  const customers = await prisma.customer.findMany({ where, select: { email: true } });
  const emails = Array.from(new Set(customers.map((c) => normEmail(c.email)).filter(Boolean) as string[]));

  const results: string[] = [];
  let mailOk = false;

  if (d.channel === "EMAIL" || d.channel === "BOTH") {
    if (emails.length === 0) {
      results.push("e-mail: brak odbiorców ze zgodą");
    } else {
      const r = await sendMail({ bcc: emails, subject: d.subject, text: d.body });
      mailOk = r.ok;
      results.push(r.ok ? `e-mail: wysłano do ${emails.length}` : `e-mail: błąd (${r.error})`);
    }
  }

  if (d.channel === "TELEGRAM" || d.channel === "BOTH") {
    const ok = await sendTelegram(`📣 <b>${escapeHtml(d.subject)}</b>\n${escapeHtml(d.body)}`);
    results.push(ok ? "Telegram: wysłano na grupę zespołu" : "Telegram: nieaktywny/błąd");
  }

  const result = results.join(" · ");
  await prisma.campaign.create({
    data: { subject: d.subject, body: d.body, channel: d.channel, audience: d.audience, recipients: emails.length, result, sentByName: s.name || s.email },
  });

  const anyOk = mailOk || results.some((r) => r.includes("wysłano"));
  return NextResponse.json({ ok: anyOk, result, recipients: emails.length });
}

function escapeHtml(t: string) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
