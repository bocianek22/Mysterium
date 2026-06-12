"use client";

const DAYS = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
type Day = { closed: boolean; open: string; close: string };
const DEFAULT: Day[] = Array.from({ length: 7 }, () => ({ closed: false, open: "12:00", close: "22:00" }));

function parse(v?: string | null): Day[] {
  try {
    const a = v ? JSON.parse(v) : null;
    if (Array.isArray(a) && a.length === 7) return a.map((d) => ({ closed: !!d.closed, open: d.open || "12:00", close: d.close || "22:00" }));
  } catch {}
  return DEFAULT;
}

export default function OpeningHoursEditor({ value, onChange }: { value?: string | null; onChange: (json: string) => void }) {
  const days = parse(value);
  const update = (i: number, patch: Partial<Day>) => {
    const next = days.map((d, j) => (j === i ? { ...d, ...patch } : d));
    onChange(JSON.stringify(next));
  };
  return (
    <div className="rounded p-3" style={{ border: "1px solid var(--border)", background: "rgba(13,27,42,.4)" }}>
      <div className="text-xs mb-2" style={{ color: "var(--muted)" }}>Godziny otwarcia (zasilają „wolne terminy" i mapę/kontakt):</div>
      <div className="flex flex-col gap-1.5">
        {days.map((d, i) => (
          <div key={i} className="flex items-center gap-3 flex-wrap text-sm">
            <span className="w-[110px]" style={{ color: "var(--text)" }}>{DAYS[i]}</span>
            <label className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
              <input type="checkbox" checked={d.closed} onChange={(e) => update(i, { closed: e.target.checked })} /> zamknięte
            </label>
            {!d.closed && (
              <>
                <input type="time" value={d.open} onChange={(e) => update(i, { open: e.target.value })} className="field-input" style={{ width: 120 }} />
                <span style={{ color: "var(--muted)" }}>–</span>
                <input type="time" value={d.close} onChange={(e) => update(i, { close: e.target.value })} className="field-input" style={{ width: 120 }} />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
