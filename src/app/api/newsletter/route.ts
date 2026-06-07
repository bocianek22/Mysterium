import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normEmail } from "@/lib/customers";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email("Podaj poprawny adres e-mail"),
  name: z.string().optional().nullable(),
});

// Publiczny zapis do newslettera — dodaje/aktualizuje klienta ze zgodą marketingową.
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" }, { status: 400 });
  const email = normEmail(parsed.data.email);
  if (!email) return NextResponse.json({ error: "Podaj adres e-mail" }, { status: 400 });
  const name = (parsed.data.name || "").trim() || null;

  try {
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      await prisma.customer.update({ where: { email }, data: { marketingConsent: true, ...(name && !existing.name ? { name } : {}) } });
    } else {
      await prisma.customer.create({ data: { email, name, marketingConsent: true, source: "NEWSLETTER" } });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nie udało się zapisać. Spróbuj ponownie." }, { status: 500 });
  }
}
