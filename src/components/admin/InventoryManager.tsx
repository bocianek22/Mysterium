"use client";
import { useEffect, useState, useCallback } from "react";
import { INVENTORY_CATEGORIES, inventoryCategoryLabel } from "@/lib/inventory";

export default function InventoryManager({ canManage }: { canManage: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [lowCount, setLowCount] = useState(0);
  const [editing, setEditing] = useState<any | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/inventory");
    if (res.ok) { const d = await res.json(); setItems(d.items); setLowCount(d.lowCount); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const isLow = (i: any) => i.lowStock > 0 && i.quantity <= i.lowStock;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="font-display text-gold-grad text-3xl flex items-center gap-3"><span>📦</span> Magazyn</h1>
        {canManage && <button onClick={() => setAdding(true)} className="btn-gold" style={{ clipPath: "none", padding: "9px 18px" }}>+ Dodaj pozycję</button>}
      </div>
      <p className="text-sm mb-5" style={{ color: "var(--muted)" }}>
        Bilety, gadżety, akcesoria na wyjazdy. {lowCount > 0 ? <span style={{ color: "#fca5a5" }}>Niski stan: {lowCount}</span> : "Stany w normie."}
      </p>

      {items.length === 0 ? <p style={{ color: "var(--muted)" }}>Brak pozycji w magazynie.</p> : (
        <div className="overflow-x-auto rounded" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm" style={{ color: "var(--text)" }}>
            <thead><tr style={{ background: "rgba(201,168,76,.06)", color: "var(--gold)" }}>
              {["Pozycja", "Kategoria", "Stan", "Lokalizacja", ""].map((h) => <th key={h} className="text-left font-serif text-[10px] tracking-[1px] uppercase px-3 py-3">{h}</th>)}
            </tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="cursor-pointer hover:bg-white/5" style={{ borderTop: "1px solid var(--border)" }} onClick={() => openItem(i.id, setEditing)}>
                  <td className="px-3 py-2">{i.name}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{inventoryCategoryLabel(i.category)}</td>
                  <td className="px-3 py-2"><b style={{ color: isLow(i) ? "#fca5a5" : "var(--gold)" }}>{i.quantity} {i.unit}</b>{isLow(i) && <span className="text-[10px] ml-2 px-2 py-[1px] rounded" style={{ background: "rgba(239,68,68,.12)", color: "#fca5a5" }}>niski stan</span>}</td>
                  <td className="px-3 py-2" style={{ color: "var(--muted)" }}>{i.location || "—"}</td>
                  <td className="px-3 py-2 text-right" style={{ color: "var(--gold)" }}>Ruch ›</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adding && <ItemForm onClose={() => setAdding(false)} onSaved={() => { setAdding(false); load(); }} />}
      {editing && <ItemModal data={editing} canManage={canManage} onClose={() => setEditing(null)} onChanged={load} onClosed={() => setEditing(null)} />}
    </div>
  );
}

async function openItem(id: string, setEditing: (v: any) => void) {
  const res = await fetch(`/api/admin/inventory/${id}`);
  if (res.ok) setEditing((await res.json()).item);
}

function ItemForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({ name: "", category: "AKCESORIA", quantity: 0, unit: "szt.", lowStock: 0, location: "", notes: "" });
  const [error, setError] = useState("");
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  async function save() {
    const res = await fetch("/api/admin/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) onSaved(); else setError((await res.json()).error || "Błąd");
  }
  return (
    <Modal title="Nowa pozycja" onClose={onClose}>
      {error && <div className="px-4 py-3 text-[13px] mb-4" style={{ background: "rgba(239,68,68,.07)", borderLeft: "3px solid #ef4444", color: "#fca5a5" }}>{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="field-label">Nazwa *</label><input className="field-input" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><label className="field-label">Kategoria</label>
          <select className="field-input" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {INVENTORY_CATEGORIES.map((c) => <option key={c.key} value={c.key} style={{ background: "var(--navy-d)" }}>{c.label}</option>)}
          </select>
        </div>
        <div><label className="field-label">Jednostka</label><input className="field-input" value={form.unit} onChange={(e) => set("unit", e.target.value)} /></div>
        <div><label className="field-label">Stan początkowy</label><input type="number" className="field-input" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} /></div>
        <div><label className="field-label">Próg niskiego stanu (0 = brak)</label><input type="number" className="field-input" value={form.lowStock} onChange={(e) => set("lowStock", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="field-label">Lokalizacja</label><input className="field-input" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="np. szafa A / auto" /></div>
      </div>
      <div className="flex gap-3 mt-6 justify-end">
        <button onClick={onClose} className="btn-outline" style={{ clipPath: "none", padding: "10px 20px" }}>Anuluj</button>
        <button onClick={save} className="btn-gold" style={{ clipPath: "none", padding: "10px 20px" }}>Zapisz</button>
      </div>
    </Modal>
  );
}

function ItemModal({ data, canManage, onClose, onChanged }: { data: any; canManage: boolean; onClose: () => void; onChanged: () => void; onClosed: () => void }) {
  const [item, setItem] = useState<any>(data);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [edit, setEdit] = useState<any>({ name: data.name, category: data.category, unit: data.unit, lowStock: data.lowStock, location: data.location || "", notes: data.notes || "" });
  const [msg, setMsg] = useState("");

  async function refresh() {
    const res = await fetch(`/api/admin/inventory/${data.id}`);
    if (res.ok) setItem((await res.json()).item);
    onChanged();
  }
  async function move(sign: number) {
    const n = Math.abs(parseInt(amount || "0", 10));
    if (!n) { setMsg("Podaj ilość"); return; }
    const res = await fetch(`/api/admin/inventory/${data.id}/move`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ delta: sign * n, reason }) });
    if (res.ok) { setAmount(""); setReason(""); setMsg(""); refresh(); } else setMsg("Błąd");
  }
  async function saveEdit() {
    const res = await fetch(`/api/admin/inventory/${data.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit) });
    if (res.ok) { setMsg("✓ Zapisano"); refresh(); setTimeout(() => setMsg(""), 1500); }
  }
  async function del() {
    if (!confirm("Usunąć pozycję z magazynu?")) return;
    await fetch(`/api/admin/inventory/${data.id}`, { method: "DELETE" });
    onChanged(); onClose();
  }
  const setE = (k: string, v: any) => setEdit((f: any) => ({ ...f, [k]: v }));

  return (
    <Modal title={item.name} onClose={onClose}>
      <div className="flex items-center gap-3 mb-4">
        <span className="font-display text-3xl" style={{ color: "var(--gold)" }}>{item.quantity}</span>
        <span style={{ color: "var(--muted)" }}>{item.unit} · {inventoryCategoryLabel(item.category)}</span>
      </div>

      <div className="p-4 rounded mb-4" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <div className="field-label mb-2">Ruch magazynowy</div>
        <div className="flex gap-2 items-end flex-wrap">
          <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Ilość</label><input type="number" min="1" className="field-input" style={{ width: 90 }} value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <input className="field-input flex-1" style={{ minWidth: 140 }} placeholder="Powód (opcjonalnie)" value={reason} onChange={(e) => setReason(e.target.value)} />
          <button onClick={() => move(1)} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid rgba(126,235,176,.3)", color: "#7eebb0" }}>+ Przyjmij</button>
          <button onClick={() => move(-1)} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>− Wydaj</button>
        </div>
        {msg && <div className="text-xs mt-2" style={{ color: "var(--gold)" }}>{msg}</div>}
      </div>

      {item.movements?.length > 0 && (
        <div className="mb-4">
          <div className="field-label mb-2">Historia ruchów</div>
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {item.movements.map((m: any) => (
              <div key={m.id} className="text-[12px] flex justify-between" style={{ color: "var(--muted)" }}>
                <span>{new Date(m.createdAt).toLocaleString("pl-PL")} · {m.byName || ""}{m.reason ? ` · ${m.reason}` : ""}</span>
                <span style={{ color: m.delta >= 0 ? "#7eebb0" : "#fca5a5" }}>{m.delta >= 0 ? "+" : ""}{m.delta}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {canManage && (
        <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="field-label mb-2">Edycja pozycji</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Nazwa</label><input className="field-input" value={edit.name} onChange={(e) => setE("name", e.target.value)} /></div>
            <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Kategoria</label>
              <select className="field-input" value={edit.category} onChange={(e) => setE("category", e.target.value)}>
                {INVENTORY_CATEGORIES.map((c) => <option key={c.key} value={c.key} style={{ background: "var(--navy-d)" }}>{c.label}</option>)}
              </select>
            </div>
            <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Jednostka</label><input className="field-input" value={edit.unit} onChange={(e) => setE("unit", e.target.value)} /></div>
            <div><label className="text-[10px]" style={{ color: "var(--muted)" }}>Próg niskiego stanu</label><input type="number" className="field-input" value={edit.lowStock} onChange={(e) => setE("lowStock", e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="text-[10px]" style={{ color: "var(--muted)" }}>Lokalizacja</label><input className="field-input" value={edit.location} onChange={(e) => setE("location", e.target.value)} /></div>
          </div>
          <div className="flex justify-between mt-4">
            <button onClick={del} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Usuń</button>
            <button onClick={saveEdit} className="btn-gold" style={{ clipPath: "none", padding: "9px 18px" }}>Zapisz zmiany</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[5000] flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,.8)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[560px] my-8 p-6 md:p-8 rounded" style={{ background: "var(--navy-d)", border: "1px solid var(--border-h)" }}>
        <h2 className="font-display text-gold-grad text-2xl mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}
