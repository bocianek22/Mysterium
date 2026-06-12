import { getSession, canFinance } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const s = await getSession();
  if (!s || !canFinance(s.role)) return new Response("Forbidden", { status: 403 });
  const rows = await prisma.reservation.findMany({ orderBy: { start: "desc" }, include: { assignedUser: { select: { name: true, email: true } }, room: { select: { namePl: true } } } });
  const csv = toCsv(
    ["Nr", "Data", "Tytuł", "Pokój", "Status", "Osób", "Klient", "Telefon", "E-mail", "Prowadzi", "Przychód", "Zaliczka", "Opłacone", "Paliwo", "Inne", "Zysk"],
    rows.map((r) => [
      r.refNo,
      new Date(r.start).toLocaleString("pl-PL"),
      r.title,
      r.room?.namePl || "",
      r.status,
      r.people,
      r.customerName,
      r.customerPhone,
      r.customerEmail,
      r.assignedUser?.name || r.assignedUser?.email || "",
      r.price,
      r.deposit,
      r.paid ? "tak" : "nie",
      r.fuelCost,
      r.otherCost,
      (r.price || 0) - (r.fuelCost || 0) - (r.otherCost || 0),
    ])
  );
  return csvResponse(`rezerwacje-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
