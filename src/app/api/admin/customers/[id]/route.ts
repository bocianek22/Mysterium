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
  points: z.coerce.number().int().optional(),
  pointsDelta: z.coerce.number().int().optional(),
  welcomeCodeUsed: z.coerce.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canCustomers(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const c = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      reservations: {
        orderBy: { start: "desc" },
        select: { id: true, refNo: true, title: true, start: true, people: true, price: true, status: true, room: { select: { namePl: true } } },
      },
    },
  });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ customer: { ...c, tags: parseTags(c.tagsJson) } });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canCustomers(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const email = d.email !== undefined ? normEmail(d.email) : undefined;
  if (email) {
    const other = await prisma.customer.findUnique({ where: { email } });
    if (other && other.id !== params.id) return NextResponse.json({ error: "Inny klient ma już ten e-mail" }, { status: 400 });
  }
  const item = await prisma.customer.update({
    where: { id: params.id },
    data: {
      name: d.name !== undefined ? (d.name || "").trim() || null : undefined,
      email,
      phone: d.phone !== undefined ? normPhone(d.phone) : undefined,
      company: d.company !== undefined ? (d.company || "").trim() || null : undefined,
      marketingConsent: d.marketingConsent,
      tagsJson: d.tags !== undefined ? stringifyTags(d.tags) : undefined,
      notes: d.notes ?? undefined,
      points: d.pointsDelta !== undefined ? { increment: d.pointsDelta } : d.points !== undefined ? Math.max(0, d.points) : undefined,
      welcomeCodeUsedAt: d.welcomeCodeUsed === undefined ? undefined : d.welcomeCodeUsed ? new Date() : null,
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s || !canCustomers(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
