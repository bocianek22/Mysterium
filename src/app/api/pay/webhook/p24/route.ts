import { NextRequest, NextResponse } from "next/server";
import { p24VerifyNotification, markPaidAndFulfill } from "@/lib/payments";

export const dynamic = "force-dynamic";

// Powiadomienie (urlStatus) z Przelewy24.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.sessionId) return NextResponse.json({ error: "bad payload" }, { status: 400 });
  const ok = await p24VerifyNotification(body);
  if (!ok) return NextResponse.json({ error: "verify failed" }, { status: 400 });
  await markPaidAndFulfill(body.sessionId);
  return NextResponse.json({ received: true });
}
