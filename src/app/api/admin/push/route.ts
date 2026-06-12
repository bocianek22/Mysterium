import { NextRequest, NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateVapidKeys, sendPush } from "@/lib/push";

export const dynamic = "force-dynamic";

// Status konfiguracji push.
export async function GET() {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const cfg = await prisma.siteSettings.findUnique({ where: { id: "main" }, select: { pushEnabled: true, vapidPublicKey: true } });
  const subs = await prisma.pushSub.count();
  return NextResponse.json({ enabled: !!cfg?.pushEnabled, configured: !!cfg?.vapidPublicKey, subscriptions: subs });
}

// action: generate (klucze VAPID) | test (powiadomienie do siebie)
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { action } = await req.json().catch(() => ({ action: "" }));

  if (action === "generate") {
    const existing = await prisma.siteSettings.findUnique({ where: { id: "main" }, select: { vapidPublicKey: true } });
    if (existing?.vapidPublicKey) return NextResponse.json({ error: "Klucze już istnieją" }, { status: 400 });
    const keys = generateVapidKeys();
    await prisma.siteSettings.update({ where: { id: "main" }, data: { vapidPublicKey: keys.publicKey, vapidPrivateKey: keys.privateKey, pushEnabled: true } });
    return NextResponse.json({ ok: true, publicKey: keys.publicKey });
  }

  if (action === "test") {
    await sendPush({ title: "Mysterium — test 🔔", body: "Powiadomienia push działają!", url: "/admin" }, s.sub);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Nieznana akcja" }, { status: 400 });
}
