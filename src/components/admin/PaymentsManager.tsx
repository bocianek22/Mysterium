"use client";
import { useEffect, useState, useCallback } from "react";
import CopyField from "./CopyField";

const zl = (g: number) => (g / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
const STATUS: Record<string, { label: string; color: string }> = {
  PAID: { label: "Opłacone", color: "#7eebb0" },
  PENDING: { label: "Oczekuje", color: "var(--gold)" },
  FAILED: { label: "Nieudane", color: "#fca5a5" },
  CANCELLED: { label: "Anulowane", color: "var(--muted)" },
};

export default function PaymentsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [cfg, setCfg] = useState<any>(null);
  const [form, setForm] = useState({ amount: "", description: "", buyerName: "", buyerEmail: "" });
  const [err, setErr] = useState("");
  const [created, setCreated] = useState<string>("");
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/payments");
    if (res.ok) { const d = await res.json(); setItems(d.items); setCfg(d.cfg); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  async function create(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setCreated("");
    const res = await fetch("/api/admin/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const j = await res.json();
    if (res.ok) { setCreated(`${origin}/pl/platnosc/${j.item.id}`); setForm({ amount: "", description: "", buyerName: "", buyerEmail: "" }); load(); }
    else setErr(j.error || "Błąd");
  }

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>💳</span> Płatności</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        {cfg?.enabled
          ? <>Operator: <b style={{ color: "var(--gold)" }}>{cfg.provider === "P24" ? "Przelewy24" : "Stripe"}</b>. Twórz linki do zapłaty (zadatek lub całość) na eventy i wyceny.</>
          : <span style={{ color: "#fca5a5" }}>Płatności online są wyłączone — włącz je w Ustawienia → Płatności i ustaw klucze API.</span>}
      </p>

      <form onSubmit={create} className="p-5 rounded mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <div><label className="field-label">Kwota (zł)</label><input type="number" step="0.01" min="1" className="field-input" value={form.amount} onChange={(e) => set("amount", e.target.value)} required /></div>
        <div className="lg:col-span-2"><label className="field-label">Opis *</label><input className="field-input" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="np. Zadatek — event firmowy 12.04" required /></div>
        <button type="submit" disabled={!cfg?.enabled} className="btn-gold" style={{ clipPath: "none", padding: "11px 16px", opacity: cfg?.enabled ? 1 : 0.5 }}>Utwórz link</button>
        <div><label className="field-label">Klient — imię (opc.)</label><input className="field-input" value={form.buyerName} onChange={(e) => set("buyerName", e.target.value)} /></div>
        <div><label className="field-label">Klient — e-mail (opc.)</label><input className="field-input" value={form.buyerEmail} onChange={(e) => set("buyerEmail", e.target.value)} placeholder="potwierdzenie zapłaty" /></div>
      </form>
      {err && <p className="text-sm mb-4" style={{ color: "#fca5a5" }}>{err}</p>}
      {created && (
        <div className="p-4 rounded mb-6" style={{ background: "rgba(126,235,176,.08)", border: "1px solid rgba(126,235,176,.3)" }}>
          <div className="text-sm mb-2" style={{ color: "#7eebb0" }}>✓ Link utworzony — wyślij go klientowi:</div>
          <CopyField value={created} />
        </div>
      )}

      {items.length === 0 ? <p style={{ color: "var(--muted)" }}>Brak płatności.</p> : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
              {["Data", "Opis", "Typ", "Kwota", "Status", "Klient", "Link"].map((h) => <th key={h} className="text-left font-serif text-[10px] tracking-[1px] uppercase px-3 py-3">{h}</th>)}
            </tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{new Date(p.createdAt).toLocaleDateString("pl-PL")}</td>
                  <td className="px-3 py-2">{p.description || "—"}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{p.purpose === "VOUCHER" ? "Bon" : "Event"}</td>
                  <td className="px-3 py-2 font-display" style={{ color: "var(--gold)" }}>{zl(p.amount)}</td>
                  <td className="px-3 py-2" style={{ color: (STATUS[p.status] || {}).color }}>{(STATUS[p.status] || {}).label || p.status}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{p.buyerEmail || p.buyerName || "—"}</td>
                  <td className="px-3 py-2">{p.status !== "PAID" ? <a href={`/pl/platnosc/${p.id}`} target="_blank" rel="noreferrer" style={{ color: "var(--gold-l)" }}>↗</a> : "✓"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
