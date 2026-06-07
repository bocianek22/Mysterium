"use client";
import { useEffect, useState, useCallback } from "react";
import { EXPENSE_CATEGORIES, expenseCategoryLabel } from "@/lib/expenses";
import FileUpload from "./FileUpload";

const MONTHS = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];
const zl = (n: number) => (n || 0).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

export default function ExpensesManager() {
  const now = new Date();
  const [y, setY] = useState(now.getFullYear());
  const [m, setM] = useState(now.getMonth());
  const [data, setData] = useState<{ items: any[]; total: number }>({ items: [], total: 0 });
  const [form, setForm] = useState<any>({ date: todayStr(), category: "ZAKUP", description: "", amount: "", vendor: "", invoiceNo: "", invoiceUrl: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/wydatki?y=${y}&m=${m}`);
    if (res.ok) setData(await res.json());
  }, [y, m]);
  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaving(true);
    const res = await fetch("/api/admin/wydatki", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { setForm({ ...form, description: "", amount: "", vendor: "", invoiceNo: "", invoiceUrl: "" }); load(); }
    else setError((await res.json()).error || "Nie udało się zapisać");
  }
  async function del(id: string) {
    if (!confirm("Usunąć wydatek?")) return;
    await fetch(`/api/admin/wydatki/${id}`, { method: "DELETE" });
    load();
  }

  const prev = () => (m === 0 ? (setY(y - 1), setM(11)) : setM(m - 1));
  const next = () => (m === 11 ? (setY(y + 1), setM(0)) : setM(m + 1));

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>🧾</span> Wydatki</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Wydatki firmowe (zakupy, naprawy, konserwacja, media). Wliczane do kosztów w pulpicie finansowym.</p>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button onClick={prev} className="px-3 py-1 rounded text-sm" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>‹</button>
        <span className="font-display text-xl" style={{ color: "var(--gold)" }}>{MONTHS[m]} {y}</span>
        <button onClick={next} className="px-3 py-1 rounded text-sm" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>›</button>
        <span className="ml-auto font-display text-xl" style={{ color: "#fca5a5" }}>Razem: {zl(data.total)}</span>
      </div>

      <form onSubmit={add} className="p-5 rounded mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <div><label className="field-label">Data</label><input type="date" className="field-input" value={form.date} onChange={(e) => set("date", e.target.value)} required /></div>
        <div><label className="field-label">Kategoria</label>
          <select className="field-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c.key} value={c.key} style={{ background: "var(--navy-d)" }}>{c.label}</option>)}
          </select>
        </div>
        <div><label className="field-label">Kwota brutto (zł)</label><input type="number" step="0.01" min="0" className="field-input" value={form.amount} onChange={(e) => set("amount", e.target.value)} required /></div>
        <div><label className="field-label">Sprzedawca (opcjonalnie)</label><input className="field-input" value={form.vendor} onChange={(e) => set("vendor", e.target.value)} /></div>
        <div className="lg:col-span-2"><label className="field-label">Opis *</label><input className="field-input" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="np. baterie do kłódek, farba" required /></div>
        <div><label className="field-label">Nr faktury (opcjonalnie)</label><input className="field-input" value={form.invoiceNo} onChange={(e) => set("invoiceNo", e.target.value)} /></div>
        <button type="submit" disabled={saving} className="btn-gold" style={{ clipPath: "none", padding: "11px 16px" }}>{saving ? "Zapisywanie…" : "Dodaj wydatek"}</button>
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="field-label">Faktura / paragon (skan PDF lub zdjęcie)</label>
          <FileUpload value={form.invoiceUrl || ""} onChange={(url) => set("invoiceUrl", url)} accept="image/*,application/pdf" kind="doc" />
        </div>
      </form>
      {error && <p className="text-sm mb-4" style={{ color: "#fca5a5" }}>{error}</p>}

      {data.items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Brak wydatków w tym miesiącu.</p>
      ) : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
              {["Data", "Kategoria", "Opis", "Sprzedawca", "Kwota", "Faktura", "Dodał", ""].map((h) => <th key={h} className="text-left font-serif text-[10px] tracking-[1px] uppercase px-3 py-3">{h}</th>)}
            </tr></thead>
            <tbody>
              {data.items.map((e) => (
                <tr key={e.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{new Date(e.date).toLocaleDateString("pl-PL")}</td>
                  <td className="px-3 py-2">{expenseCategoryLabel(e.category)}</td>
                  <td className="px-3 py-2">{e.description}{e.invoiceNo ? <span style={{ color: "var(--dim)" }}> · {e.invoiceNo}</span> : null}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{e.vendor || "—"}</td>
                  <td className="px-3 py-2 font-display" style={{ color: "#fca5a5" }}>{zl(e.amount)}</td>
                  <td className="px-3 py-2">{e.invoiceUrl ? <a href={e.invoiceUrl} target="_blank" rel="noreferrer" style={{ color: "var(--gold)" }}>📄</a> : "—"}</td>
                  <td className="px-3 py-2" style={{ color: "var(--dim)" }}>{e.createdByName || "—"}</td>
                  <td className="px-3 py-2"><button onClick={() => del(e.id)} className="text-[11px] px-2 py-[2px] rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Usuń</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
