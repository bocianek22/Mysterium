"use client";
import { useCallback, useEffect, useState } from "react";

type Ban = { id: string; type: string; value: string; reason?: string | null; createdAt: string };
type Recent = { id: string; customerName?: string | null; customerEmail?: string | null; customerPhone?: string | null; ip?: string | null; start: string; refNo?: string | null };

const TYPE_LABEL: Record<string, string> = { EMAIL: "E-mail", PHONE: "Telefon", IP: "IP" };

export default function BansManager() {
  const [bans, setBans] = useState<Ban[]>([]);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [type, setType] = useState("EMAIL");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const d = await fetch("/api/admin/bans").then((r) => r.ok ? r.json() : { bans: [], recent: [] });
    setBans(d.bans || []); setRecent(d.recent || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add(t: string, v: string, r?: string) {
    if (!v.trim()) return;
    setBusy(true);
    await fetch("/api/admin/bans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: t, value: v, reason: r || null }) });
    setBusy(false); setValue(""); setReason(""); load();
  }
  async function remove(id: string) {
    if (!confirm("Usunąć ten ban?")) return;
    await fetch(`/api/admin/bans/${id}`, { method: "DELETE" }); load();
  }

  const banned = (t: string, v?: string | null) => !!v && bans.some((b) => b.type === t && b.value === (t === "EMAIL" ? v.toLowerCase() : v));

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-gold-grad text-3xl mb-1 flex items-center gap-3"><span>🚫</span> Bany rezerwacji</h1>
      <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>Zablokuj rezerwacje online dla wybranych klientów (e-mail / telefon) lub adresów IP.</p>

      <div className="corner-frame p-5 mb-8" style={{ background: "rgba(13,27,42,.5)", border: "1px solid var(--border)" }}>
        <h2 className="text-sm font-serif tracking-[2px] uppercase mb-3" style={{ color: "var(--gold)" }}>Dodaj ban</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div><label className="field-label">Typ</label><select className="field-input" value={type} onChange={(e) => setType(e.target.value)}><option value="EMAIL" style={{ background: "var(--navy-d)" }}>E-mail</option><option value="PHONE" style={{ background: "var(--navy-d)" }}>Telefon</option><option value="IP" style={{ background: "var(--navy-d)" }}>IP</option></select></div>
          <div className="flex-1"><label className="field-label">Wartość</label><input className="field-input" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === "EMAIL" ? "jan@example.com" : type === "PHONE" ? "+48..." : "1.2.3.4"} /></div>
          <div className="flex-1"><label className="field-label">Powód (opcjonalnie)</label><input className="field-input" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          <button disabled={busy} onClick={() => add(type, value, reason)} className="btn-gold" style={{ clipPath: "none", padding: "10px 20px" }}>Zbanuj</button>
        </div>
      </div>

      <h2 className="text-sm font-serif tracking-[2px] uppercase mb-3" style={{ color: "var(--gold)" }}>Aktywne bany ({bans.length})</h2>
      {bans.length === 0 ? <p className="text-[13px] mb-8" style={{ color: "var(--muted)" }}>Brak banów.</p> : (
        <div className="flex flex-col gap-2 mb-8">
          {bans.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 px-4 py-2 rounded text-[13px]" style={{ background: "rgba(239,68,68,.06)", border: "1px solid rgba(239,68,68,.2)" }}>
              <span style={{ color: "var(--text)" }}><b style={{ color: "#fca5a5" }}>{TYPE_LABEL[b.type]}</b> · {b.value}{b.reason ? ` — ${b.reason}` : ""}</span>
              <button onClick={() => remove(b.id)} className="text-[12px] px-3 py-1 rounded" style={{ border: "1px solid var(--border)", color: "var(--muted)" }}>Odbanuj</button>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-sm font-serif tracking-[2px] uppercase mb-3" style={{ color: "var(--gold)" }}>Ostatnie rezerwacje online</h2>
      {recent.length === 0 ? <p className="text-[13px]" style={{ color: "var(--muted)" }}>Brak rezerwacji online.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr style={{ color: "var(--muted)" }}><th className="text-left py-2">Klient</th><th className="text-left">E-mail</th><th className="text-left">Telefon</th><th className="text-left">IP</th><th></th></tr></thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--border)", color: "var(--text)" }}>
                  <td className="py-2">{r.customerName || "—"}<div style={{ color: "var(--dim)", fontSize: 11 }}>{new Date(r.start).toLocaleDateString("pl-PL")} · {r.refNo}</div></td>
                  <td>{r.customerEmail || "—"}</td>
                  <td>{r.customerPhone || "—"}</td>
                  <td>{r.ip || "—"}</td>
                  <td className="text-right whitespace-nowrap">
                    {r.customerEmail && !banned("EMAIL", r.customerEmail) && <button onClick={() => add("EMAIL", r.customerEmail!, `rez. ${r.refNo || ""}`)} className="text-[11px] px-2 py-1 rounded ml-1" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>ban e-mail</button>}
                    {r.ip && !banned("IP", r.ip) && <button onClick={() => add("IP", r.ip!, `rez. ${r.refNo || ""}`)} className="text-[11px] px-2 py-1 rounded ml-1" style={{ border: "1px solid rgba(239,68,68,.3)", color: "#fca5a5" }}>ban IP</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
