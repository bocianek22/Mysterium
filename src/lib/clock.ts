// Rejestracja czasu pracy (RCP) — rotujący token kodu QR + wyliczenia przerw.
// Token jest podpisywany HMAC-em sekretu i numeru okna czasowego, więc
// zrzut ekranu QR przestaje działać po kilkudziesięciu sekundach.
import crypto from "crypto";
import { prisma } from "./prisma";

export type ClockMode = "STATIC" | "DYNAMIC";

// Okno rotacji tokenu QR w trybie dynamicznym (sekundy).
export const CLOCK_WINDOW = 30;
// Ile okien wstecz akceptujemy przy walidacji (tolerancja na opóźnienie skanu).
const TOLERANCE_WINDOWS = 4; // 4 × 30 s ≈ do 2 minut

// Pobiera (lub tworzy) sekret do podpisywania tokenów QR.
export async function getClockSecret(): Promise<string> {
  const { secret } = await getClockConfig();
  return secret;
}

// Pobiera sekret + tryb kodu (STATIC = ręczna zmiana, DYNAMIC = auto-rotacja).
export async function getClockConfig(): Promise<{ secret: string; mode: ClockMode }> {
  const s = await prisma.siteSettings.findUnique({
    where: { id: "main" },
    select: { clockSecret: true, clockCodeMode: true },
  });
  const secret = s?.clockSecret || (await resetClockSecret());
  const mode: ClockMode = s?.clockCodeMode === "DYNAMIC" ? "DYNAMIC" : "STATIC";
  return { secret, mode };
}

// Generuje nowy sekret (unieważnia wcześniej udostępnione kody QR).
export async function resetClockSecret(): Promise<string> {
  const secret = crypto.randomBytes(24).toString("hex");
  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: { clockSecret: secret },
    create: { id: "main", clockSecret: secret },
  });
  return secret;
}

function tokenForWindow(secret: string, win: number): string {
  return crypto.createHmac("sha256", secret).update(`clock:${win}`).digest("hex").slice(0, 16);
}

// Token statyczny — stały dopóki nie wygenerujemy nowego sekretu (ręcznie).
function staticToken(secret: string): string {
  return crypto.createHmac("sha256", secret).update("clock:static").digest("hex").slice(0, 16);
}

export function currentWindow(now = Date.now()): number {
  return Math.floor(now / 1000 / CLOCK_WINDOW);
}

// Sekundy do końca bieżącego okna (do odliczania w panelu, tryb dynamiczny).
export function windowTtl(now = Date.now()): number {
  return CLOCK_WINDOW - Math.floor((now / 1000) % CLOCK_WINDOW);
}

export function makeToken(secret: string, mode: ClockMode, now = Date.now()): string {
  return mode === "DYNAMIC" ? tokenForWindow(secret, currentWindow(now)) : staticToken(secret);
}

// Weryfikuje token. STATIC: porównanie ze stałym tokenem. DYNAMIC: bieżące,
// kilka poprzednich i jedno przyszłe okno (tolerancja na opóźnienie skanu).
export function verifyToken(secret: string, token: string, mode: ClockMode, now = Date.now()): boolean {
  if (!token) return false;
  if (mode === "STATIC") return timingSafeEq(staticToken(secret), token);
  const win = currentWindow(now);
  for (let i = -1; i <= TOLERANCE_WINDOWS; i++) {
    if (timingSafeEq(tokenForWindow(secret, win - i), token)) return true;
  }
  return false;
}

function timingSafeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// Należna PŁATNA przerwa (minuty) wg długości zmiany: ≥6h → 15, ≥8h → 30.
export function paidBreakMinutes(hours: number): number {
  if (hours >= 8) return 30;
  if (hours >= 6) return 15;
  return 0;
}

// Długość wpisu w godzinach (clockOut − clockIn), zaokrąglona do 0,01 h.
export function entryHours(clockIn: Date | string, clockOut: Date | string | null): number {
  if (!clockOut) return 0;
  const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  return Math.max(0, Math.round((ms / 3_600_000) * 100) / 100);
}

// Formatuje godziny dziesiętne jako „Xh Ym".
export function fmtHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}
