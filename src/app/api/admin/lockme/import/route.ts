import { NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Import rezerwacji z LockMe.
// Konfiguracja w Ustawieniach: lockmeApiUrl, lockmeApiKey, lockmeRoomId.
// Oczekujemy odpowiedzi JSON z listą rezerwacji. Mapujemy elastycznie
// najczęstsze nazwy pól; po otrzymaniu od Ciebie dokładnego formatu API
// dopniemy mapowanie 1:1.
export async function POST() {
  const s = await getSession();
  if (!s || !isManager(s.role))
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
  if (!settings?.lockmeApiUrl || !settings.lockmeApiKey) {
    return NextResponse.json(
      { error: "Brak konfiguracji LockMe API (uzupełnij w Ustawieniach)" },
      { status: 400 }
    );
  }

  let list: any[] = [];
  try {
    const res = await fetch(settings.lockmeApiUrl, {
      headers: {
        Authorization: `Bearer ${settings.lockmeApiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok)
      return NextResponse.json(
        { error: `LockMe API zwróciło status ${res.status}` },
        { status: 502 }
      );
    const data = await res.json();
    list = Array.isArray(data) ? data : data.reservations || data.items || data.data || [];
  } catch (e) {
    return NextResponse.json(
      { error: "Nie udało się połączyć z LockMe API" },
      { status: 502 }
    );
  }

  let imported = 0;
  for (const r of list) {
    const externalId = String(r.id ?? r.reservation_id ?? r.uuid ?? "");
    const start = r.start ?? r.start_date ?? r.from ?? r.date_start;
    const end = r.end ?? r.end_date ?? r.to ?? r.date_end;
    if (!externalId || !start || !end) continue;
    try {
      await prisma.reservation.upsert({
        where: { externalId },
        update: {
          start: new Date(start),
          end: new Date(end),
          customerName: r.name ?? r.customer ?? r.customer_name ?? null,
          customerEmail: r.email ?? r.customer_email ?? null,
          customerPhone: r.phone ?? r.customer_phone ?? null,
          people: Number(r.people ?? r.persons ?? r.size ?? 0) || 0,
        },
        create: {
          externalId,
          source: "LOCKME",
          title: r.title ?? r.game ?? r.room ?? "Rezerwacja LockMe",
          start: new Date(start),
          end: new Date(end),
          customerName: r.name ?? r.customer ?? r.customer_name ?? null,
          customerEmail: r.email ?? r.customer_email ?? null,
          customerPhone: r.phone ?? r.customer_phone ?? null,
          people: Number(r.people ?? r.persons ?? r.size ?? 0) || 0,
        },
      });
      imported++;
    } catch {
      // pomiń pojedyncze błędne rekordy
    }
  }

  return NextResponse.json({ ok: true, imported, received: list.length });
}
