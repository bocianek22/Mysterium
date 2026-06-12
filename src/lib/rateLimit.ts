import { prisma } from "./prisma";

const WINDOW_MS = 15 * 60 * 1000; // okno 15 min
const MAX_FAILS = 8; // po tylu nieudanych — blokada
const LOCK_MS = 15 * 60 * 1000; // blokada na 15 min

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Zwraca liczbę sekund blokady (>0 = zablokowany), inaczej 0.
export async function loginLockSeconds(key: string): Promise<number> {
  const rec = await prisma.loginAttempt.findUnique({ where: { key } }).catch(() => null);
  if (rec?.lockedUntil && rec.lockedUntil > new Date()) {
    return Math.ceil((rec.lockedUntil.getTime() - Date.now()) / 1000);
  }
  return 0;
}

export async function recordLoginFailure(key: string): Promise<void> {
  const now = new Date();
  const rec = await prisma.loginAttempt.findUnique({ where: { key } }).catch(() => null);
  if (!rec || now.getTime() - rec.windowStart.getTime() > WINDOW_MS) {
    await prisma.loginAttempt.upsert({
      where: { key },
      create: { key, count: 1, windowStart: now },
      update: { count: 1, windowStart: now, lockedUntil: null },
    });
    return;
  }
  const count = rec.count + 1;
  await prisma.loginAttempt.update({
    where: { key },
    data: { count, lockedUntil: count >= MAX_FAILS ? new Date(now.getTime() + LOCK_MS) : null },
  });
}

export async function recordLoginSuccess(key: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { key } }).catch(() => {});
}
