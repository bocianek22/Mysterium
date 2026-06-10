import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
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
  tiktok: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
  parkingPl: z.string().optional().nullable(),
  parkingEn: z.string().optional().nullable(),
  openHoursJson: z.string().optional().nullable(),
  slotStepMin: z.coerce.number().min(15).max(480).optional(),
  slotsEnabled: z.coerce.boolean().optional(),
  weekendSurchargePct: z.coerce.number().min(0).max(200).optional(),
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
  telegramEnabled: z.coerce.boolean().optional(),
  telegramBotToken: z.string().optional().nullable(),
  telegramChatId: z.string().optional().nullable(),
  emailNotifyEnabled: z.coerce.boolean().optional(),
  notifyOnReservation: z.coerce.boolean().optional(),
  notifyOnMessage: z.coerce.boolean().optional(),
  notifyOnSchedule: z.coerce.boolean().optional(),
  clockCodeMode: z.enum(["STATIC", "DYNAMIC"]).optional(),
  autoThankYouEnabled: z.coerce.boolean().optional(),
  surveyEnabled: z.coerce.boolean().optional(),
  loyaltyPerGame: z.coerce.number().min(0).max(1000).optional(),
  thankYouMessagePl: z.string().optional().nullable(),
  newsletterDiscountEnabled: z.coerce.boolean().optional(),
  newsletterDiscountPct: z.coerce.number().min(0).max(100).optional(),
  newsletterDiscountCode: z.string().optional().nullable(),
  reminderEnabled: z.coerce.boolean().optional(),
  reminderLeadHours: z.coerce.number().min(1).max(168).optional(),
  reminderSubject: z.string().optional().nullable(),
  reminderBody: z.string().optional().nullable(),
  voucherEmailSubject: z.string().optional().nullable(),
  voucherEmailBody: z.string().optional().nullable(),
  payEmailSubject: z.string().optional().nullable(),
  payEmailBody: z.string().optional().nullable(),
  popupMode: z.enum(["OFF", "PROMO", "NEWSLETTER"]).optional(),
  popupTitlePl: z.string().optional(),
  popupTitleEn: z.string().optional(),
  popupTextPl: z.string().optional(),
  popupTextEn: z.string().optional(),
  popupImage: z.string().optional().nullable(),
  popupCtaLabelPl: z.string().optional(),
  popupCtaLabelEn: z.string().optional(),
  popupCtaUrl: z.string().optional().nullable(),
  popupDelaySec: z.coerce.number().min(0).optional(),
  paymentsEnabled: z.coerce.boolean().optional(),
  paymentProvider: z.enum(["STRIPE", "P24"]).optional(),
  voucherSaleEnabled: z.coerce.boolean().optional(),
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
  logAudit(s, "SETTINGS", "settings", "Zapis ustawień strony");
  return NextResponse.json({ settings });
}
