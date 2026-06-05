"use client";
import { useEffect, useState, useCallback } from "react";
import type { ResourceConfig, Field } from "@/lib/resourceConfig";
import FileUpload from "./FileUpload";

type Item = Record<string, any>;

function emptyForm(config: ResourceConfig): Item {
  const f: Item = {};
  for (const field of config.fields) {
    f[field.name] = field.default ?? (field.type === "boolean" ? false : field.type === "number" ? 0 : "");
  }
  return f;
}

export default function ResourceManager({
  resource,
  config,
}: {
  resource: string;
  config: ResourceConfig;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null); // null = brak, {} = nowy
  const [form, setForm] = useState<Item>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/${resource}`);
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
    setLoading(false);
  }, [resource]);

  useEffect(() => {
    load();
  }, [load]);

  function startAdd() {
    setForm(emptyForm(config));
    setEditing({});
    setError("");
  }
  function startEdit(item: Item) {
    setForm({ ...item });
    setEditing(item);
    setError("");
  }
  function cancel() {
    setEditing(null);
    setError("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const isNew = editing && !editing.id;
    const url = isNew ? `/api/admin/${resource}` : `/api/admin/${resource}/${editing!.id}`;
    const method = isNew ? "POST" : "PATCH";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        await load();
        setEditing(null);
      } else {
        setError(data.error || "Błąd zapisu");
      }
    } catch {
      setError("Błąd połączenia");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Na pewno usunąć? Tej operacji nie można cofnąć.")) return;
    const res = await fetch(`/api/admin/${resource}/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  async function togglePublish(item: Item) {
    await fetch(`/api/admin/${resource}/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, published: !item.published }),
    });
    load();
  }

  async function toggleRead(item: Item) {
    await fetch(`/api/admin/${resource}/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !item.read }),
    });
    load();
  }

  function setField(name: string, value: any) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function renderCell(item: Item, col: string) {
    const v = item[col];
    const field = config.fields.find((f) => f.name === col);
    if (field?.type === "image" && v) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={v} alt="" className="w-12 h-12 object-cover rounded" />;
    }
    if (field?.type === "boolean") return v ? "✓" : "—";
    if (col === "createdAt" && v) return new Date(v).toLocaleString("pl-PL");
    if (typeof v === "string" && v.length > 60) return v.slice(0, 60) + "…";
    return v ?? "—";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-gold-grad text-3xl flex items-center gap-3">
          <span>{config.icon}</span> {config.label}
        </h1>
        {!config.readOnly && (
          <button onClick={startAdd} className="btn-gold" style={{ clipPath: "none", padding: "11px 24px" }}>
            + Dodaj {config.singular}
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Ładowanie...</p>
      ) : items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Brak pozycji. {!config.readOnly && "Kliknij „Dodaj”, aby utworzyć pierwszą."}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id}>
              <div
                className="flex items-center gap-4 p-3 rounded"
                style={{
                  background: item.read === false ? "rgba(201,168,76,.06)" : "rgba(13,27,42,.6)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex-1 min-w-0 flex items-center gap-4 flex-wrap">
                  {config.listColumns.map((col) => (
                    <div key={col} className="text-sm min-w-0" style={{ color: "var(--text)" }}>
                      {renderCell(item, col)}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {config.readOnly ? (
                    <>
                      <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} className="text-xs px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>
                        {expanded === item.id ? "Zwiń" : "Czytaj"}
                      </button>
                      <button onClick={() => toggleRead(item)} className="text-xs px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>
                        {item.read ? "Oznacz nieprzecz." : "Przeczytane"}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => togglePublish(item)} className="text-xs px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: item.published ? "#7eebb0" : "var(--dim)" }}>
                        {item.published ? "● Widoczny" : "○ Ukryty"}
                      </button>
                      <button onClick={() => startEdit(item)} className="text-xs px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--gold)" }}>
                        Edytuj
                      </button>
                    </>
                  )}
                  <button onClick={() => remove(item.id)} className="text-xs px-3 py-1 rounded" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>
                    Usuń
                  </button>
                </div>
              </div>

              {config.readOnly && expanded === item.id && (
                <div className="p-4 rounded mt-1 text-sm space-y-2" style={{ background: "rgba(13,27,42,.4)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  {config.fields.map((f) =>
                    item[f.name] ? (
                      <div key={f.name}>
                        <span style={{ color: "var(--gold)" }}>{f.label}: </span>
                        {f.name === "email" ? <a href={`mailto:${item[f.name]}`} style={{ color: "var(--gold-l)" }}>{item[f.name]}</a> : item[f.name]}
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formularz (modal) */}
      {editing && (
        <div className="fixed inset-0 z-[5000] flex items-start justify-center p-4 overflow-y-auto" style={{ background: "rgba(0,0,0,.8)" }} onClick={cancel}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={save}
            className="w-full max-w-[640px] my-8 p-6 md:p-8 rounded"
            style={{ background: "var(--navy-d)", border: "1px solid var(--border-h)" }}
          >
            <h2 className="font-display text-gold-grad text-2xl mb-6">
              {editing.id ? "Edytuj" : "Dodaj"} {config.singular}
            </h2>

            {error && (
              <div className="px-4 py-3 text-[13px] mb-4 font-serif" style={{ background: "rgba(239,68,68,.07)", borderLeft: "3px solid #ef4444", color: "#fca5a5" }}>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {config.fields.map((field) => (
                <FieldInput key={field.name} field={field} value={form[field.name]} onChange={(v) => setField(field.name, v)} />
              ))}
            </div>

            <div className="flex gap-3 mt-8 justify-end">
              <button type="button" onClick={cancel} className="btn-outline" style={{ clipPath: "none", padding: "11px 24px" }}>
                Anuluj
              </button>
              <button type="submit" disabled={saving} className="btn-gold" style={{ clipPath: "none", padding: "11px 24px" }}>
                {saving ? "Zapisywanie..." : "Zapisz"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function GalleryField({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  let list: string[] = [];
  try {
    list = value ? JSON.parse(value) : [];
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }
  const update = (arr: string[]) => onChange(JSON.stringify(arr));
  return (
    <div>
      {list.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {list.map((url, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-20 h-20 object-cover rounded" style={{ border: "1px solid var(--border)" }} />
              <button
                type="button"
                onClick={() => update(list.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                style={{ background: "#ef4444", color: "#fff" }}
                title="Usuń"
              >
                ×
              </button>
              <div className="flex justify-between mt-[2px]">
                <button type="button" onClick={() => { if (i > 0) { const a = [...list];[a[i - 1], a[i]] = [a[i], a[i - 1]]; update(a); } }} className="text-[10px]" style={{ color: "var(--muted)" }}>←</button>
                <button type="button" onClick={() => { if (i < list.length - 1) { const a = [...list];[a[i + 1], a[i]] = [a[i], a[i + 1]]; update(a); } }} className="text-[10px]" style={{ color: "var(--muted)" }}>→</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <FileUpload value="" onChange={(url) => url && update([...list, url])} accept="image/*" kind="image" />
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  if (field.type === "boolean") {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
        <span className="text-sm" style={{ color: "var(--text)" }}>{field.label}</span>
      </label>
    );
  }

  return (
    <div>
      <label className="field-label">
        {field.label} {field.required && "*"}
      </label>
      {field.type === "textarea" ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className="field-input h-24 resize-none" placeholder={field.placeholder} />
      ) : field.type === "number" ? (
        <input type="number" value={value ?? 0} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} className="field-input" />
      ) : field.type === "select" ? (
        <select value={value || ""} onChange={(e) => onChange(e.target.value)} className="field-input">
          {field.options?.map((o) => (
            <option key={o.value} value={o.value} style={{ background: "var(--navy-d)" }}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "image" ? (
        <FileUpload value={value || ""} onChange={onChange} accept="image/*" kind="image" />
      ) : field.type === "video" ? (
        <FileUpload value={value || ""} onChange={onChange} accept="video/*" kind="video" />
      ) : field.type === "gallery" ? (
        <GalleryField value={value} onChange={onChange} />
      ) : (
        <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className="field-input" placeholder={field.placeholder} />
      )}
      {field.help && <p className="text-[11px] mt-1" style={{ color: "var(--dim)" }}>{field.help}</p>}
    </div>
  );
}
