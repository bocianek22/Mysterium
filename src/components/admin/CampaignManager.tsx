"use client";
import { useEffect, useState, useCallback } from "react";

const CHANNELS = [
  { value: "EMAIL", label: "E-mail (do klientów ze zgodą)" },
  { value: "TELEGRAM", label: "Telegram (grupa zespołu)" },
  { value: "BOTH", label: "E-mail + Telegram" },
];

export default function CampaignManager() {
  const [items, setItems] = useState<any[]>([]);
  const [reach, setReach] = useState(0);
  const [form, setForm] = useState({ subject: "", body: "", channel: "EMAIL", audience: "ALL" });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/campaigns");
    if (res.ok) { const d = await res.json(); setItems(d.items); setReach(d.reach); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  async function send() {
    if (!form.subject.trim() || !form.body.trim()) { setMsg("Uzupełnij temat i treść"); return; }
    if (!confirm(`Wysłać kampanię? Kanał: ${form.channel}.`)) return;
    setSending(true); setMsg("");
    const res = await fetch("/api/admin/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await res.json();
    setSending(false);
    setMsg(res.ok ? `✓ ${d.result}` : (d.error || "Błąd wysyłki"));
    if (res.ok) { setForm({ ...form, subject: "", body: "" }); load(); }
  }

  return (
    <div>
      <h1 className="font-display text-gold-grad text-3xl mb-2 flex items-center gap-3"><span>📣</span> Kampanie / newsletter</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
        Wyślij promocję do bazy klientów. Zasięg e-mail (osoby ze zgodą marketingową i adresem): <b style={{ color: "#7eebb0" }}>{reach}</b>.
        <br />Wysyłka e-mail wymaga klucza <b>Resend</b> i zweryfikowanej domeny nadawcy.
      </p>

      <div className="p-5 rounded mb-8 flex flex-col gap-3 max-w-[680px]" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="field-label">Kanał</label>
            <select className="field-input" value={form.channel} onChange={(e) => set("channel", e.target.value)}>
              {CHANNELS.map((c) => <option key={c.value} value={c.value} style={{ background: "var(--navy-d)" }}>{c.label}</option>)}
            </select>
          </div>
          <div><label className="field-label">Grupa odbiorców (tag)</label>
            <input className="field-input" value={form.audience} onChange={(e) => set("audience", e.target.value || "ALL")} placeholder="ALL = wszyscy ze zgodą; lub np. VIP" />
          </div>
        </div>
        <div><label className="field-label">Temat</label><input className="field-input" value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="np. -15% na grę w listopadzie" /></div>
        <div><label className="field-label">Treść</label><textarea className="field-input h-32 resize-none" value={form.body} onChange={(e) => set("body", e.target.value)} placeholder="Treść wiadomości…" /></div>
        <div className="flex items-center gap-3">
          <button onClick={send} disabled={sending} className="btn-gold" style={{ clipPath: "none", padding: "11px 22px" }}>{sending ? "Wysyłanie…" : "Wyślij kampanię"}</button>
          {msg && <span className="text-sm" style={{ color: msg.startsWith("✓") ? "#7eebb0" : "#fca5a5" }}>{msg}</span>}
        </div>
      </div>

      <h2 className="font-serif text-sm tracking-[2px] uppercase mb-3" style={{ color: "var(--gold)" }}>Historia wysyłek</h2>
      {items.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Brak wysłanych kampanii.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((c) => (
            <div key={c.id} className="p-3 rounded text-sm" style={{ background: "rgba(13,27,42,.6)", border: "1px solid var(--border)" }}>
              <div className="flex justify-between flex-wrap gap-2">
                <b style={{ color: "var(--text)" }}>{c.subject}</b>
                <span className="text-[11px]" style={{ color: "var(--muted)" }}>{new Date(c.createdAt).toLocaleString("pl-PL")} · {c.sentByName || ""}</span>
              </div>
              <div className="text-[12px] mt-1" style={{ color: "var(--muted)" }}>{c.channel} · {c.audience} · {c.result}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
