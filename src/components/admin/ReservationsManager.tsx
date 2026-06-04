"use client";
import { useEffect, useState, useCallback } from "react";
import MonthCalendar, { CalEvent } from "./MonthCalendar";

type Room = { id: string; namePl: string };
type Res = any;

export default function ReservationsManager({ rooms }: { rooms: Room[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [items, setItems] = useState<Res[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const from = new Date(year, month - 1, 1).toISOString();
    const to = new Date(year, month + 2, 1).toISOString();
    const res = await fetch(`/api/admin/reservations?from=${from}&to=${to}`);
    if (res.ok) setItems((await res.json()).items);
  }, [year, month]);
  useEffect(() => { load(); }, [load]);

  const events: CalEvent[] = items.map((r) => ({
    id: r.id, start: r.start, end: r.end,
    title: r.title,
    color: r.source === "LOCKME" ? "#7dd3d0" : "#C9A84C",
  }));

  function add(date?: string) {
    setEditing({ title: "", roomId: "", date: date || todayStr(), startTime: "18:00", endTime: "19:00", people: 0, customerName: "", customerPhone: "", customerEmail: "", notes: "" });
    setMsg("");
  }
  function edit(id: string) {
    const r = items.find((x) => x.id === id);
    if (!r) return;
    setEditing({
      id: r.id, title: r.title, roomId: r.roomId || "",
      date: r.start.slice(0, 10),
      startTime: new Date(r.start).toTimeString().slice(0, 5),
      endTime: new Date(r.end).toTimeString().slice(0, 5),
      people: r.people, customerName: r.customerName || "", customerPhone: r.customerPhone || "", customerEmail: r.customerEmail || "", notes: r.notes || "",
    });
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const f = editing;
    const body = { title: f.title, roomId: f.roomId || null, start: `${f.date}T${f.startTime}`, end: `${f.date}T${f.endTime}`, people: f.people, customerName: f.customerName, customerPhone: f.customerPhone, customerEmail: f.customerEmail, notes: f.notes };
    const url = f.id ? `/api/admin/reservations/${f.id}` : "/api/admin/reservations";
    const res = await fetch(url, { method: f.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setEditing(null); load(); }
  }
  async function del() {
    if (!editing?.id || !confirm("Usunąć rezerwację?")) return;
    await fetch(`/api/admin/reservations/${editing.id}`, { method: "DELETE" });
    setEditing(null); load();
  }
  async function importLockme() {
    setMsg("Importowanie...");
    const res = await fetch("/api/admin/lockme/import", { method: "POST" });
    const data = await res.json();
    setMsg(res.ok ? `✓ Zaimportowano ${data.imported} z ${data.received}` : data.error || "Błąd importu");
    if (res.ok) load();
  }
  const set = (k: string, v: any) => setEditing((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-gold-grad text-3xl flex items-center gap-3"><span>📅</span> Rezerwacje</h1>
        <div className="flex gap-2 items-center flex-wrap">
          {msg && <span className="text-xs" style={{ color: "var(--gold)" }}>{msg}</span>}
          <button onClick={importLockme} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>↻ Import z LockMe</button>
          <button onClick={() => add()} className="btn-gold" style={{ clipPath: "none", padding: "10px 20px" }}>+ Rezerwacja</button>
        </div>
      </div>

      <div className="p-4 rounded mb-6" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
        <MonthCalendar events={events} year={year} month={month} onMonthChange={(y, m) => { setYear(y); setMonth(m); }} onDayClick={add} onEventClick={edit} />
        <div className="flex gap-4 mt-3 text-[11px]" style={{ color: "var(--muted)" }}>
          <span><span style={{ color: "#C9A84C" }}>■</span> ręczne</span>
          <span><span style={{ color: "#7dd3d0" }}>■</span> LockMe</span>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[5000] flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,.8)" }} onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="w-full max-w-[520px] my-8 p-6 md:p-8 rounded" style={{ background: "var(--navy-d)", border: "1px solid var(--border-h)" }}>
            <h2 className="font-display text-gold-grad text-2xl mb-6">{editing.id ? "Edytuj rezerwację" : "Nowa rezerwacja"}</h2>
            <div className="grid grid-cols-1 gap-4">
              <div><label className="field-label">Tytuł *</label><input className="field-input" value={editing.title} onChange={(e) => set("title", e.target.value)} required placeholder="np. Urodziny / Pokój Nr 1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="field-label">Pokój</label>
                  <select className="field-input" value={editing.roomId} onChange={(e) => set("roomId", e.target.value)}>
                    <option value="" style={{ background: "var(--navy-d)" }}>—</option>
                    {rooms.map((r) => <option key={r.id} value={r.id} style={{ background: "var(--navy-d)" }}>{r.namePl}</option>)}
                  </select>
                </div>
                <div><label className="field-label">Liczba osób</label><input type="number" className="field-input" value={editing.people} onChange={(e) => set("people", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="field-label">Data</label><input type="date" className="field-input" value={editing.date} onChange={(e) => set("date", e.target.value)} required /></div>
                <div><label className="field-label">Od</label><input type="time" className="field-input" value={editing.startTime} onChange={(e) => set("startTime", e.target.value)} required /></div>
                <div><label className="field-label">Do</label><input type="time" className="field-input" value={editing.endTime} onChange={(e) => set("endTime", e.target.value)} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="field-label">Klient</label><input className="field-input" value={editing.customerName} onChange={(e) => set("customerName", e.target.value)} /></div>
                <div><label className="field-label">Telefon</label><input className="field-input" value={editing.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} /></div>
              </div>
              <div><label className="field-label">E-mail</label><input className="field-input" value={editing.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} /></div>
              <div><label className="field-label">Notatki</label><textarea className="field-input h-20 resize-none" value={editing.notes} onChange={(e) => set("notes", e.target.value)} /></div>
            </div>
            <div className="flex gap-3 mt-8 justify-between">
              <div>{editing.id && <button type="button" onClick={del} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Usuń</button>}</div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(null)} className="btn-outline" style={{ clipPath: "none", padding: "10px 20px" }}>Anuluj</button>
                <button type="submit" className="btn-gold" style={{ clipPath: "none", padding: "10px 20px" }}>Zapisz</button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
