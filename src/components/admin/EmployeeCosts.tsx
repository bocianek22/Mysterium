"use client";
import { useEffect, useState, useCallback } from "react";
import FileUpload from "./FileUpload";

type Res = any;

export default function EmployeeCosts() {
  const [items, setItems] = useState<Res[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const from = new Date(Date.now() - 30 * 86400000).toISOString();
    const to = new Date(Date.now() + 60 * 86400000).toISOString();
    const res = await fetch(`/api/admin/reservations?from=${from}&to=${to}`);
    if (res.ok) setItems((await res.json()).items);
  }, []);
  useEffect(() => { load(); }, [load]);

  function start(r: Res) {
    setOpen(r.id);
    setForm({ fuelCost: r.fuelCost || 0, fuelInvoiceUrl: r.fuelInvoiceUrl || "", otherCost: r.otherCost || 0, otherInvoiceUrl: r.otherInvoiceUrl || "" });
    setMsg("");
  }
  async function save(id: string) {
    setMsg("Zapisywanie...");
    const res = await fetch(`/api/admin/reservations/${id}/cost`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setMsg("✓ Zapisano"); setOpen(null); load(); }
    else setMsg("Błąd zapisu");
  }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  if (items.length === 0) return null;

  return (
    <div className="mt-6 p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
      <h2 className="font-serif text-sm tracking-[2px] uppercase mb-4" style={{ color: "var(--gold)" }}>⛽ Twoje zlecenia — koszty</h2>
      <div className="flex flex-col gap-2">
        {items.map((r) => (
          <div key={r.id} className="rounded" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-3 p-3 flex-wrap">
              <div className="text-sm" style={{ color: "var(--text)" }}>
                <span style={{ color: "var(--gold)" }}>{r.refNo || "—"}</span> · {r.title} · {new Date(r.start).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" })}
                {r.fuelCost > 0 && <span className="ml-2 text-[11px]" style={{ color: "var(--muted)" }}>paliwo: {r.fuelCost} zł</span>}
              </div>
              <button onClick={() => (open === r.id ? setOpen(null) : start(r))} className="text-xs px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>
                {open === r.id ? "Zwiń" : "Dodaj koszty"}
              </button>
            </div>
            {open === r.id && (
              <div className="p-3 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Koszt paliwa (zł)</label><input type="number" step="0.01" className="field-input" value={form.fuelCost} onChange={(e) => set("fuelCost", e.target.value)} /></div>
                <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Faktura za paliwo</label><FileUpload value={form.fuelInvoiceUrl || ""} onChange={(u) => set("fuelInvoiceUrl", u)} accept="image/*,application/pdf" kind="doc" /></div>
                <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Inne koszty (zł)</label><input type="number" step="0.01" className="field-input" value={form.otherCost} onChange={(e) => set("otherCost", e.target.value)} /></div>
                <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Faktura — inne</label><FileUpload value={form.otherInvoiceUrl || ""} onChange={(u) => set("otherInvoiceUrl", u)} accept="image/*,application/pdf" kind="doc" /></div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <button onClick={() => save(r.id)} className="btn-gold" style={{ clipPath: "none", padding: "9px 20px" }}>Zapisz koszty</button>
                  {msg && <span className="text-xs" style={{ color: "var(--gold)" }}>{msg}</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
