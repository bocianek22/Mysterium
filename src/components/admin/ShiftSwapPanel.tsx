"use client";
import { useCallback, useEffect, useState } from "react";

type Shift = { id: string; start: string; end: string };
type Swap = { id: string; shiftId: string; fromName: string; start: string; end: string; note?: string | null };

const fmt = (d: string) => new Date(d).toLocaleString("pl-PL", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const fmtEnd = (d: string) => new Date(d).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

export default function ShiftSwapPanel() {
  const [myShifts, setMyShifts] = useState<Shift[]>([]);
  const [mine, setMine] = useState<Swap[]>([]);
  const [open, setOpen] = useState<Swap[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const now = new Date().toISOString();
    const [sh, sw] = await Promise.all([
      fetch(`/api/admin/shifts?from=${now}`).then((r) => r.ok ? r.json() : { items: [] }),
      fetch("/api/admin/shifts/swap").then((r) => r.ok ? r.json() : { mine: [], open: [] }),
    ]);
    setMyShifts(sh.items || []);
    setMine(sw.mine || []);
    setOpen(sw.open || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function action(url: string, body: object) {
    setBusy(true);
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); alert(d.error || "Błąd"); return; }
    load();
  }

  const offeredIds = new Set(mine.map((m) => m.shiftId));
  const upcoming = myShifts.filter((s) => !offeredIds.has(s.id));

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <div className="corner-frame p-5" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-serif tracking-[2px] uppercase mb-3" style={{ color: "var(--gold)" }}>🔄 Oddaj swoją zmianę</h2>
        {upcoming.length === 0 && mine.length === 0 ? (
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>Brak nadchodzących zmian.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 text-[13px] py-1">
                <span style={{ color: "var(--text)" }}>{fmt(s.start)}–{fmtEnd(s.end)}</span>
                <button disabled={busy} onClick={() => action("/api/admin/shifts/swap", { shiftId: s.id })} className="text-[12px] px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold-l)" }}>Wystaw</button>
              </li>
            ))}
            {mine.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 text-[13px] py-1" style={{ opacity: 0.8 }}>
                <span style={{ color: "var(--muted)" }}>{fmt(m.start)}–{fmtEnd(m.end)} · wystawiona</span>
                <button disabled={busy} onClick={() => action(`/api/admin/shifts/swap/${m.id}`, { action: "cancel" })} className="text-[12px] px-3 py-1 rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Cofnij</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="corner-frame p-5" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-serif tracking-[2px] uppercase mb-3" style={{ color: "var(--gold)" }}>🙋 Zmiany do przejęcia</h2>
        {open.length === 0 ? (
          <p className="text-[13px]" style={{ color: "var(--muted)" }}>Brak zmian do przejęcia.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {open.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 text-[13px] py-1">
                <span style={{ color: "var(--text)" }}>{fmt(o.start)}–{fmtEnd(o.end)} · <span style={{ color: "var(--muted)" }}>{o.fromName}</span></span>
                <button disabled={busy} onClick={() => action(`/api/admin/shifts/swap/${o.id}`, { action: "accept" })} className="btn-gold text-[12px]" style={{ clipPath: "none", padding: "5px 14px" }}>Przejmij</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
