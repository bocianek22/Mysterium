import { NextRequest, NextResponse } from "next/server";
import { getSession, isManager } from "@/lib/auth";

// Asystent AI do dograń grafiku (opcjonalny).
// Wymaga klucza ANTHROPIC_API_KEY w zmiennych środowiskowych.
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s || !isManager(s.role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Asystent AI nie jest skonfigurowany (brak ANTHROPIC_API_KEY)." }, { status: 400 });
  }

  const { employees, proposal, instruction } = await req.json();
  if (!instruction) return NextResponse.json({ error: "Brak polecenia" }, { status: 400 });

  const system = `Jesteś asystentem układania grafiku pracy w escape roomie.
Otrzymujesz listę pracowników (z umiejętnościami i celem godzin) oraz aktualną propozycję zmian.
Na podstawie polecenia właściciela zaproponuj POPRAWIONY grafik.
Zasady: respektuj umiejętności (stationary/mobile), nie przydzielaj dwóch zmian jednej osobie tego samego dnia, dbaj o sprawiedliwy podział i cel godzin.
Odpowiedz WYŁĄCZNIE poprawnym JSON-em w formacie:
{"shifts":[{"userId":"...","userName":"...","start":"YYYY-MM-DDTHH:mm","end":"YYYY-MM-DDTHH:mm","type":"stationary|mobile"}],"explanation":"krótkie wyjaśnienie po polsku"}`;

  const userMsg = JSON.stringify({ employees, proposal, instruction });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 4000,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: "Błąd API AI", detail: t.slice(0, 200) }, { status: 502 });
    }
    const data = await res.json();
    const text: string = data?.content?.[0]?.text || "";
    let parsed: any = null;
    try {
      const m = text.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    } catch {}
    if (!parsed) return NextResponse.json({ explanation: text, shifts: null });
    return NextResponse.json({ explanation: parsed.explanation || "", shifts: parsed.shifts || null });
  } catch (e) {
    return NextResponse.json({ error: "Nie udało się połączyć z AI" }, { status: 502 });
  }
}
