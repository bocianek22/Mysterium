"use client";
import { useEffect, useState, useCallback } from "react";
import MonthCalendar, { CalEvent } from "./MonthCalendar";
import FileUpload from "./FileUpload";

type Room = { id: string; namePl: string };
type SimpleUser = { id: string; name?: string | null; email: string };
type Res = any;

const STATUS: Record<string, { label: string; color: string }> = {
  NEW: { label: "Wstępna", color: "#C9A84C" },
  CONFIRMED: { label: "Potwierdzona", color: "#7eebb0" },
  DONE: { label: "Zrealizowana", color: "#7dd3d0" },
  CANCELLED: { label: "Anulowana", color: "#fca5a5" },
};

export default function ReservationsManager({ rooms, users, showFinance = true }: { rooms: Room[]; users: SimpleUser[]; showFinance?: boolean }) {
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
    color: (STATUS[r.status]?.color) || (r.source === "LOCKME" ? "#7dd3d0" : "#C9A84C"),
  }));

  function add(date?: string) {
    setEditing({ title: "", roomId: "", date: date || todayStr(), startTime: "18:00", endTime: "19:00", people: 0, customerName: "", customerPhone: "", customerEmail: "", notes: "", status: "NEW", assignedUserId: "", deposit: 0, paid: false, price: 0, invoiceUrl: "", fuelCost: 0, fuelInvoiceUrl: "", otherCost: 0, otherInvoiceUrl: "" });
    setMsg("");
  }
  function edit(id: string) {
    const r = items.find((x) => x.id === id);
    if (!r) return;
    setEditing({
      id: r.id, refNo: r.refNo, title: r.title, roomId: r.roomId || "",
      date: r.start.slice(0, 10),
      startTime: new Date(r.start).toTimeString().slice(0, 5),
      endTime: new Date(r.end).toTimeString().slice(0, 5),
      people: r.people, customerName: r.customerName || "", customerPhone: r.customerPhone || "", customerEmail: r.customerEmail || "", notes: r.notes || "",
      status: r.status || "NEW", assignedUserId: r.assignedUserId || "", deposit: r.deposit || 0, paid: !!r.paid,
      price: r.price || 0, invoiceUrl: r.invoiceUrl || "", fuelCost: r.fuelCost || 0, fuelInvoiceUrl: r.fuelInvoiceUrl || "", otherCost: r.otherCost || 0, otherInvoiceUrl: r.otherInvoiceUrl || "",
    });
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const f = editing;
    const body = { title: f.title, roomId: f.roomId || null, start: `${f.date}T${f.startTime}`, end: `${f.date}T${f.endTime}`, people: f.people, customerName: f.customerName, customerPhone: f.customerPhone, customerEmail: f.customerEmail, notes: f.notes, status: f.status, assignedUserId: f.assignedUserId || null, deposit: f.deposit, paid: f.paid, price: f.price, invoiceUrl: f.invoiceUrl || null, fuelCost: f.fuelCost, fuelInvoiceUrl: f.fuelInvoiceUrl || null, otherCost: f.otherCost, otherInvoiceUrl: f.otherInvoiceUrl || null };
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
        <div className="flex gap-4 mt-3 text-[11px] flex-wrap" style={{ color: "var(--muted)" }}>
          {Object.values(STATUS).map((s) => (
            <span key={s.label}><span style={{ color: s.color }}>■</span> {s.label}</span>
          ))}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[5000] flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,.8)" }} onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="w-full max-w-[520px] my-8 p-6 md:p-8 rounded" style={{ background: "var(--navy-d)", border: "1px solid var(--border-h)" }}>
            <h2 className="font-display text-gold-grad text-2xl mb-1">{editing.id ? "Edytuj rezerwację" : "Nowa rezerwacja"}</h2>
            {editing.refNo && <div className="text-[11px] mb-5 font-serif tracking-[1px]" style={{ color: "var(--gold)" }}>Nr zlecenia: {editing.refNo}</div>}
            {!editing.refNo && <div className="mb-5" />}
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
              <div className="grid grid-cols-2 gap-3">
                <div><label className="field-label">Status</label>
                  <select className="field-input" value={editing.status} onChange={(e) => set("status", e.target.value)}>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k} style={{ background: "var(--navy-d)" }}>{v.label}</option>)}
                  </select>
                </div>
                <div><label className="field-label">Prowadzi (pracownik)</label>
                  <select className="field-input" value={editing.assignedUserId} onChange={(e) => set("assignedUserId", e.target.value)}>
                    <option value="" style={{ background: "var(--navy-d)" }}>—</option>
                    {users.map((u) => <option key={u.id} value={u.id} style={{ background: "var(--navy-d)" }}>{u.name || u.email}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div><label className="field-label">Zaliczka (zł)</label><input type="number" step="0.01" className="field-input" value={editing.deposit} onChange={(e) => set("deposit", e.target.value)} /></div>
                <label className="flex items-center gap-3 pb-2"><input type="checkbox" checked={editing.paid} onChange={(e) => set("paid", e.target.checked)} /><span className="text-sm" style={{ color: "var(--text)" }}>Opłacone</span></label>
              </div>

              {showFinance && (
              <div className="pt-3 mt-1" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="field-label mb-2">💰 Finanse zlecenia</div>
                <div className="grid grid-cols-2 gap-3 items-start">
                  <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Przychód / wartość (zł)</label><input type="number" step="0.01" className="field-input" value={editing.price} onChange={(e) => set("price", e.target.value)} /></div>
                  <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Faktura/paragon (przychód)</label><FileUpload value={editing.invoiceUrl || ""} onChange={(u) => set("invoiceUrl", u)} accept="image/*,application/pdf" kind="doc" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 items-start mt-3">
                  <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Koszt paliwa (zł)</label><input type="number" step="0.01" className="field-input" value={editing.fuelCost} onChange={(e) => set("fuelCost", e.target.value)} /></div>
                  <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Faktura za paliwo</label><FileUpload value={editing.fuelInvoiceUrl || ""} onChange={(u) => set("fuelInvoiceUrl", u)} accept="image/*,application/pdf" kind="doc" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 items-start mt-3">
                  <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Inne koszty (zł)</label><input type="number" step="0.01" className="field-input" value={editing.otherCost} onChange={(e) => set("otherCost", e.target.value)} /></div>
                  <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Faktura — inne koszty</label><FileUpload value={editing.otherInvoiceUrl || ""} onChange={(u) => set("otherInvoiceUrl", u)} accept="image/*,application/pdf" kind="doc" /></div>
                </div>
              </div>
              )}
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
