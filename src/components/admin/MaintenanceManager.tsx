"use client";
import { useEffect, useState, useCallback } from "react";
import { MAINTENANCE_TYPES, PRIORITIES, maintenanceTypeLabel, priorityLabel } from "@/lib/ops";

type Room = { id: string; namePl: string };
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const prioColor = (p: string) => (p === "HIGH" ? "#fca5a5" : p === "LOW" ? "var(--dim)" : "var(--gold)");

export default function MaintenanceManager({ rooms, canManage }: { rooms: Room[]; canManage: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("OPEN");
  const [form, setForm] = useState<any>({ roomId: "", type: "USTERKA", priority: "NORMAL", description: "", dueDate: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/maintenance${filter === "ALL" ? "" : `?status=${filter}`}`);
    if (res.ok) setItems((await res.json()).items);
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  async function add(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const res = await fetch("/api/admin/maintenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ ...form, description: "", dueDate: "" }); load(); }
    else setError((await res.json()).error || "Błąd zapisu");
  }
  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/maintenance/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }
  async function del(id: string) {
    if (!confirm("Usunąć zgłoszenie?")) return;
    await fetch(`/api/admin/maintenance/${id}`, { method: "DELETE" });
    load();
  }

  const overdue = (d?: string) => d && new Date(d) < new Date(new Date().toDateString());

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>🛠️</span> Konserwacja pokoi</h1>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>Resety rekwizytów, baterie, usterki i naprawy. Pilne zgłoszenia idą na Telegram zespołu.</p>

      <form onSubmit={add} className="p-5 rounded mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <div><label className="field-label">Pokój</label>
          <select className="field-input" value={form.roomId} onChange={(e) => set("roomId", e.target.value)}>
            <option value="" style={{ background: "var(--navy-d)" }}>— ogólne —</option>
            {rooms.map((r) => <option key={r.id} value={r.id} style={{ background: "var(--navy-d)" }}>{r.namePl}</option>)}
          </select>
        </div>
        <div><label className="field-label">Typ</label>
          <select className="field-input" value={form.type} onChange={(e) => set("type", e.target.value)}>
            {MAINTENANCE_TYPES.map((t) => <option key={t.key} value={t.key} style={{ background: "var(--navy-d)" }}>{t.label}</option>)}
          </select>
        </div>
        <div><label className="field-label">Priorytet</label>
          <select className="field-input" value={form.priority} onChange={(e) => set("priority", e.target.value)}>
            {PRIORITIES.map((p) => <option key={p.key} value={p.key} style={{ background: "var(--navy-d)" }}>{p.label}</option>)}
          </select>
        </div>
        <div><label className="field-label">Termin (opcjonalnie)</label><input type="date" className="field-input" value={form.dueDate} min={todayStr()} onChange={(e) => set("dueDate", e.target.value)} /></div>
        <button type="submit" className="btn-gold" style={{ clipPath: "none", padding: "11px 16px" }}>Zgłoś</button>
        <div className="sm:col-span-2 lg:col-span-5"><label className="field-label">Opis *</label><input className="field-input" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="np. kłódka w sejfie zacina się; wymienić baterie w UV" required /></div>
      </form>
      {error && <p className="text-sm mb-4" style={{ color: "#fca5a5" }}>{error}</p>}

      <div className="flex gap-2 mb-4">
        {[["OPEN", "Otwarte"], ["DONE", "Zamknięte"], ["ALL", "Wszystkie"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className="text-xs px-3 py-1 rounded" style={filter === k ? { background: "var(--gold)", color: "#1a1206" } : { border: "1px solid var(--border)", color: "var(--muted)" }}>{l}</button>
        ))}
      </div>

      {items.length === 0 ? <p style={{ color: "var(--muted)" }}>Brak zgłoszeń.</p> : (
        <div className="flex flex-col gap-2">
          {items.map((m) => (
            <div key={m.id} className="p-3 rounded flex items-start gap-3 flex-wrap" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)", opacity: m.status === "DONE" ? 0.55 : 1 }}>
              <span className="text-[10px] px-2 py-[2px] rounded mt-[2px]" style={{ background: "rgba(201,168,76,.1)", color: prioColor(m.priority) }}>{priorityLabel(m.priority)}</span>
              <div className="flex-1 min-w-[200px]">
                <div className="text-sm" style={{ color: "var(--text)" }}>
                  <b>{maintenanceTypeLabel(m.type)}</b>{m.room ? ` · ${m.room.namePl}` : ""} — {m.description}
                </div>
                <div className="text-[11px] mt-1" style={{ color: "var(--dim)" }}>
                  {m.createdByName || ""} · {new Date(m.createdAt).toLocaleDateString("pl-PL")}
                  {m.dueDate && <span style={{ color: overdue(m.dueDate) && m.status === "OPEN" ? "#fca5a5" : "var(--dim)" }}> · termin {new Date(m.dueDate).toLocaleDateString("pl-PL")}</span>}
                  {m.status === "DONE" && m.resolvedByName && <span> · zamknął: {m.resolvedByName}</span>}
                </div>
              </div>
              {m.status === "OPEN"
                ? <button onClick={() => setStatus(m.id, "DONE")} className="text-[11px] px-2 py-[3px] rounded" style={{ border: "1px solid rgba(126,235,176,.3)", color: "#7eebb0" }}>✓ Zrobione</button>
                : <button onClick={() => setStatus(m.id, "OPEN")} className="text-[11px] px-2 py-[3px] rounded" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>↩ Otwórz</button>}
              {(canManage || m.status === "OPEN") && <button onClick={() => del(m.id)} className="text-[11px] px-2 py-[3px] rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Usuń</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
