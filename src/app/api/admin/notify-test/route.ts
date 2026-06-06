import { NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { sendTelegram, sendEmail } from "@/lib/notify";

export async function POST() {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const [tg, mail] = await Promise.all([
    sendTelegram("🔔 <b>Test powiadomień Mysterium</b>\nDziała! 🎉"),
    sendEmail("Test powiadomień Mysterium", "Powiadomienia e-mail działają. 🎉"),
  ]);
  return NextResponse.json({ telegram: tg, email: mail });
}
