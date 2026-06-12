import { NextResponse } from "next/server";
import { getSession, canCustomers } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findOrCreateCustomer } from "@/lib/customers";

// Importuje klientów z istniejących rezerwacji (jednorazowo / na żądanie).
export async function POST() {
  const s = await getSession();
  if (!s || !canCustomers(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const reservations = await prisma.reservation.findMany({
    where: { customerId: null, OR: [{ customerName: { not: null } }, { customerEmail: { not: null } }, { customerPhone: { not: null } }] },
    select: { id: true, customerName: true, customerEmail: true, customerPhone: true },
  });

  let linked = 0;
  for (const r of reservations) {
    const customerId = await findOrCreateCustomer({ name: r.customerName, email: r.customerEmail, phone: r.customerPhone });
    if (customerId) {
      await prisma.reservation.update({ where: { id: r.id }, data: { customerId } });
      linked++;
    }
  }
  return NextResponse.json({ ok: true, linked });
}
