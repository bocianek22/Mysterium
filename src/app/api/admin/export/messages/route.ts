import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSession();
  if (!s || !isManager(s.role)) return new Response("Forbidden", { status: 403 });
  const rows = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  const csv = toCsv(
    ["Data", "Imię", "E-mail", "Telefon", "Temat", "Kupon", "Wiadomość", "Przeczytane"],
    rows.map((m) => [new Date(m.createdAt).toLocaleString("pl-PL"), m.name, m.email, m.phone, m.subject, m.coupon, m.message, m.read ? "tak" : "nie"])
  );
  return csvResponse(`wiadomosci-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
