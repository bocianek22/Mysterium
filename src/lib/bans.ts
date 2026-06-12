import { prisma } from "./prisma";

export function normalizePhone(v?: string | null): string {
  return (v || "").replace(/[^\d+]/g, "");
}
export function normalizeEmail(v?: string | null): string {
  return (v || "").trim().toLowerCase();
}

// Sprawdza, czy dane klienta (e-mail / telefon / IP) są zbanowane.
export async function isBanned(opts: { email?: string | null; phone?: string | null; ip?: string | null }): Promise<boolean> {
  const candidates: { type: string; value: string }[] = [];
  const email = normalizeEmail(opts.email);
  const phone = normalizePhone(opts.phone);
  const ip = (opts.ip || "").trim();
  if (email) candidates.push({ type: "EMAIL", value: email });
  if (phone) candidates.push({ type: "PHONE", value: phone });
  if (ip) candidates.push({ type: "IP", value: ip });
  if (!candidates.length) return false;
  const hit = await prisma.bookingBan.findFirst({ where: { OR: candidates } });
  return !!hit;
}
