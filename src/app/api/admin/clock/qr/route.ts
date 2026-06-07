import { NextRequest, NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { getClockSecret, resetClockSecret, makeToken, windowTtl, CLOCK_WINDOW } from "@/lib/clock";

export const dynamic = "force-dynamic";

function origin(req: NextRequest) {
  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

// Zwraca bieżący rotujący token + pełny URL do zaszycia w kodzie QR.
export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const secret = await getClockSecret();
  const token = makeToken(secret);
  const url = `${origin(req)}/admin/clock?t=${token}`;
  return NextResponse.json({ token, url, ttl: windowTtl(), window: CLOCK_WINDOW });
}

// Regeneruje sekret — unieważnia wcześniej udostępnione/sfotografowane kody.
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  await resetClockSecret();
  return NextResponse.json({ ok: true });
}
