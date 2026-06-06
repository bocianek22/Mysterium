"use client";
import { useEffect, useState, useCallback } from "react";
import { WORK_CATEGORIES } from "@/lib/categories";

const FIELDS = WORK_CATEGORIES.map((c) => ({ ...c, field: ({ stationary: "stationaryH", mobile: "mobileH", travel: "travelH", cleaning: "cleaningH" } as any)[c.key] }));

export default function TimesheetWidget() {
  const [items, setItems] = useState<any[]>([]);
  const [date, setDate] = useState(todayStr());
  const [form, setForm] = useState<any>({ stationaryH: 0, mobileH: 0, travelH: 0, cleaningH: 0, note: "" });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const from = new Date(Date.now() - 40 * 86400000).toISOString();
    const to = new Date(Date.now() + 86400000).toISOString();
    const res = await fetch(`/api/admin/timesheet?from=${from}&to=${to}`);
    if (res.ok) setItems((await res.json()).items);
  }, []);
  useEffect(() => { load(); }, [load]);

  // wczytaj istniejący wpis dla wybranej daty
  useEffect(() => {
    const found = items.find((i) => i.date.slice(0, 10) === date);
    if (found) setForm({ stationaryH: found.stationaryH, mobileH: found.mobileH, travelH: found.travelH, cleaningH: found.cleaningH, note: found.note || "" });
    else setForm({ stationaryH: 0, mobileH: 0, travelH: 0, cleaningH: 0, note: "" });
  }, [date, items]);

  async function save() {
    setMsg("Zapisywanie...");
    const res = await fetch("/api/admin/timesheet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, ...form }) });
    if (res.ok) { setMsg("✓ Zapisano"); load(); setTimeout(() => setMsg(""), 2000); }
    else setMsg("Błąd");
  }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const sum = FIELDS.reduce((a, f) => a + (Number(form[f.field]) || 0), 0);

  return (
    <div className="mt-6 p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
      <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>⏱️ Karta godzin (uzupełnij po zmianie)</h2>
      <div className="flex items-end gap-3 flex-wrap mb-3">
        <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Data</label><input type="date" className="field-input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        {FIELDS.map((f) => (
          <div key={f.key}><label className="text-[10px]" style={{ color: "var(--muted)" }}>{f.label}</label><input type="number" step="0.25" min={0} className="field-input" style={{ width: 90 }} value={form[f.field]} onChange={(e) => set(f.field, e.target.value)} /></div>
        ))}
        <div className="font-display text-lg" style={{ color: "var(--gold)" }}>Σ {sum.toFixed(2)} h</div>
      </div>
      <div className="flex items-center gap-3">
        <input className="field-input flex-1" placeholder="Notatka (opcjonalnie)" value={form.note} onChange={(e) => set("note", e.target.value)} />
        <button onClick={save} className="btn-gold" style={{ clipPath: "none", padding: "9px 20px" }}>Zapisz</button>
        {msg && <span className="text-xs" style={{ color: "var(--gold)" }}>{msg}</span>}
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex flex-col gap-1">
          {items.slice(0, 8).map((i) => (
            <div key={i.id} className="text-[12px] flex justify-between" style={{ color: "var(--muted)" }}>
              <span>{new Date(i.date).toLocaleDateString("pl-PL", { weekday: "short", day: "2-digit", month: "2-digit" })}</span>
              <span>stac {i.stationaryH} · mob {i.mobileH} · dojazd {i.travelH} · sprz {i.cleaningH}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
