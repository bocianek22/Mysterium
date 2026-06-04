// Opcjonalna synchronizacja z Google Calendar przez konto serwisowe.
// Działa tylko gdy w Ustawieniach włączysz synchronizację i podasz dane
// konta serwisowego (e-mail, klucz prywatny, ID kalendarza).
// Nie wymaga dodatkowych bibliotek — JWT podpisujemy przez `jose`.

import { SignJWT, importPKCS8 } from "jose";
import { prisma } from "./prisma";

type GoogleConfig = {
  clientEmail: string;
  privateKey: string;
  calendarId: string;
};

async function getConfig(): Promise<GoogleConfig | null> {
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (
    !s?.googleSyncEnabled ||
    !s.googleClientEmail ||
    !s.googlePrivateKey ||
    !s.googleCalendarId
  )
    return null;
  return {
    clientEmail: s.googleClientEmail,
    privateKey: s.googlePrivateKey.replace(/\\n/g, "\n"),
    calendarId: s.googleCalendarId,
  };
}

async function getAccessToken(cfg: GoogleConfig): Promise<string | null> {
  try {
    const key = await importPKCS8(cfg.privateKey, "RS256");
    const now = Math.floor(Date.now() / 1000);
    const assertion = await new SignJWT({
      scope: "https://www.googleapis.com/auth/calendar",
    })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuer(cfg.clientEmail)
      .setSubject(cfg.clientEmail)
      .setAudience("https://oauth2.googleapis.com/token")
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(key);

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token ?? null;
  } catch (e) {
    console.error("[google] token error", e);
    return null;
  }
}

type EventInput = {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
};

// Tworzy wydarzenie w Google Calendar. Zwraca true/false (nigdy nie rzuca).
export async function pushEventToGoogle(ev: EventInput): Promise<boolean> {
  const cfg = await getConfig();
  if (!cfg) return false; // synchronizacja wyłączona/niegotowa
  const token = await getAccessToken(cfg);
  if (!token) return false;
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        cfg.calendarId
      )}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: ev.summary,
          description: ev.description,
          start: { dateTime: ev.start.toISOString() },
          end: { dateTime: ev.end.toISOString() },
        }),
      }
    );
    return res.ok;
  } catch (e) {
    console.error("[google] event error", e);
    return false;
  }
}
