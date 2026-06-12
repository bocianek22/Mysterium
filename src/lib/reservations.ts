import { prisma } from "./prisma";

// Generuje kolejny numer zlecenia: MYS-RRRR-NNNN
export async function nextRefNo(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.reservation.count();
  for (let i = 1; i <= 5; i++) {
    const candidate = `MYS-${year}-${String(count + i).padStart(4, "0")}`;
    const exists = await prisma.reservation.findUnique({ where: { refNo: candidate } });
    if (!exists) return candidate;
  }
  return `MYS-${year}-${Date.now().toString().slice(-5)}`;
}
