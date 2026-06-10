"use client";
import { useEffect, useState, useCallback } from "react";

type Block = { id: string; start: string; end: string; roomId: string | null; reason: string | null };
type Room = { id: string; namePl: string };

export default function BlocksManager() {
  const [items, setItems] = useState<Block[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState({ date: "", from: "12:00", to: "22:00", roomId: "", reason: "" });
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/blocks");
    if (res.ok) { const d = await res.json(); setItems(d.items); setRooms(d.rooms); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const res = await fetch("/api/admin/blocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await res.json();
    if (res.ok) { setForm({ date: "", from: "12:00", to: "22:00", roomId: "", reason: "" }); load(); }
    else setErr(d.error || "Błąd");
  }
  async function del(id: string) { await fetch(`/api/admin/blocks?id=${id}`, { method: "DELETE" }); load(); }
  const roomName = (id: string | null) => (id ? rooms.find((r) => r.id === id)?.namePl || "?" : "Wszystkie pokoje");
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>🚫</span> Blokady terminów</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Zablokowane godziny (urlop, serwis, event prywatny) są wykluczane z „wolnych terminów" na stronie.</p>

      <form onSubmit={add} className="p-5 rounded mb-6 grid grid-cols-2 md:grid-cols-6 gap-3 items-end" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <div><label className="field-label">Data</label><input type="date" className="field-input" value={form.date} onChange={(e) => set("date", e.target.value)} required /></div>
        <div><label className="field-label">Od</label><input type="time" className="field-input" value={form.from} onChange={(e) => set("from", e.target.value)} required /></div>
        <div><label className="field-label">Do</label><input type="time" className="field-input" value={form.to} onChange={(e) => set("to", e.target.value)} required /></div>
        <div><label className="field-label">Pokój</label><select className="field-input" value={form.roomId} onChange={(e) => set("roomId", e.target.value)}><option value="">Wszystkie</option>{rooms.map((r) => <option key={r.id} value={r.id}>{r.namePl}</option>)}</select></div>
        <div><label className="field-label">Powód</label><input className="field-input" value={form.reason} onChange={(e) => set("reason", e.target.value)} placeholder="np. serwis" /></div>
        <button type="submit" className="btn-gold" style={{ clipPath: "none", padding: "11px 16px" }}>Dodaj</button>
      </form>
      {err && <p className="text-sm mb-4" style={{ color: "#fca5a5" }}>{err}</p>}

      {items.length === 0 ? <p style={{ color: "var(--muted)" }}>Brak blokad.</p> : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>{["Data", "Godziny", "Pokój", "Powód", ""].map((h) => <th key={h} className="text-left font-serif text-[10px] uppercase tracking-[1px] px-3 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-3 py-2">{new Date(b.start).toLocaleDateString("pl-PL")}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{new Date(b.start).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw" })}–{new Date(b.end).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw" })}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{roomName(b.roomId)}</td>
                  <td className="px-3 py-2">{b.reason || "—"}</td>
                  <td className="px-3 py-2"><button onClick={() => del(b.id)} className="text-xs px-2 py-1 rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Usuń</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
