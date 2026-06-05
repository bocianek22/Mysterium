"use client";
import { useEffect, useState, useCallback } from "react";

export default function AvailabilityManager() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ date: todayStr(), startTime: "16:00", endTime: "22:00", note: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/availability");
    if (res.ok) setItems((await res.json()).items);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/availability", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start: `${form.date}T${form.startTime}`, end: `${form.date}T${form.endTime}`, note: form.note }),
    });
    if (res.ok) { setForm({ ...form, note: "" }); load(); }
    else setError("Nie udało się zapisać");
  }
  async function del(id: string) {
    await fetch(`/api/admin/availability/${id}`, { method: "DELETE" });
    load();
  }
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const statusLabel = (s: string) => s === "APPROVED" ? "Zaakceptowano" : s === "REJECTED" ? "Odrzucono" : "Oczekuje";
  const statusColor = (s: string) => s === "APPROVED" ? "#7eebb0" : s === "REJECTED" ? "#fca5a5" : "var(--gold)";

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>✋</span> Moja dyspozycyjność</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Zgłoś kiedy możesz pracować — przełożony ułoży z tego grafik.</p>

      <form onSubmit={add} className="p-5 rounded mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <div><label className="field-label">Data</label><input type="date" className="field-input" value={form.date} onChange={(e) => set("date", e.target.value)} required /></div>
        <div><label className="field-label">Od</label><input type="time" className="field-input" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} required /></div>
        <div><label className="field-label">Do</label><input type="time" className="field-input" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} required /></div>
        <button type="submit" className="btn-gold" style={{ clipPath: "none", padding: "11px 16px" }}>Zgłoś</button>
        <div className="sm:col-span-4"><label className="field-label">Notatka (opcjonalnie)</label><input className="field-input" value={form.note} onChange={(e) => set("note", e.target.value)} placeholder="np. tylko po 18:00" /></div>
      </form>
      {error && <p className="text-sm mb-4" style={{ color: "#fca5a5" }}>{error}</p>}

      <div className="flex flex-col gap-2">
        {items.length === 0 ? <p style={{ color: "var(--muted)" }}>Brak zgłoszeń.</p> : items.map((a) => (
          <div key={a.id} className="flex items-center gap-3 p-3 rounded text-sm flex-wrap" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
            <span className="flex-1 min-w-0" style={{ color: "var(--text)" }}>
              {new Date(a.start).toLocaleString("pl-PL", { weekday: "short", day: "2-digit", month: "2-digit" })} · {new Date(a.start).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}–{new Date(a.end).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
              {a.note && <span style={{ color: "var(--muted)" }}> — {a.note}</span>}
            </span>
            <span className="text-[11px]" style={{ color: statusColor(a.status) }}>{statusLabel(a.status)}</span>
            <button onClick={() => del(a.id)} className="text-[11px] px-2 py-[2px] rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Usuń</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
