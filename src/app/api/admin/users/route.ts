import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Hasło min. 6 znaków"),
  name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["OWNER", "ADMIN", "EMPLOYEE", "CODE"]).default("EMPLOYEE"),
  active: z.coerce.boolean().default(true),
  rateDay: z.coerce.number().min(0).default(0),
  rateNight: z.coerce.number().min(0).default(0),
  rateWeekend: z.coerce.number().min(0).default(0),
  canStationary: z.coerce.boolean().default(true),
  canMobile: z.coerce.boolean().default(true),
  targetHours: z.coerce.number().min(0).default(0),
  ratesJson: z.string().optional().nullable(),
  contractType: z.string().optional().nullable(),
  telegramHandle: z.string().optional().nullable(),
  telegramChatId: z.string().optional().nullable(),
  calendarEmbed: z.string().optional().nullable(),
});

const SAFE = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  active: true,
  rateDay: true,
  rateNight: true,
  rateWeekend: true,
  canStationary: true,
  canMobile: true,
  targetHours: true,
  ratesJson: true,
  contractType: true,
  telegramHandle: true,
  telegramChatId: true,
  calendarEmbed: true,
  calendarToken: true,
  createdAt: true,
} as const;

export async function GET() {
  const s = await getSession();
  if (!s || !isManager(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: SAFE,
  });
  return NextResponse.json({ items: users });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" },
      { status: 400 }
    );
  const d = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: d.email } });
  if (exists)
    return NextResponse.json({ error: "Taki e-mail już istnieje" }, { status: 400 });

  const user = await prisma.user.create({
    data: {
      email: d.email,
      passwordHash: await hashPassword(d.password),
      name: d.name || null,
      phone: d.phone || null,
      role: d.role,
      active: d.active,
      rateDay: d.rateDay,
      rateNight: d.rateNight,
      rateWeekend: d.rateWeekend,
      canStationary: d.canStationary,
      canMobile: d.canMobile,
      targetHours: d.targetHours,
      ratesJson: d.ratesJson || "{}",
      contractType: d.contractType || null,
      telegramHandle: d.telegramHandle || null,
      telegramChatId: d.telegramChatId || null,
      calendarEmbed: d.calendarEmbed || null,
    },
    select: SAFE,
  });
  return NextResponse.json({ item: user });
}
