import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isManager } from "@/lib/auth";

export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
function esc(s: string) {
  return (s || "").replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
}

// Publiczny kanał iCal (token = sekret). Subskrybuj w Google Calendar:
// Inne kalendarze → Z adresu URL → wklej ten link.
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const user = await prisma.user.findUnique({
    where: { calendarToken: params.token },
  });
  if (!user) return new Response("Not found", { status: 404 });

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mysterium//Grafik//PL",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:Mysterium — ${esc(user.name || user.email)}`,
  ];

  const shifts = await prisma.shift.findMany({ where: { userId: user.id } });
  for (const sh of shifts) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:shift-${sh.id}@mysterium`,
      `DTSTAMP:${fmt(sh.createdAt)}`,
      `DTSTART:${fmt(sh.start)}`,
      `DTEND:${fmt(sh.end)}`,
      `SUMMARY:${esc("Zmiana — " + (user.name || "Mysterium"))}`,
      sh.note ? `DESCRIPTION:${esc(sh.note)}` : "",
      "END:VEVENT"
    );
  }

  // Managerowie dostają w swoim kanale także rezerwacje
  if (isManager(user.role as any)) {
    const res = await prisma.reservation.findMany();
    for (const r of res) {
      lines.push(
        "BEGIN:VEVENT",
        `UID:res-${r.id}@mysterium`,
        `DTSTAMP:${fmt(r.createdAt)}`,
        `DTSTART:${fmt(r.start)}`,
        `DTEND:${fmt(r.end)}`,
        `SUMMARY:${esc("Rezerwacja: " + r.title)}`,
        `DESCRIPTION:${esc(
          [r.customerName, r.customerPhone, r.people ? r.people + " os." : "", r.notes]
            .filter(Boolean)
            .join(" • ")
        )}`,
        "END:VEVENT"
      );
    }
  }

  lines.push("END:VCALENDAR");
  const body = lines.filter((l) => l !== "").join("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="mysterium-${user.id}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
