"use client";
import { useEffect, useState, useCallback } from "react";
import MonthCalendar, { CalEvent } from "./MonthCalendar";

type Shift = {
  id: string;
  userId: string;
  start: string;
  end: string;
  note?: string | null;
  user?: { id: string; name?: string | null; email: string };
};
type SimpleUser = { id: string; name?: string | null; email: string };

const COLORS = ["#C9A84C", "#7dd3d0", "#b794f6", "#f6ad55", "#68d391", "#fc8181"];

export default function ScheduleManager({
  isManager,
  users,
  currentUserId,
}: {
  isManager: boolean;
  users: SimpleUser[];
  currentUserId: string;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [avail, setAvail] = useState<any[]>([]);

  const colorFor = (uid: string) => COLORS[Math.abs(hash(uid)) % COLORS.length];

  const load = useCallback(async () => {
    const from = new Date(year, month - 1, 1).toISOString();
    const to = new Date(year, month + 2, 1).toISOString();
    const q = new URLSearchParams({ from, to });
    if (isManager && filter) q.set("userId", filter);
    const res = await fetch(`/api/admin/shifts?${q}`);
    if (res.ok) setShifts((await res.json()).items);
    if (isManager) {
      const a = await fetch("/api/admin/availability");
      if (a.ok) setAvail((await a.json()).items);
    }
  }, [year, month, filter, isManager]);
  useEffect(() => { load(); }, [load]);

  const events: CalEvent[] = shifts.map((s) => ({
    id: s.id,
    start: s.start,
    end: s.end,
    title: isManager ? s.user?.name || s.user?.email || "Zmiana" : "Zmiana",
    color: colorFor(s.userId),
  }));

  function newShift(date?: string) {
    if (!isManager) return;
    setEditing({ userId: users[0]?.id || "", date: date || todayStr(), startTime: "16:00", endTime: "22:00", note: "" });
  }
  function editShift(id: string) {
    if (!isManager) return;
    const s = shifts.find((x) => x.id === id);
    if (!s) return;
    setEditing({
      id: s.id, userId: s.userId,
      date: s.start.slice(0, 10),
      startTime: new Date(s.start).toTimeString().slice(0, 5),
      endTime: new Date(s.end).toTimeString().slice(0, 5),
      note: s.note || "",
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const f = editing;
    const body = { userId: f.userId, start: `${f.date}T${f.startTime}`, end: `${f.date}T${f.endTime}`, note: f.note };
    const url = f.id ? `/api/admin/shifts/${f.id}` : "/api/admin/shifts";
    const res = await fetch(url, { method: f.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setEditing(null); load(); }
  }
  async function del() {
    if (!editing?.id || !confirm("Usunąć zmianę?")) return;
    await fetch(`/api/admin/shifts/${editing.id}`, { method: "DELETE" });
    setEditing(null); load();
  }
  async function setAvailStatus(id: string, status: string) {
    await fetch(`/api/admin/availability/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }

  const set = (k: string, v: any) => setEditing((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-gold-grad text-3xl flex items-center gap-3"><span>🗓️</span> {isManager ? "Grafik zespołu" : "Mój grafik"}</h1>
        {isManager && (
          <div className="flex gap-2 items-center">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field-input text-sm" style={{ width: "auto" }}>
              <option value="">Wszyscy</option>
              {users.map((u) => <option key={u.id} value={u.id} style={{ background: "var(--navy-d)" }}>{u.name || u.email}</option>)}
            </select>
            <button onClick={() => newShift()} className="btn-gold" style={{ clipPath: "none", padding: "10px 20px" }}>+ Zmiana</button>
          </div>
        )}
      </div>

      <div className="p-4 rounded mb-6" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
        <MonthCalendar
          events={events}
          year={year}
          month={month}
          onMonthChange={(y, m) => { setYear(y); setMonth(m); }}
          onDayClick={isManager ? newShift : undefined}
          onEventClick={editShift}
        />
      </div>

      {isManager && (
        <div className="p-4 rounded" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
          <h2 className="font-serif text-sm tracking-[2px] uppercase mb-3" style={{ color: "var(--gold)" }}>Zgłoszona dyspozycyjność</h2>
          {avail.length === 0 ? <p className="text-sm" style={{ color: "var(--muted)" }}>Brak zgłoszeń.</p> : (
            <div className="flex flex-col gap-2">
              {avail.map((a) => (
                <div key={a.id} className="flex items-center gap-3 text-sm flex-wrap" style={{ color: "var(--text)" }}>
                  <span className="flex-1 min-w-0">
                    <b>{a.user?.name || a.user?.email}</b> · {new Date(a.start).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}–{new Date(a.end).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
                    {a.note && <span style={{ color: "var(--muted)" }}> — {a.note}</span>}
                  </span>
                  <span className="text-[11px]" style={{ color: a.status === "APPROVED" ? "#7eebb0" : a.status === "REJECTED" ? "#fca5a5" : "var(--gold)" }}>{a.status}</span>
                  <button onClick={() => setAvailStatus(a.id, "APPROVED")} className="text-[11px] px-2 py-[2px] rounded" style={{ border: "1px solid var(--border)", color: "#7eebb0" }}>Akceptuj</button>
                  <button onClick={() => setAvailStatus(a.id, "REJECTED")} className="text-[11px] px-2 py-[2px] rounded" style={{ border: "1px solid var(--border)", color: "#fca5a5" }}>Odrzuć</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[5000] flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,.8)" }} onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="w-full max-w-[440px] my-8 p-6 md:p-8 rounded" style={{ background: "var(--navy-d)", border: "1px solid var(--border-h)" }}>
            <h2 className="font-display text-gold-grad text-2xl mb-6">{editing.id ? "Edytuj zmianę" : "Nowa zmiana"}</h2>
            <div className="grid grid-cols-1 gap-4">
              <div><label className="field-label">Pracownik</label>
                <select className="field-input" value={editing.userId} onChange={(e) => set("userId", e.target.value)}>
                  {users.map((u) => <option key={u.id} value={u.id} style={{ background: "var(--navy-d)" }}>{u.name || u.email}</option>)}
                </select>
              </div>
              <div><label className="field-label">Data</label><input type="date" className="field-input" value={editing.date} onChange={(e) => set("date", e.target.value)} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="field-label">Od</label><input type="time" className="field-input" value={editing.startTime} onChange={(e) => set("startTime", e.target.value)} required /></div>
                <div><label className="field-label">Do</label><input type="time" className="field-input" value={editing.endTime} onChange={(e) => set("endTime", e.target.value)} required /></div>
              </div>
              <div><label className="field-label">Notatka</label><input type="text" className="field-input" value={editing.note} onChange={(e) => set("note", e.target.value)} /></div>
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

function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i); return h; }
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
