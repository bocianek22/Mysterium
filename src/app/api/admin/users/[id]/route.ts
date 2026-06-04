import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional().or(z.literal("")),
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.enum(["OWNER", "ADMIN", "EMPLOYEE"]).optional(),
  active: z.coerce.boolean().optional(),
  rateDay: z.coerce.number().min(0).optional(),
  rateNight: z.coerce.number().min(0).optional(),
  rateWeekend: z.coerce.number().min(0).optional(),
  calendarEmbed: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = await getSession();
  if (!s || !isManager(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Nieprawidłowe dane" },
      { status: 400 }
    );
  const d = parsed.data;

  // Nie pozwól pozbawić systemu ostatniego właściciela
  if (d.role && d.role !== "OWNER") {
    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (target?.role === "OWNER") {
      const owners = await prisma.user.count({ where: { role: "OWNER" } });
      if (owners <= 1)
        return NextResponse.json(
          { error: "Nie można zmienić roli jedynego właściciela" },
          { status: 400 }
        );
    }
  }

  const data: any = {
    email: d.email,
    name: d.name ?? undefined,
    phone: d.phone ?? undefined,
    role: d.role,
    active: d.active,
    rateDay: d.rateDay,
    rateNight: d.rateNight,
    rateWeekend: d.rateWeekend,
    calendarEmbed: d.calendarEmbed ?? undefined,
  };
  if (d.password) data.passwordHash = await hashPassword(d.password);

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true },
  });
  return NextResponse.json({ item: user });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const s = await getSession();
  if (!s || !isManager(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (params.id === s.sub)
    return NextResponse.json(
      { error: "Nie możesz usunąć własnego konta" },
      { status: 400 }
    );
  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (target?.role === "OWNER") {
    const owners = await prisma.user.count({ where: { role: "OWNER" } });
    if (owners <= 1)
      return NextResponse.json(
        { error: "Nie można usunąć jedynego właściciela" },
        { status: 400 }
      );
  }
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
