import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  logoUrl: z.string().optional().nullable(),
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
  lockmeWidget: z.string().optional().nullable(),
  lockmeApiUrl: z.string().optional().nullable(),
  lockmeApiKey: z.string().optional().nullable(),
  lockmeRoomId: z.string().optional().nullable(),
  googleSyncEnabled: z.coerce.boolean().optional(),
  googleClientEmail: z.string().optional().nullable(),
  googlePrivateKey: z.string().optional().nullable(),
  googleCalendarId: z.string().optional().nullable(),
  aboutPl: z.string().optional(),
  aboutEn: z.string().optional(),
  mapEmbed: z.string().optional().nullable(),
  mapLink: z.string().optional().nullable(),
  promoMode: z.enum(["OFF", "COUNTDOWN", "BANNER"]).optional(),
  promoTitlePl: z.string().optional(),
  promoTitleEn: z.string().optional(),
  promoTextPl: z.string().optional(),
  promoTextEn: z.string().optional(),
  promoCtaLabelPl: z.string().optional(),
  promoCtaLabelEn: z.string().optional(),
  promoCtaUrl: z.string().optional().nullable(),
  promoDate: z.string().optional().nullable(),
  googleReviewsEnabled: z.coerce.boolean().optional(),
  googleReviewsUrl: z.string().optional().nullable(),
  googleRating: z.string().optional().nullable(),
});

export async function GET() {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });

  const { promoDate, ...rest } = parsed.data;
  const data: any = { ...rest };
  if (promoDate !== undefined) {
    data.promoDate = promoDate ? new Date(promoDate) : null;
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: data,
    create: { id: "main", ...data },
  });
  return NextResponse.json({ settings });
}
