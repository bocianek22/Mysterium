import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  rating: z.coerce.number().min(1).max(5),
  nps: z.coerce.number().min(0).max(10).optional().nullable(),
  comment: z.string().max(2000).optional().nullable(),
});

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const survey = await prisma.survey.findUnique({ where: { token: params.token } });
  if (!survey) return NextResponse.json({ error: "Nie znaleziono ankiety" }, { status: 404 });
  if (survey.status === "DONE") return NextResponse.json({ error: "Ankieta została już wypełniona" }, { status: 400 });

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  const d = parsed.data;

  await prisma.survey.update({
    where: { token: params.token },
    data: { rating: d.rating, nps: d.nps ?? null, comment: (d.comment || "").trim() || null, status: "DONE", submittedAt: new Date() },
  });

  // Punkty lojalnościowe za wypełnienie (jeśli klient rozpoznany po e-mailu)
  if (survey.customerEmail) {
    await prisma.customer.updateMany({ where: { email: survey.customerEmail }, data: { points: { increment: 1 } } }).catch(() => {});
  }

  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  const googleUrl = d.rating >= 4 && s?.googleReviewsUrl?.trim() ? s.googleReviewsUrl.trim() : null;
  return NextResponse.json({ ok: true, googleUrl });
}
