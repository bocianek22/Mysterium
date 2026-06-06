"use client";
import { useEffect, useState, useCallback } from "react";

type User = {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role: string;
  active: boolean;
  rateDay: number;
  rateNight: number;
  rateWeekend: number;
  calendarEmbed?: string | null;
  calendarToken: string;
};

const ROLES = [
  { value: "EMPLOYEE", label: "Pracownik" },
  { value: "ADMIN", label: "Admin" },
  { value: "OWNER", label: "Właściciel" },
];

const empty = { email: "", password: "", name: "", phone: "", role: "EMPLOYEE", active: true, rateDay: 0, rateNight: 0, rateWeekend: 0, canStationary: true, canMobile: true, targetHours: 0, telegramChatId: "", calendarEmbed: "" };

export default function UsersManager({ currentUserId }: { currentUserId: string }) {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) setItems((await res.json()).items);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  function startAdd() { setForm({ ...empty }); setEditing({}); setError(""); }
  function startEdit(u: User) { setForm({ ...u, password: "" }); setEditing(u); setError(""); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const isNew = !editing.id;
    const url = isNew ? "/api/admin/users" : `/api/admin/users/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) { await load(); setEditing(null); }
    else setError(data.error || "Błąd zapisu");
    setSaving(false);
  }

  async function remove(u: User) {
    if (!confirm(`Usunąć konto ${u.email}?`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) load(); else alert(data.error || "Błąd");
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-gold-grad text-3xl flex items-center gap-3"><span>👥</span> Pracownicy i konta</h1>
        <button onClick={startAdd} className="btn-gold" style={{ clipPath: "none", padding: "11px 24px" }}>+ Dodaj konto</button>
      </div>

      {loading ? <p style={{ color: "var(--muted)" }}>Ładowanie...</p> : (
        <div className="flex flex-col gap-2">
          {items.map((u) => (
            <div key={u.id} className="flex items-center gap-4 p-3 rounded flex-wrap" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
              <div className="flex-1 min-w-0">
                <div className="text-sm" style={{ color: "var(--text)" }}>
                  {u.name || "—"} <span style={{ color: "var(--dim)" }}>({u.email})</span>
                  {!u.active && <span className="ml-2 text-[10px]" style={{ color: "#fca5a5" }}>nieaktywne</span>}
                </div>
                <div className="text-[11px] mt-[2px]" style={{ color: "var(--muted)" }}>
                  {ROLES.find((r) => r.value === u.role)?.label} · stawki: {u.rateDay}/{u.rateNight}/{u.rateWeekend} zł/h (dzień/noc/wknd)
                </div>
              </div>
              <button onClick={() => startEdit(u)} className="text-xs px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>Edytuj</button>
              {u.id !== currentUserId && (
                <button onClick={() => remove(u)} className="text-xs px-3 py-1 rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Usuń</button>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[5000] flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,.8)" }} onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="w-full max-w-[560px] my-8 p-6 md:p-8 rounded" style={{ background: "var(--navy-d)", border: "1px solid var(--border-h)" }}>
            <h2 className="font-display text-gold-grad text-2xl mb-6">{editing.id ? "Edytuj konto" : "Nowe konto"}</h2>
            {error && <div className="px-4 py-3 text-[13px] mb-4" style={{ background: "rgba(239,68,68,.07)", borderLeft: "3px solid #ef4444", color: "#fca5a5" }}>{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="field-label">E-mail *</label><input type="email" className="field-input" value={form.email} onChange={(e) => set("email", e.target.value)} required /></div>
              <div><label className="field-label">{editing.id ? "Nowe hasło (opcjonalnie)" : "Hasło *"}</label><input type="text" className="field-input" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder={editing.id ? "zostaw puste" : "min. 6 znaków"} /></div>
              <div><label className="field-label">Imię i nazwisko</label><input type="text" className="field-input" value={form.name || ""} onChange={(e) => set("name", e.target.value)} /></div>
              <div><label className="field-label">Telefon</label><input type="text" className="field-input" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} /></div>
              <div><label className="field-label">Rola</label>
                <select className="field-input" value={form.role} onChange={(e) => set("role", e.target.value)}>
                  {ROLES.map((r) => <option key={r.value} value={r.value} style={{ background: "var(--navy-d)" }}>{r.label}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 mt-6"><input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} /><span className="text-sm" style={{ color: "var(--text)" }}>Konto aktywne</span></label>
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="field-label mb-2">Stawki godzinowe (zł/h)</div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Dzień</label><input type="number" step="0.01" className="field-input" value={form.rateDay} onChange={(e) => set("rateDay", e.target.value)} /></div>
                <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Noc (22–6)</label><input type="number" step="0.01" className="field-input" value={form.rateNight} onChange={(e) => set("rateNight", e.target.value)} /></div>
                <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Weekend</label><input type="number" step="0.01" className="field-input" value={form.rateWeekend} onChange={(e) => set("rateWeekend", e.target.value)} /></div>
              </div>
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="field-label mb-2">Auto-grafik</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}><input type="checkbox" checked={form.canStationary} onChange={(e) => set("canStationary", e.target.checked)} /> Stacjonarne</label>
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}><input type="checkbox" checked={form.canMobile} onChange={(e) => set("canMobile", e.target.checked)} /> Wyjazdy</label>
                <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Cel godzin / mies.</label><input type="number" className="field-input" value={form.targetHours} onChange={(e) => set("targetHours", e.target.value)} /></div>
              </div>
            </div>

            <div className="mt-4">
              <label className="field-label">Telegram — ID czatu (powiadomienia 1:1, opcjonalnie)</label>
              <input type="text" className="field-input" value={form.telegramChatId || ""} onChange={(e) => set("telegramChatId", e.target.value)} />
            </div>

            <div className="mt-4">
              <label className="field-label">Osadzony kalendarz Google (URL „embed", opcjonalnie)</label>
              <input type="text" className="field-input" value={form.calendarEmbed || ""} onChange={(e) => set("calendarEmbed", e.target.value)} placeholder="https://calendar.google.com/calendar/embed?src=..." />
            </div>

            <div className="flex gap-3 mt-8 justify-end">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline" style={{ clipPath: "none", padding: "11px 24px" }}>Anuluj</button>
              <button type="submit" disabled={saving} className="btn-gold" style={{ clipPath: "none", padding: "11px 24px" }}>{saving ? "Zapisywanie..." : "Zapisz"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
