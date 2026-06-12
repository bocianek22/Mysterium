"use client";
import { useEffect, useState, useCallback } from "react";
import { LEAVE_TYPES, leaveTypeLabel, workingDays } from "@/lib/leave";

type Item = {
  id: string; startDate: string; endDate: string; days: number; type: string;
  reason?: string | null; status: string; decidedBy?: string | null;
  user?: { id: string; name?: string | null; email: string };
};

export default function LeaveManager() {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState({ startDate: todayStr(), endDate: todayStr(), type: "URLOP", reason: "", userId: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/leave");
    if (res.ok) setData(await res.json());
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const body: any = { startDate: form.startDate, endDate: form.endDate, type: form.type, reason: form.reason };
    if (data?.manager && form.userId) body.userId = form.userId;
    const res = await fetch("/api/admin/leave", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setForm({ ...form, reason: "" }); load(); }
    else setError((await res.json()).error || "Nie udało się zapisać");
  }
  async function decide(id: string, status: string) {
    await fetch(`/api/admin/leave/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }
  async function del(id: string) {
    await fetch(`/api/admin/leave/${id}`, { method: "DELETE" });
    load();
  }

  if (!data) return <p style={{ color: "var(--muted)" }}>Ładowanie…</p>;
  const manager = data.manager;
  const previewDays = workingDays(form.startDate, form.endDate);

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>🏖️</span> {manager ? "Wnioski urlopowe" : "Mój urlop"}</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        {manager ? "Rozpatruj wnioski i pilnuj salda dni wolnych zespołu." : "Złóż wniosek urlopowy i sprawdź pozostałe dni wolne."}
      </p>

      {/* Saldo */}
      {!manager ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: `Limit ${data.year}`, value: data.allowance, color: "var(--gold)" },
            { label: "Wykorzystane", value: data.used, color: "var(--text)" },
            { label: "Oczekujące", value: data.pending, color: "#fcd34d" },
            { label: "Pozostało", value: data.remaining, color: data.remaining >= 0 ? "#7eebb0" : "#fca5a5", big: true },
          ].map((c: any) => (
            <div key={c.label} className="p-5 rounded" style={{ background: "rgba(13,27,42,.7)", border: "1px solid var(--border)" }}>
              <div className="font-display" style={{ color: c.color, fontSize: c.big ? 30 : 24 }}>{c.value} <span className="text-sm">dni</span></div>
              <div className="font-serif text-[10px] tracking-[1px] uppercase mt-1" style={{ color: "var(--muted)" }}>{c.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded mb-6" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
              {["Pracownik", `Limit ${data.year}`, "Wykorzystane", "Oczekujące", "Pozostało"].map((h) => <th key={h} className="text-left font-serif text-[10px] tracking-[1px] uppercase px-4 py-3">{h}</th>)}
            </tr></thead>
            <tbody>
              {data.balances.map((b: any) => (
                <tr key={b.userId} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-4 py-2">{b.name}</td>
                  <td className="px-4 py-2">{b.allowance}</td>
                  <td className="px-4 py-2">{b.used}</td>
                  <td className="px-4 py-2" style={{ color: b.pending ? "#fcd34d" : "var(--muted)" }}>{b.pending}</td>
                  <td className="px-4 py-2 font-display" style={{ color: b.remaining >= 0 ? "#7eebb0" : "#fca5a5" }}>{b.remaining}</td>
                </tr>
              ))}
              {data.balances.length === 0 && <tr><td colSpan={5} className="px-4 py-3" style={{ color: "var(--muted)" }}>Brak pracowników.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Formularz wniosku */}
      <form onSubmit={add} className="p-5 rounded mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        {manager && (
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="field-label">Pracownik</label>
            <select className="field-input" value={form.userId} onChange={(e) => set("userId", e.target.value)} required>
              <option value="" style={{ background: "var(--navy-d)" }}>Wybierz…</option>
              {data.balances.map((b: any) => <option key={b.userId} value={b.userId} style={{ background: "var(--navy-d)" }}>{b.name}</option>)}
            </select>
          </div>
        )}
        <div><label className="field-label">Od</label><input type="date" className="field-input" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required /></div>
        <div><label className="field-label">Do</label><input type="date" className="field-input" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} required /></div>
        <div><label className="field-label">Typ</label>
          <select className="field-input" value={form.type} onChange={(e) => set("type", e.target.value)}>
            {LEAVE_TYPES.map((t) => <option key={t.key} value={t.key} style={{ background: "var(--navy-d)" }}>{t.label}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-gold" style={{ clipPath: "none", padding: "11px 16px" }}>{manager ? "Dodaj (zatwierdzony)" : "Złóż wniosek"}</button>
        <div className="sm:col-span-2 lg:col-span-4"><label className="field-label">Powód / notatka (opcjonalnie)</label><input className="field-input" value={form.reason} onChange={(e) => set("reason", e.target.value)} /></div>
        <div className="sm:col-span-2 lg:col-span-4 text-[12px]" style={{ color: "var(--muted)" }}>
          Wniosek obejmie <b style={{ color: "var(--gold)" }}>{previewDays}</b> dni roboczych (pon–pt).
        </div>
      </form>
      {error && <p className="text-sm mb-4" style={{ color: "#fca5a5" }}>{error}</p>}

      {/* Lista wniosków */}
      <div className="flex flex-col gap-2">
        {data.items.length === 0 ? <p style={{ color: "var(--muted)" }}>Brak wniosków.</p> : data.items.map((a: Item) => (
          <div key={a.id} className="flex items-center gap-3 p-3 rounded text-sm flex-wrap" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
            <span className="flex-1 min-w-0" style={{ color: "var(--text)" }}>
              {manager && a.user && <b>{a.user.name || a.user.email} · </b>}
              {fmt(a.startDate)}–{fmt(a.endDate)} <span style={{ color: "var(--muted)" }}>({a.days} dni rob. · {leaveTypeLabel(a.type)})</span>
              {a.reason && <span style={{ color: "var(--muted)" }}> — {a.reason}</span>}
            </span>
            <span className="text-[11px]" style={{ color: statusColor(a.status) }}>{statusLabel(a.status)}{a.decidedBy ? ` · ${a.decidedBy}` : ""}</span>
            {manager ? (
              <span className="flex gap-2">
                {a.status !== "APPROVED" && <button onClick={() => decide(a.id, "APPROVED")} className="text-[11px] px-2 py-[2px] rounded" style={{ border: "1px solid rgba(126,235,176,.3)", color: "#7eebb0" }}>Akceptuj</button>}
                {a.status !== "REJECTED" && <button onClick={() => decide(a.id, "REJECTED")} className="text-[11px] px-2 py-[2px] rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Odrzuć</button>}
                <button onClick={() => del(a.id)} className="text-[11px] px-2 py-[2px] rounded" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>Usuń</button>
              </span>
            ) : (
              a.status === "PENDING" && <button onClick={() => del(a.id)} className="text-[11px] px-2 py-[2px] rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Anuluj</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const fmt = (s: string) => new Date(s).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "2-digit" });
const statusLabel = (s: string) => s === "APPROVED" ? "Zaakceptowany" : s === "REJECTED" ? "Odrzucony" : "Oczekuje";
const statusColor = (s: string) => s === "APPROVED" ? "#7eebb0" : s === "REJECTED" ? "#fca5a5" : "var(--gold)";
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
