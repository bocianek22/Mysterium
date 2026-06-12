import { NextRequest, NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Zbiorczy cron dzienny — plan Hobby Vercela dopuszcza tylko crony raz dziennie
// i ograniczoną liczbę zadań, więc łączymy podziękowania + przypomnienia w jeden.
export async function GET(req: NextRequest) {
  const cronHeader = req.headers.get("x-vercel-cron");
  const key = new URL(req.url).searchParams.get("key");
  const session = await getSession();
  const authorized = !!cronHeader || (process.env.CRON_SECRET && key === process.env.CRON_SECRET) || (session && isManager(session.role));
  if (!authorized) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const h = req.headers;
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "https";
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || `${proto}://${host}`;

  // Przekaż autoryzację do podrzędnych zadań (nagłówek crona lub sekret).
  const fwd: Record<string, string> = {};
  if (cronHeader) fwd["x-vercel-cron"] = cronHeader;
  const secret = process.env.CRON_SECRET ? `?key=${process.env.CRON_SECRET}` : "";

  const run = async (path: string) => {
    try {
      const res = await fetch(`${origin}${path}${secret}`, { headers: fwd, cache: "no-store" });
      return await res.json().catch(() => ({ ok: res.ok }));
    } catch (e: any) {
      return { ok: false, error: String(e?.message || e) };
    }
  };

  const [thankyou, reminders] = await Promise.all([
    run("/api/cron/thankyou"),
    run("/api/cron/reminders"),
  ]);

  return NextResponse.json({ ok: true, thankyou, reminders });
}
