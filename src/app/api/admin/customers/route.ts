import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, canCustomers } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTags, stringifyTags, normEmail, normPhone } from "@/lib/customers";

const schema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  marketingConsent: z.coerce.boolean().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
});

function aggregate(reservations: { start: Date; price: number; status: string }[]) {
  const done = reservations.filter((r) => r.status !== "CANCELLED");
  const visits = done.length;
  const spend = done.reduce((a, r) => a + (r.price || 0), 0);
  const lastVisit = reservations.length ? reservations.reduce((m, r) => (r.start > m ? r.start : m), reservations[0].start) : null;
  return { visits, spend, lastVisit };
}

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || !canCustomers(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const tag = (searchParams.get("tag") || "").trim();

  const where: any = {};
  if (q) where.OR = [
    { name: { contains: q, mode: "insensitive" } },
    { email: { contains: q, mode: "insensitive" } },
    { phone: { contains: q } },
    { company: { contains: q, mode: "insensitive" } },
  ];
  if (tag) where.tagsJson = { contains: `"${tag}"` };

  const rows = await prisma.customer.findMany({
    where,
    include: { reservations: { select: { start: true, price: true, status: true } } },
    take: 500,
  });

  const items = rows.map((c) => {
    const agg = aggregate(c.reservations);
    return {
      id: c.id, name: c.name, email: c.email, phone: c.phone, company: c.company,
      marketingConsent: c.marketingConsent, tags: parseTags(c.tagsJson), notes: c.notes, source: c.source, points: c.points,
      ...agg,
    };
  });
  items.sort((a, b) => (b.lastVisit ? b.lastVisit.getTime() : 0) - (a.lastVisit ? a.lastVisit.getTime() : 0));

  const consented = items.filter((i) => i.marketingConsent).length;
  return NextResponse.json({ items, total: items.length, consented });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !canCustomers(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const email = normEmail(d.email);
  if (email) {
    const exists = await prisma.customer.findUnique({ where: { email } });
    if (exists) return NextResponse.json({ error: "Klient z tym e-mailem już istnieje" }, { status: 400 });
  }
  const item = await prisma.customer.create({
    data: {
      name: (d.name || "").trim() || null,
      email,
      phone: normPhone(d.phone),
      company: (d.company || "").trim() || null,
      marketingConsent: d.marketingConsent || false,
      tagsJson: stringifyTags(d.tags || []),
      notes: d.notes || null,
      source: "MANUAL",
    },
  });
  return NextResponse.json({ item });
}
