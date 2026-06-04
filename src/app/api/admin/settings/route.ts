import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  addressPl: z.string().optional(),
  addressEn: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  whatsapp: z.string().optional(),
  lockmeUrl: z.string().optional(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  hoursPl: z.string().optional(),
  hoursEn: z.string().optional(),
  heroDescPl: z.string().optional(),
  heroDescEn: z.string().optional(),
  promoVideoPl: z.string().optional().nullable(),
});

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: parsed.data,
    create: { id: "main", ...parsed.data },
  });
  return NextResponse.json({ settings });
}
