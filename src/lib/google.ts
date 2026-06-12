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
  const { token } = await getAccessTokenDetailed(cfg);
  return token ?? null;
}

// Jak wyżej, ale zwraca czytelny powód błędu (do testu w panelu).
async function getAccessTokenDetailed(cfg: GoogleConfig): Promise<{ token?: string; error?: string }> {
  let key: Awaited<ReturnType<typeof importPKCS8>>;
  try {
    key = await importPKCS8(cfg.privateKey, "RS256");
  } catch {
    return { error: "Nie udało się odczytać klucza prywatnego. Wklej całą wartość pola private_key z pliku JSON (od -----BEGIN PRIVATE KEY----- do -----END PRIVATE KEY-----), bez otaczających cudzysłowów." };
  }
  try {
    const now = Math.floor(Date.now() / 1000);
    const assertion = await new SignJWT({ scope: "https://www.googleapis.com/auth/calendar" })
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
      body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.access_token) return { token: data.access_token };

    const g = data.error_description || data.error || `HTTP ${res.status}`;
    if (/signature/i.test(g)) return { error: `Google: ${g}. Klucz prywatny nie pasuje do tego konta serwisowego — pobierz nowy klucz JSON i wklej oba pola (e-mail + klucz) z tego samego pliku.` };
    if (/invalid_client|account not found|email/i.test(g)) return { error: `Google: ${g}. Sprawdź e-mail konta serwisowego (client_email).` };
    return { error: `Google odrzucił logowanie: ${g}` };
  } catch (e: any) {
    return { error: String(e?.message || e) };
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

// Test konfiguracji z czytelnym komunikatem (do panelu ustawień).
export async function testGoogleSync(): Promise<{ ok: boolean; error?: string }> {
  const s = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!s?.googleSyncEnabled) return { ok: false, error: "Synchronizacja wyłączona — zaznacz checkbox i zapisz." };
  if (!s.googleClientEmail) return { ok: false, error: "Brak e-maila konta serwisowego (client_email)." };
  if (!s.googlePrivateKey) return { ok: false, error: "Brak klucza prywatnego (private_key)." };
  if (!s.googleCalendarId) return { ok: false, error: "Brak ID kalendarza." };

  const cfg: GoogleConfig = {
    clientEmail: s.googleClientEmail,
    privateKey: s.googlePrivateKey.replace(/\\n/g, "\n"),
    calendarId: s.googleCalendarId,
  };
  const auth = await getAccessTokenDetailed(cfg);
  if (!auth.token) return { ok: false, error: auth.error || "Nie udało się uzyskać tokenu." };
  const token = auth.token;

  const start = new Date(Date.now() + 3600_000);
  const end = new Date(start.getTime() + 1800_000);
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cfg.calendarId)}/events`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: "✅ Test synchronizacji Mysterium",
          description: "Wydarzenie testowe — możesz je usunąć.",
          start: { dateTime: start.toISOString() },
          end: { dateTime: end.toISOString() },
        }),
      }
    );
    if (res.ok) return { ok: true };
    const body = await res.json().catch(() => ({}));
    const reason = body?.error?.message || `HTTP ${res.status}`;
    if (res.status === 404) return { ok: false, error: `Nie znaleziono kalendarza (${reason}). Sprawdź ID kalendarza i czy udostępniłeś go kontu serwisowemu.` };
    if (res.status === 403) return { ok: false, error: `Brak uprawnień (${reason}). Udostępnij kalendarz e-mailowi konta serwisowego z prawem „Wprowadzanie zmian w wydarzeniach".` };
    return { ok: false, error: reason };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

