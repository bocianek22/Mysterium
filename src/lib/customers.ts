// Mini-CRM: pomocnicze funkcje dla bazy klientów.
import { prisma } from "./prisma";

export function parseTags(json?: string | null): string[] {
  try {
    const t = json ? JSON.parse(json) : [];
    return Array.isArray(t) ? t.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function stringifyTags(tags: unknown): string {
  const arr = Array.isArray(tags) ? tags.filter((x) => typeof x === "string" && x.trim()).map((x) => (x as string).trim()) : [];
  return JSON.stringify(Array.from(new Set(arr)));
}

export function normEmail(e?: string | null): string | null {
  const v = (e || "").trim().toLowerCase();
  return v || null;
}

export function normPhone(p?: string | null): string | null {
  const v = (p || "").replace(/[\s()-]/g, "").trim();
  return v || null;
}

// Znajduje lub tworzy klienta na podstawie danych z rezerwacji/kontaktu i zwraca id.
// Łączenie: po e-mailu (priorytet), w przeciwnym razie po telefonie.
export async function findOrCreateCustomer(input: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  source?: string;
}): Promise<string | null> {
  const email = normEmail(input.email);
  const phone = normPhone(input.phone);
  const name = (input.name || "").trim() || null;
  if (!email && !phone && !name) return null;

  let existing = null;
  if (email) existing = await prisma.customer.findUnique({ where: { email } });
  if (!existing && phone) existing = await prisma.customer.findFirst({ where: { phone } });

  if (existing) {
    // Uzupełnij brakujące pola (nie nadpisujemy istniejących danych klienta).
    const data: any = {};
    if (!existing.name && name) data.name = name;
    if (!existing.phone && phone) data.phone = phone;
    if (!existing.email && email) data.email = email;
    if (Object.keys(data).length) await prisma.customer.update({ where: { id: existing.id }, data });
    return existing.id;
  }

  const created = await prisma.customer.create({
    data: { name, email, phone, source: input.source || "RESERVATION" },
  });
  return created.id;
}
