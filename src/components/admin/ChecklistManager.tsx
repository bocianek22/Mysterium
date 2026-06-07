"use client";
import { useEffect, useState, useCallback } from "react";
import { CHECKLIST_KINDS } from "@/lib/ops";

export default function ChecklistManager({ canManage }: { canManage: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [date, setDate] = useState("");
  const [manage, setManage] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/checklist");
    if (res.ok) { const d = await res.json(); setItems(d.items); setDate(d.date); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function toggle(itemId: string, checked: boolean) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, checked } : i)));
    await fetch("/api/admin/checklist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId, checked }) });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="font-display text-gold-grad text-3xl flex items-center gap-3"><span>✅</span> Checklisty</h1>
        {canManage && <button onClick={() => setManage((m) => !m)} className="text-sm px-4 py-2 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>{manage ? "← Wróć do checklisty" : "⚙ Zarządzaj szablonem"}</button>}
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        {manage ? "Edytuj pozycje checklist otwarcia i zamknięcia." : `Odhaczaj zadania na dziś${date ? " · " + new Date(date).toLocaleDateString("pl-PL", { weekday: "long", day: "2-digit", month: "long" }) : ""}.`}
      </p>

      {manage ? <TemplateEditor onChange={load} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CHECKLIST_KINDS.map((k) => {
            const list = items.filter((i) => i.kind === k.key);
            const done = list.filter((i) => i.checked).length;
            return (
              <div key={k.key} className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif text-sm tracking-[2px] uppercase" style={{ color: "var(--gold)" }}>{k.label}</h2>
                  <span className="text-xs" style={{ color: done === list.length && list.length ? "#7eebb0" : "var(--muted)" }}>{done}/{list.length}</span>
                </div>
                {list.length === 0 ? <p className="text-sm" style={{ color: "var(--muted)" }}>Brak pozycji. {canManage ? "Dodaj w „Zarządzaj szablonem”." : ""}</p> : (
                  <ul className="flex flex-col gap-2">
                    {list.map((i) => (
                      <li key={i.id}>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" checked={i.checked} onChange={(e) => toggle(i.id, e.target.checked)} className="mt-1" />
                          <span className="text-sm" style={{ color: i.checked ? "var(--muted)" : "var(--text)", textDecoration: i.checked ? "line-through" : "none" }}>
                            {i.label}
                            {i.checked && i.doneByName && <span className="text-[11px] ml-1" style={{ color: "var(--dim)" }}>· {i.doneByName}</span>}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TemplateEditor({ onChange }: { onChange: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ kind: "OPEN", label: "" });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/checklist/items");
    if (res.ok) setItems((await res.json()).items);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim()) return;
    await fetch("/api/admin/checklist/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ ...form, label: "" }); load(); onChange();
  }
  async function del(id: string) {
    await fetch(`/api/admin/checklist/items/${id}`, { method: "DELETE" });
    load(); onChange();
  }

  return (
    <div>
      <form onSubmit={add} className="p-5 rounded mb-6 grid grid-cols-1 sm:grid-cols-[180px_1fr_auto] gap-3 items-end" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <div><label className="field-label">Lista</label>
          <select className="field-input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            {CHECKLIST_KINDS.map((k) => <option key={k.key} value={k.key} style={{ background: "var(--navy-d)" }}>{k.label}</option>)}
          </select>
        </div>
        <div><label className="field-label">Pozycja</label><input className="field-input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="np. Sprawdź oświetlenie w pokoju" /></div>
        <button type="submit" className="btn-gold" style={{ clipPath: "none", padding: "11px 16px" }}>Dodaj</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CHECKLIST_KINDS.map((k) => (
          <div key={k.key} className="p-5 rounded" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
            <h2 className="font-serif text-sm tracking-[2px] uppercase mb-3" style={{ color: "var(--gold)" }}>{k.label}</h2>
            <ul className="flex flex-col gap-2">
              {items.filter((i) => i.kind === k.key).map((i) => (
                <li key={i.id} className="flex justify-between items-center text-sm" style={{ color: i.active ? "var(--text)" : "var(--dim)" }}>
                  <span>{i.label}</span>
                  <button onClick={() => del(i.id)} className="text-[11px] px-2 py-[2px] rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>Usuń</button>
                </li>
              ))}
              {items.filter((i) => i.kind === k.key).length === 0 && <li className="text-sm" style={{ color: "var(--muted)" }}>Brak pozycji.</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
