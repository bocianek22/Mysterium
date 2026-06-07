"use client";
import { useEffect, useState, useCallback } from "react";

const zl = (n: number) => (n || 0).toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " zł";
const date = (d?: string | null) => (d ? new Date(d).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "2-digit" }) : "—");
const SUGGESTED_TAGS = ["VIP", "stały", "firma"];

type Row = { id: string; name?: string; email?: string; phone?: string; company?: string; marketingConsent: boolean; tags: string[]; visits: number; spend: number; lastVisit?: string | null };

export default function CustomersManager() {
  const [items, setItems] = useState<Row[]>([]);
  const [meta, setMeta] = useState({ total: 0, consented: 0 });
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/customers?q=${encodeURIComponent(q)}`);
    if (res.ok) { const d = await res.json(); setItems(d.items); setMeta({ total: d.total, consented: d.consented }); }
  }, [q]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  async function backfill() {
    setMsg("Importuję…");
    const res = await fetch("/api/admin/customers/backfill", { method: "POST" });
    const d = await res.json();
    setMsg(res.ok ? `✓ Powiązano ${d.linked} rezerwacji` : "Błąd importu");
    load();
    setTimeout(() => setMsg(""), 4000);
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="font-display text-gold-grad text-3xl flex items-center gap-3"><span>📇</span> Klienci</h1>
        <div className="flex gap-2">
          <button onClick={backfill} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>↻ Import z rezerwacji</button>
          <button onClick={() => setEditing({ tags: [], marketingConsent: false })} className="btn-gold" style={{ clipPath: "none", padding: "9px 18px" }}>+ Dodaj klienta</button>
        </div>
      </div>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
        Baza klientów: <b style={{ color: "var(--text)" }}>{meta.total}</b> · zgoda marketingowa: <b style={{ color: "#7eebb0" }}>{meta.consented}</b>
        {msg && <span className="ml-3" style={{ color: "var(--gold)" }}>{msg}</span>}
      </p>

      <input className="field-input mb-4 max-w-sm" placeholder="Szukaj: imię, e-mail, telefon, firma…" value={q} onChange={(e) => setQ(e.target.value)} />

      {items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Brak klientów. Dodaj ręcznie lub kliknij „Import z rezerwacji”.</p>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
              {["Klient", "Kontakt", "Tagi", "Gry", "Wydał", "Ostatnia", "Zgoda"].map((h) => <th key={h} className="text-left font-serif text-[10px] tracking-[1px] uppercase px-3 py-3">{h}</th>)}
            </tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="cursor-pointer hover:bg-white/5" style={{ borderTop: "1px solid var(--border)" }} onClick={() => openDetail(c.id, setEditing)}>
                  <td className="px-3 py-2">{c.name || "—"}{c.company ? <span style={{ color: "var(--dim)" }}> · {c.company}</span> : null}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{c.email || c.phone || "—"}</td>
                  <td className="px-3 py-2">{c.tags.map((t) => <span key={t} className="inline-block text-[10px] px-2 py-[1px] rounded mr-1" style={{ background: "rgba(201,168,76,.12)", color: "var(--gold)" }}>{t}</span>)}</td>
                  <td className="px-3 py-2">{c.visits}</td>
                  <td className="px-3 py-2">{zl(c.spend)}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{date(c.lastVisit)}</td>
                  <td className="px-3 py-2">{c.marketingConsent ? "✅" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <CustomerModal data={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

async function openDetail(id: string, setEditing: (v: any) => void) {
  const res = await fetch(`/api/admin/customers/${id}`);
  if (res.ok) { const d = await res.json(); setEditing(d.customer); }
}

function CustomerModal({ data, onClose, onSaved }: { data: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({
    name: data.name || "", email: data.email || "", phone: data.phone || "", company: data.company || "",
    marketingConsent: !!data.marketingConsent, tags: data.tags || [], notes: data.notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const toggleTag = (t: string) => set("tags", form.tags.includes(t) ? form.tags.filter((x: string) => x !== t) : [...form.tags, t]);
  const isNew = !data.id;
  const history = data.reservations || [];

  async function save() {
    setSaving(true); setError("");
    const url = isNew ? "/api/admin/customers" : `/api/admin/customers/${data.id}`;
    const res = await fetch(url, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) onSaved(); else setError((await res.json()).error || "Błąd zapisu");
  }
  async function remove() {
    if (!confirm("Usunąć klienta? Historia rezerwacji pozostanie, ale zostanie odpięta.")) return;
    await fetch(`/api/admin/customers/${data.id}`, { method: "DELETE" });
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[5000] flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,.8)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[560px] my-8 p-6 md:p-8 rounded" style={{ background: "var(--navy-d)", border: "1px solid var(--border-h)" }}>
        <h2 className="font-display text-gold-grad text-2xl mb-6">{isNew ? "Nowy klient" : (form.name || "Klient")}</h2>
        {error && <div className="px-4 py-3 text-[13px] mb-4" style={{ background: "rgba(239,68,68,.07)", borderLeft: "3px solid #ef4444", color: "#fca5a5" }}>{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="field-label">Imię i nazwisko</label><input className="field-input" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className="field-label">Firma</label><input className="field-input" value={form.company} onChange={(e) => set("company", e.target.value)} /></div>
          <div><label className="field-label">E-mail</label><input className="field-input" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><label className="field-label">Telefon</label><input className="field-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        </div>

        <div className="mt-4">
          <label className="field-label">Tagi</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {Array.from(new Set([...SUGGESTED_TAGS, ...form.tags])).map((t) => (
              <button key={t} type="button" onClick={() => toggleTag(t)} className="text-xs px-3 py-1 rounded" style={form.tags.includes(t) ? { background: "var(--gold)", color: "#1a1206" } : { border: "1px solid var(--border)", color: "var(--muted)" }}>{t}</button>
            ))}
          </div>
          <input className="field-input text-xs" placeholder="Dodaj własny tag i Enter" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = (e.target as HTMLInputElement).value.trim(); if (v && !form.tags.includes(v)) set("tags", [...form.tags, v]); (e.target as HTMLInputElement).value = ""; } }} />
        </div>

        <label className="flex items-center gap-3 mt-4">
          <input type="checkbox" checked={form.marketingConsent} onChange={(e) => set("marketingConsent", e.target.checked)} />
          <span className="text-sm" style={{ color: "var(--text)" }}>Zgoda marketingowa (newsletter / promocje)</span>
        </label>

        <div className="mt-4"><label className="field-label">Notatki</label><textarea className="field-input h-20 resize-none" value={form.notes} onChange={(e) => set("notes", e.target.value)} /></div>

        {!isNew && (
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="field-label mb-2">Historia gier ({history.length})</div>
            {history.length === 0 ? <p className="text-xs" style={{ color: "var(--muted)" }}>Brak powiązanych rezerwacji.</p> : (
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {history.map((r: any) => (
                  <div key={r.id} className="text-[12px] flex justify-between" style={{ color: "var(--muted)" }}>
                    <span>{date(r.start)} · {r.room?.namePl || r.title}{r.people ? ` · ${r.people} os.` : ""}</span>
                    <span>{r.status === "CANCELLED" ? "anulowana" : zl(r.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-8 justify-between">
          <div>{!isNew && <button type="button" onClick={remove} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Usuń</button>}</div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline" style={{ clipPath: "none", padding: "10px 20px" }}>Anuluj</button>
            <button type="button" onClick={save} disabled={saving} className="btn-gold" style={{ clipPath: "none", padding: "10px 20px" }}>{saving ? "Zapisywanie…" : "Zapisz"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
