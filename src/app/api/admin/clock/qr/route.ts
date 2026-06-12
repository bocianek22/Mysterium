import { NextRequest, NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { getClockConfig, resetClockSecret, makeToken, windowTtl, CLOCK_WINDOW } from "@/lib/clock";

export const dynamic = "force-dynamic";

function origin(req: NextRequest) {
  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

// Zwraca bieżący token + pełny URL do zaszycia w kodzie QR oraz tryb kodu.
export async function GET(req: NextRequest) {
  const s = await getSession();
  // Dostęp: zarządzający oraz rola „Kod" (kiosk).
  if (!s || (!isManager(s.role) && s.role !== "CODE")) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { secret, mode } = await getClockConfig();
  const token = makeToken(secret, mode);
  const url = `${origin(req)}/admin/clock?t=${token}`;
  return NextResponse.json({ token, url, mode, ttl: mode === "DYNAMIC" ? windowTtl() : null, window: CLOCK_WINDOW });
}

// Regeneruje sekret — unieważnia wcześniej udostępnione/sfotografowane kody.
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || (!isManager(s.role) && s.role !== "CODE")) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await resetClockSecret();
  return NextResponse.json({ ok: true });
}
