import { prisma } from "./prisma";

// Zapis wpisu do dziennika audytu. Nie blokuje akcji w razie błędu.
export async function logAudit(
  user: { sub?: string; name?: string; email?: string } | null,
  action: string,
  entity: string,
  detail?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.sub || null,
        userName: user?.name || user?.email || null,
        action,
        entity,
        detail: detail ? detail.slice(0, 200) : null,
      },
    });
  } catch {
    /* audyt nie może wywrócić operacji */
  }
}
