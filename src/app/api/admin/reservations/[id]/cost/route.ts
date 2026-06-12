import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession, isManager, canFinance } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Dodawanie kosztów przez przypisanego pracownika (lub managera).
const schema = z.object({
  fuelCost: z.coerce.number().min(0).optional(),
  fuelInvoiceUrl: z.string().optional().nullable(),
  otherCost: z.coerce.number().min(0).optional(),
  otherInvoiceUrl: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const res = await prisma.reservation.findUnique({ where: { id: params.id } });
  if (!res) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // manager, księgowa, albo pracownik przypisany do tego zlecenia
  if (!isManager(s.role) && !canFinance(s.role) && res.assignedUserId !== s.sub) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;
  const item = await prisma.reservation.update({
    where: { id: params.id },
    data: {
      fuelCost: d.fuelCost,
      fuelInvoiceUrl: d.fuelInvoiceUrl ?? undefined,
      otherCost: d.otherCost,
      otherInvoiceUrl: d.otherInvoiceUrl ?? undefined,
      notes: d.note ?? undefined,
    },
  });
  return NextResponse.json({ item });
}
